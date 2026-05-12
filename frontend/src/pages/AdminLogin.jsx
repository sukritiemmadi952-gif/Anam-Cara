import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function AdminLogin() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) navigate("/admin");
    else setError(res.error);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white/80 backdrop-blur p-8 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)]">
        <div className="font-soul text-3xl text-slate-800">Admin</div>
        <p className="mt-1 text-sm text-slate-500">Quiet moderation for the Reflection Wall.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.22em] text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="admin-login-email"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-100"
              placeholder="you@anamcara.app"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.22em] text-slate-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="admin-login-password"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-100"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-sm text-rose-600" data-testid="admin-login-error">{error}</div>}
          <button
            type="submit"
            disabled={busy}
            data-testid="admin-login-submit"
            className="w-full rounded-full bg-slate-900 text-white py-3 text-sm disabled:opacity-50 hover:bg-slate-700 transition"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-400 text-center">
          <Link to="/" className="hover:text-slate-700">← back to home</Link>
        </div>
      </div>
    </div>
  );
}
