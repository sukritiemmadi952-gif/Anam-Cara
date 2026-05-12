"""Anam Cara backend test suite."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://safe-space-reflect.preview.emergentagent.com").rstrip("/")
# Read frontend env which is the public URL — fall back if missing
try:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
except FileNotFoundError:
    pass

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@anamcara.app"
ADMIN_PASSWORD = "anamcara2026"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("role") == "admin"
    assert data.get("token")
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Modes ----------
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200

def test_modes_nine(s):
    r = s.get(f"{API}/modes")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 9, f"expected 9 modes got {len(data)}"
    for m in data:
        assert "slug" in m and "name" in m


def test_quiz_each_mode(s):
    modes = s.get(f"{API}/modes").json()
    for m in modes:
        r = s.get(f"{API}/modes/{m['slug']}/quiz")
        assert r.status_code == 200, f"quiz fetch failed for {m['slug']}"
        body = r.json()
        qs = body["questions"]
        assert len(qs) == 20, f"{m['slug']} has {len(qs)} questions, expected 20"
        assert qs[-1].get("type") == "open", f"{m['slug']} last question type {qs[-1].get('type')}"


def test_quiz_not_found(s):
    r = s.get(f"{API}/modes/bogus/quiz")
    assert r.status_code == 404


# ---------- Quiz submit ----------
def test_quiz_submit_returns_reflection(s):
    modes = s.get(f"{API}/modes").json()
    slug = modes[0]["slug"]
    payload = {
        "mode": slug,
        "answers": [{"question_index": i, "value": "Sometimes"} for i in range(19)],
        "open_text": "I am exploring my feelings."
    }
    r = s.post(f"{API}/quiz/submit", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    for key in ("headline", "body", "echo", "coping", "story", "disclaimer"):
        assert key in data, f"missing {key}"
    assert isinstance(data["echo"], list)
    assert isinstance(data["coping"], list)
    assert data["story"]  # curated fallback when wall empty


def test_quiz_submit_unknown_mode(s):
    r = s.post(f"{API}/quiz/submit", json={"mode": "nope", "answers": []})
    assert r.status_code == 404


# ---------- Wall ----------
def test_wall_post_too_short(s):
    r = s.post(f"{API}/wall", json={"body": "hi"})
    assert r.status_code == 422  # pydantic min_length


def test_wall_post_creates_pending(s):
    body = f"TEST_ I am feeling reflective and grateful today {uuid.uuid4().hex[:6]}"
    r = s.post(f"{API}/wall", json={"body": body, "mode": "anxiety"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["status"] == "pending"
    assert data["flagged"] is False
    return data["id"]


def test_wall_post_flags_url(s):
    body = "Visit me at http://example.com please"
    r = s.post(f"{API}/wall", json={"body": body})
    assert r.status_code == 200
    assert r.json()["flagged"] is True


def test_wall_get_only_approved(s, auth_headers):
    # Create pending
    r = s.post(f"{API}/wall", json={"body": "TEST_ pending should not appear here yet"})
    pid = r.json()["id"]
    wall = s.get(f"{API}/wall").json()
    assert all(w["status"] == "approved" for w in wall)
    assert all(w["id"] != pid for w in wall)


# ---------- Auth ----------
def test_login_invalid(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_me_requires_auth(s):
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_with_token(s, auth_headers):
    r = requests.get(f"{API}/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["role"] == "admin"


# ---------- Admin ----------
def test_admin_reflections_requires_auth():
    r = requests.get(f"{API}/admin/reflections")
    assert r.status_code == 401


def test_admin_reflections_list(s, auth_headers):
    for st in ("pending", "approved", "rejected"):
        r = requests.get(f"{API}/admin/reflections?status={st}", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


def test_admin_approve_then_appears_on_wall(s, auth_headers):
    body = f"TEST_ approve me {uuid.uuid4().hex[:6]}"
    rid = s.post(f"{API}/wall", json={"body": body, "mode": "happiness"}).json()["id"]
    r = requests.patch(f"{API}/admin/reflections/{rid}", json={"status": "approved"}, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "approved"
    wall = s.get(f"{API}/wall").json()
    assert any(w["id"] == rid for w in wall)

    # Now reject -> should disappear
    r = requests.patch(f"{API}/admin/reflections/{rid}", json={"status": "rejected"}, headers=auth_headers)
    assert r.status_code == 200
    wall = s.get(f"{API}/wall").json()
    assert all(w["id"] != rid for w in wall)

    # cleanup
    requests.delete(f"{API}/admin/reflections/{rid}", headers=auth_headers)


def test_admin_delete(s, auth_headers):
    rid = s.post(f"{API}/wall", json={"body": "TEST_ delete me please now"}).json()["id"]
    r = requests.delete(f"{API}/admin/reflections/{rid}", headers=auth_headers)
    assert r.status_code == 200
    # Try delete again -> 404
    r = requests.delete(f"{API}/admin/reflections/{rid}", headers=auth_headers)
    assert r.status_code == 404


def test_admin_stats(s, auth_headers):
    r = requests.get(f"{API}/admin/stats", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    for k in ("pending", "approved", "rejected", "flagged_pending", "quizzes_completed"):
        assert k in data
        assert isinstance(data[k], int)


def test_quiz_story_uses_approved_wall(s, auth_headers):
    """When there's an approved wall item in a mode, story should reference it."""
    unique = f"TEST_unique_phrase_{uuid.uuid4().hex[:8]}"
    body = f"{unique} I am learning to breathe through overwhelm."
    rid = s.post(f"{API}/wall", json={"body": body, "mode": "burnout"}).json()["id"]
    requests.patch(f"{API}/admin/reflections/{rid}", json={"status": "approved"}, headers=auth_headers)

    # Submit quiz a few times; story should sometimes equal the approved one
    seen_wall_story = False
    for _ in range(5):
        r = s.post(f"{API}/quiz/submit", json={"mode": "burnout", "answers": [], "open_text": ""})
        if unique in (r.json().get("story") or ""):
            seen_wall_story = True
            break
    # cleanup
    requests.delete(f"{API}/admin/reflections/{rid}", headers=auth_headers)
    assert seen_wall_story, "Approved wall story should be used in quiz response"
