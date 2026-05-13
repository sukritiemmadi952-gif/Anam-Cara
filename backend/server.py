from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import uuid
import logging
import random
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from content import MODES, QUIZZES, REFLECTIONS, CURATED_STORIES


# --- Setup ---
mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME")
client = None
db = None
if mongo_url and db_name:
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

app = FastAPI(title="Anam Cara")
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 12  # 12h for a small admin panel

# Basic moderation filter (very gentle catch-net; admin makes the real call)
BANNED_PATTERNS = [
    r"\bkys\b", r"\bkill\s*yourself\b", r"\bsuicid\w*\b", r"\bself.harm\b",
    r"\bn[i1]gg\w*", r"\bf[a@]gg\w*", r"\bretard\w*", r"\bbitch\w*",
    r"http[s]?://", r"\bcontact\s*me\b", r"\bsnapchat\b", r"\binstagram\b",
]
BANNED_RE = re.compile("|".join(BANNED_PATTERNS), re.IGNORECASE)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    _db = require_db()
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await _db.users.find_one({"id": payload["sub"], "role": "admin"}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Admin not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Pydantic models ---
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ReflectionSubmit(BaseModel):
    body: str = Field(min_length=4, max_length=600)
    mode: Optional[str] = None  # optional emotional mode slug


class ReflectionOut(BaseModel):
    id: str
    body: str
    mode: Optional[str] = None
    status: Literal["pending", "approved", "rejected"]
    created_at: str
    flagged: bool = False


class QuizAnswer(BaseModel):
    question_index: int
    value: Optional[str] = None  # for scale: option label; for open: free text


class QuizSubmitIn(BaseModel):
    mode: str
    answers: List[QuizAnswer]
    open_text: Optional[str] = None


# --- Helpers ---
def reflection_doc_to_out(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "body": doc["body"],
        "mode": doc.get("mode"),
        "status": doc["status"],
        "created_at": doc["created_at"],
        "flagged": bool(doc.get("flagged", False)),
    }


def is_flagged(text: str) -> bool:
    return bool(BANNED_RE.search(text or ""))


# --- Routes ---
@api_router.get("/")
async def root():
    return {"app": "Anam Cara", "status": "ok"}


# Auth
@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    _db = require_db()
    email = payload.email.lower().strip()
    user = await _db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized.")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=False,
        samesite="lax", max_age=ACCESS_TOKEN_MINUTES * 60, path="/",
    )
    return {"id": user["id"], "email": user["email"], "role": user["role"], "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


# Modes & Quiz
@api_router.get("/modes")
async def list_modes():
    return MODES


@api_router.get("/modes/{slug}")
async def get_mode(slug: str):
    mode = next((m for m in MODES if m["slug"] == slug), None)
    if not mode:
        raise HTTPException(status_code=404, detail="Mode not found")
    return mode


@api_router.get("/modes/{slug}/quiz")
async def get_quiz(slug: str):
    if slug not in QUIZZES:
        raise HTTPException(status_code=404, detail="Quiz not found")
    mode = next((m for m in MODES if m["slug"] == slug), None)
    return {"mode": mode, "questions": QUIZZES[slug]}


@api_router.post("/quiz/submit")
async def submit_quiz(payload: QuizSubmitIn):
    _db = require_db()
    if payload.mode not in REFLECTIONS:
        raise HTTPException(status_code=404, detail="Mode not found")
    reflection = REFLECTIONS[payload.mode]
    mode = next((m for m in MODES if m["slug"] == payload.mode), None)

    # try pick anonymous related story from approved Reflection Wall first
    story = None
    pool = await _db.reflections.find(
        {"status": "approved", "mode": payload.mode},
        {"_id": 0, "body": 1},
    ).to_list(50)
    if pool:
        story = "Someone wrote: " + random.choice(pool)["body"]
    else:
        story = CURATED_STORIES.get(payload.mode)

    # Store anonymous quiz submission count for analytics (no user-identifying info)
    answer_dump = [a.model_dump() for a in payload.answers]
    submission = {
        "id": str(uuid.uuid4()),
        "mode": payload.mode,
        "answers": answer_dump,
        "open_text": (payload.open_text or "")[:1000],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.quiz_submissions.insert_one(submission)

    return {
        "mode": mode,
        "headline": reflection["headline"],
        "body": reflection["body"],
        "echo": reflection["echo"],
        "coping": reflection["coping"],
        "story": story,
        "disclaimer": "This platform is not a replacement for professional mental health care.",
    }


# Reflection Wall (public)
@api_router.get("/wall")
async def get_wall(limit: int = 30):
    _db = require_db()
    items = await _db.reflections.find(
        {"status": "approved"}, {"_id": 0, "password_hash": 0},
    ).sort("created_at", -1).to_list(min(limit, 100))
    return [reflection_doc_to_out(d) for d in items]


@api_router.post("/wall", response_model=ReflectionOut)
async def submit_reflection(payload: ReflectionSubmit):
    _db = require_db()
    body = payload.body.strip()
    if not body:
        raise HTTPException(status_code=400, detail="Reflection cannot be empty.")
    if payload.mode and payload.mode not in {m["slug"] for m in MODES}:
        raise HTTPException(status_code=400, detail="Unknown mode.")
    flagged = is_flagged(body)
    doc = {
        "id": str(uuid.uuid4()),
        "body": body,
        "mode": payload.mode,
        "status": "pending",
        "flagged": flagged,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.reflections.insert_one(doc)
    return reflection_doc_to_out(doc)


# Admin moderation
@api_router.get("/admin/reflections")
async def admin_list_reflections(
    status: Optional[str] = None,
    admin: dict = Depends(get_current_admin),
):
    _db = require_db()
    query = {}
    if status in {"pending", "approved", "rejected"}:
        query["status"] = status
    items = await _db.reflections.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [reflection_doc_to_out(d) for d in items]


@api_router.patch("/admin/reflections/{rid}")
async def admin_update_reflection(
    rid: str,
    payload: dict,
    admin: dict = Depends(get_current_admin),
):
    _db = require_db()
    new_status = payload.get("status")
    if new_status not in {"pending", "approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Invalid status.")
    res = await _db.reflections.update_one({"id": rid}, {"$set": {"status": new_status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reflection not found.")
    doc = await _db.reflections.find_one({"id": rid}, {"_id": 0})
    return reflection_doc_to_out(doc)


@api_router.delete("/admin/reflections/{rid}")
async def admin_delete_reflection(rid: str, admin: dict = Depends(get_current_admin)):
    _db = require_db()
    res = await _db.reflections.delete_one({"id": rid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reflection not found.")
    return {"ok": True}


@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_current_admin)):
    _db = require_db()
    pending = await _db.reflections.count_documents({"status": "pending"})
    approved = await _db.reflections.count_documents({"status": "approved"})
    rejected = await _db.reflections.count_documents({"status": "rejected"})
    flagged = await _db.reflections.count_documents({"flagged": True, "status": "pending"})
    quizzes = await _db.quiz_submissions.count_documents({})
    return {
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "flagged_pending": flagged,
        "quizzes_completed": quizzes,
    }


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def require_db():
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not configured.")
    return db


@app.on_event("startup")
async def startup():
    if db is None:
        logger.warning("Database is not configured. DB-dependent routes will return 503.")
        return
    _db = db
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@anamcara.app").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "anamcara2026")
    existing = await _db.users.find_one({"email": admin_email})
    if existing is None:
        await _db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user.")
    elif not verify_password(admin_password, existing["password_hash"]):
        await _db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info("Updated admin password.")
    # Indexes
    await _db.users.create_index("email", unique=True)
    await _db.reflections.create_index("created_at")
    await _db.reflections.create_index("status")


@app.on_event("shutdown")
async def shutdown_db_client():
    if client is not None:
        client.close()
