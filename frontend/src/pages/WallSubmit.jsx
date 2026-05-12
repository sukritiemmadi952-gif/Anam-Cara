import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, formatError } from "../lib/api";
import Disclaimer from "../components/Disclaimer";

export default function WallSubmit() {
  const navigate = useNavigate();
  const [modes, setModes] = useState([]);
  const [mode, setMode] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get("/modes").then(({ data }) => setModes(data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (body.trim().length < 4) {
      setError("Please write a few more words.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/wall", { body: body.trim(), mode: mode || null });
      setDone(true);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
        <div className="font-soul text-4xl text-rose-500" data-testid="wall-submit-success-headline">Thank you.</div>
        <p className="mt-3 text-slate-700 leading-relaxed">
          Your reflection is gently being read. If it feels right for the wall,
          it will appear soon — quietly, without your name.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/wall" data-testid="wall-submit-back-wall" className="rounded-full bg-slate-900 text-white px-6 py-3 text-sm hover:bg-slate-700 transition">
            Read the Wall
          </Link>
          <Link to="/" data-testid="wall-submit-back-home" className="rounded-full bg-white border border-slate-200 text-slate-700 px-6 py-3 text-sm hover:bg-slate-50 transition">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
      <button
        onClick={() => navigate("/wall")}
        data-testid="wall-submit-back"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.6} /> Reflection Wall
      </button>

      <h1 className="text-3xl sm:text-4xl font-semibold text-slate-800 leading-tight" data-testid="wall-submit-heading">
        Leave a soft note for someone.
      </h1>
      <p className="mt-3 text-slate-600 leading-relaxed">
        Share a sentence or two anonymously. A moderator will read it gently before it appears
        on the wall — so the space stays safe for everyone.
      </p>

      <form onSubmit={submit} className="mt-8 rounded-3xl bg-white border border-slate-100 p-6">
        <label className="text-xs uppercase tracking-[0.22em] text-slate-500">Which feeling fits closest? <span className="lowercase">(optional)</span></label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("")}
            data-testid="wall-submit-mode-none"
            className={`rounded-full px-4 py-1.5 text-sm border transition ${
              mode === "" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            none
          </button>
          {modes.map((m) => (
            <button
              type="button"
              key={m.slug}
              onClick={() => setMode(m.slug)}
              data-testid={`wall-submit-mode-${m.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm border transition ${
                mode === m.slug ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <label className="mt-6 block text-xs uppercase tracking-[0.22em] text-slate-500">Your reflection</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={600}
          rows={5}
          data-testid="wall-submit-body"
          placeholder="Write whatever you’d want someone else to read on a hard day."
          className="mt-3 w-full rounded-2xl border border-slate-200 p-4 focus:outline-none focus:ring-2 focus:ring-slate-100 text-slate-700"
        />

        {error && <div className="mt-3 text-sm text-rose-600" data-testid="wall-submit-error">{error}</div>}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">{body.length} / 600</span>
          <button
            type="submit"
            disabled={submitting}
            data-testid="wall-submit-button"
            className="rounded-full bg-slate-900 text-white px-7 py-3 text-sm disabled:opacity-50 hover:bg-slate-700 transition"
          >
            {submitting ? "Sending…" : "Share quietly"}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <Disclaimer testId="wall-submit-disclaimer" />
      </div>
    </div>
  );
}
