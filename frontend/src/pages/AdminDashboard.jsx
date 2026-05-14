import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Check, Trash2, X, LogOut, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../lib/auth";
import { api, MODE_PALETTE, formatError } from "../lib/api";

function QuizCard({ quiz, busyId, onApprove, onReject, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const answers = quiz.answers || [];

  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-5" data-testid={`admin-quiz-${quiz.id}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="uppercase tracking-[0.22em] text-indigo-500 opacity-80 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" /> Quiz · {quiz.mode || "unknown"}
        </span>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            quiz.status === "approved" ? "bg-emerald-100 text-emerald-700"
            : quiz.status === "rejected" ? "bg-rose-100 text-rose-700"
            : "bg-amber-100 text-amber-700"
          }`}>
            {quiz.status || "pending"}
          </span>
          <span className="text-slate-400">{new Date(quiz.created_at).toLocaleString()}</span>
        </div>
      </div>

      {quiz.open_text && (
        <p className="mt-3 text-slate-700 leading-relaxed">"{quiz.open_text}"</p>
      )}

      {answers.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Hide" : "Show"} answers ({answers.length})
          </button>
          {expanded && (
            <div className="mt-3 space-y-2">
              {answers.map((a, i) => (
                <div key={i} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <p className="text-slate-500 text-xs font-medium mb-0.5">Q{i + 1}</p>
                  <p className="text-slate-700">
                    <span className="font-medium">Answer:</span>{" "}
                    {a.value ?? <span className="italic text-slate-400">no answer</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        {quiz.status !== "approved" && (
          <button
            onClick={() => onApprove(quiz.id)}
            disabled={busyId === quiz.id}
            data-testid={`admin-quiz-approve-${quiz.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-4 py-1.5 text-sm hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            <Check className="h-3.5 w-3.5" /> Approve
          </button>
        )}
        {quiz.status !== "rejected" && (
          <button
            onClick={() => onReject(quiz.id)}
            disabled={busyId === quiz.id}
            data-testid={`admin-quiz-reject-${quiz.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-700 border border-slate-200 px-4 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <X className="h-3.5 w-3.5" /> Reject
          </button>
        )}
        <button
          onClick={() => onDelete(quiz.id)}
          disabled={busyId === quiz.id}
          data-testid={`admin-quiz-delete-${quiz.id}`}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 text-sm hover:bg-rose-100 disabled:opacity-50 transition"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { admin, loading, logout } = useAuth();
  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const isQuizTab = (t) => ["quizzes_pending", "quizzes_approved", "quizzes_rejected"].includes(t);

  const load = async (which = tab) => {
    setRefreshing(true);
    setError("");
    try {
      if (isQuizTab(which)) {
        const statusMap = {
          quizzes_pending: "pending",
          quizzes_approved: "approved",
          quizzes_rejected: "rejected",
        };
        const [{ data: qList }, { data: s }] = await Promise.all([
          api.get(`/admin/quiz-submissions?status=${statusMap[which]}`),
          api.get("/admin/stats"),
        ]);
        setQuizzes(qList);
        setItems([]);
        setStats(s);
      } else {
        const [{ data: list }, { data: s }] = await Promise.all([
          api.get(`/admin/reflections?status=${which}`),
          api.get("/admin/stats"),
        ]);
        setItems(list);
        setQuizzes([]);
        setStats(s);
      }
    } catch (e) {
      setError(formatError(e));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (admin) load(tab);
    // eslint-disable-next-line
  }, [admin, tab]);

  if (loading) return <div className="px-5 py-20 text-slate-500">Loading…</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const updateStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/admin/reflections/${id}`, { status });
      setItems((arr) => arr.filter((r) => r.id !== id));
      load(tab);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusyId(null);
    }
  };

  const updateQuizStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/admin/quiz-submissions/${id}`, { status });
      setQuizzes((arr) => arr.filter((q) => q.id !== id));
      load(tab);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/admin/reflections/${id}`);
      setItems((arr) => arr.filter((r) => r.id !== id));
      load(tab);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusyId(null);
    }
  };

  const removeQuiz = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/admin/quiz-submissions/${id}`);
      setQuizzes((arr) => arr.filter((q) => q.id !== id));
      load(tab);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Moderation</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-800" data-testid="admin-heading">
            Reflection Wall
          </h1>
          <p className="mt-1 text-sm text-slate-500">Signed in as {admin.email}</p>
        </div>
        <button
          onClick={logout}
          data-testid="admin-logout"
          className="inline-flex items-center gap-2 self-start rounded-full bg-white border border-slate-200 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50 transition"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.6} /> Sign out
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { k: "pending",          label: "Pending",       color: "bg-amber-50 text-amber-800" },
            { k: "approved",         label: "Approved",      color: "bg-emerald-50 text-emerald-800" },
            { k: "rejected",         label: "Rejected",      color: "bg-rose-50 text-rose-800" },
            { k: "flagged_pending",  label: "Flagged",       color: "bg-orange-50 text-orange-800" },
            { k: "quizzes_completed",label: "Quizzes Pending", color: "bg-indigo-50 text-indigo-800" },
          ].map((s) => (
            <div
              key={s.k}
              className={`rounded-2xl ${s.color} px-4 py-3 ${s.k === "quizzes_completed" ? "cursor-pointer" : ""}`}
              data-testid={`admin-stat-${s.k}`}
              onClick={s.k === "quizzes_completed" ? () => setTab("quizzes_pending") : undefined}
            >
              <div className="text-2xl font-semibold">{stats[s.k] ?? 0}</div>
              <div className="text-xs uppercase tracking-[0.18em] opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab bar — single, unified */}
      <div className="mt-8 flex items-center gap-2 flex-wrap">

        {/* Reflection tabs */}
        {/* {[
          { key: "pending",  label: "Pending"  },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            data-testid={`admin-tab-${t.key}`}
            className={`rounded-full px-4 py-2 text-sm transition ${
              tab === t.key
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))} */}

        {/* <span className="text-slate-300 px-1 select-none">|</span> */}

        {/* Quiz tabs */}
        {[
          { key: "quizzes_pending",  label: "Quizzes"     },
          { key: "quizzes_approved", label: "Q·Approved"  },
          { key: "quizzes_rejected", label: "Q·Rejected"  },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            data-testid={`admin-tab-${t.key}`}
            className={`rounded-full px-4 py-2 text-sm transition flex items-center gap-1.5 ${
              tab === t.key
                ? "bg-indigo-700 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {t.label}
            {t.key === "quizzes_pending" && (stats?.quizzes_completed ?? 0) > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                tab === t.key ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-700"
              }`}>
                {stats.quizzes_completed}
              </span>
            )}
          </button>
        ))}

        <button
          onClick={() => load(tab)}
          data-testid="admin-refresh"
          className="ml-auto rounded-full bg-white border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
        >
          {refreshing ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-sm text-rose-600" data-testid="admin-error">{error}</div>
      )}

      {/* Quiz content */}
      {isQuizTab(tab) && (
        quizzes.length === 0 ? (
          <div
            className="mt-10 rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500"
            data-testid="admin-quizzes-empty"
          >
            No quizzes here right now.
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                busyId={busyId}
                onApprove={(id) => updateQuizStatus(id, "approved")}
                onReject={(id) => updateQuizStatus(id, "rejected")}
                onDelete={removeQuiz}
              />
            ))}
          </div>
        )
      )}

      {/* Reflection content */}
      {!isQuizTab(tab) && (
        items.length === 0 ? (
          <div
            className="mt-10 rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500"
            data-testid="admin-empty"
          >
            Nothing here right now.
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {items.map((r) => {
              const p = r.mode
                ? (MODE_PALETTE[r.mode] || MODE_PALETTE.confusion)
                : MODE_PALETTE.confusion;
              return (
                <div
                  key={r.id}
                  className="rounded-3xl bg-white border border-slate-100 p-5"
                  data-testid={`admin-item-${r.id}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`uppercase tracking-[0.22em] ${p.text} opacity-80`}>
                      {r.mode || "Reflection"}
                    </span>
                    <div className="flex items-center gap-2">
                      {r.flagged && (
                        <span
                          className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-[10px]"
                          data-testid={`admin-flag-${r.id}`}
                        >
                          flagged
                        </span>
                      )}
                      <span className="text-slate-400">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-slate-700 leading-relaxed">"{r.body}"</p>
                  <div className="mt-4 flex items-center gap-2">
                    {tab !== "approved" && (
                      <button
                        onClick={() => updateStatus(r.id, "approved")}
                        disabled={busyId === r.id}
                        data-testid={`admin-approve-${r.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-4 py-1.5 text-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}
                    {tab !== "rejected" && (
                      <button
                        onClick={() => updateStatus(r.id, "rejected")}
                        disabled={busyId === r.id}
                        data-testid={`admin-reject-${r.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-700 border border-slate-200 px-4 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    )}
                    <button
                      onClick={() => remove(r.id)}
                      disabled={busyId === r.id}
                      data-testid={`admin-delete-${r.id}`}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 text-sm hover:bg-rose-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}