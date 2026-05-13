import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCcw } from "lucide-react";
import { api, MODE_PALETTE, formatError } from "../lib/api";
import Disclaimer from "../components/Disclaimer";

export default function Wall() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/wall");
      setItems(data);
    } catch (e) {
      setError(formatError(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500" data-testid="wall-eyebrow">
            Reflection wall
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800 leading-tight" data-testid="wall-heading">
            Quiet words from <span className="font-soul text-rose-500">soft humans</span>.
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed">
            Anonymous reflections from people who have felt what you might be
            feeling. Every note is gently reviewed before it appears.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            data-testid="wall-refresh"
            className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 text-sm hover:bg-slate-50 transition"
          >
            <RefreshCcw className="h-4 w-4" strokeWidth={1.6} /> Refresh
          </button>
          <Link
            to="/wall/submit"
            data-testid="wall-submit-cta"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-5 py-2.5 text-sm hover:bg-slate-700 transition"
          >
            <Plus className="h-4 w-4" strokeWidth={1.8} /> Share a reflection
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <Disclaimer subtle testId="wall-disclaimer" />
      </div>
      {error && <div className="mt-5 text-sm text-rose-600" data-testid="wall-error">{error}</div>}

      {loading ? (
        <div className="mt-12 text-slate-500" data-testid="wall-loading">Gathering quiet voices…</div>
      ) : items.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-slate-200 p-10 text-center" data-testid="wall-empty">
          <div className="font-soul text-3xl text-slate-700">It’s quiet here, for now.</div>
          <p className="mt-2 text-slate-500">Be the first to leave a gentle note for someone else.</p>
          <Link
            to="/wall/submit"
            data-testid="wall-empty-cta"
            className="mt-5 inline-flex rounded-full bg-slate-900 text-white px-6 py-3 text-sm hover:bg-slate-700 transition"
          >
            Share quietly
          </Link>
        </div>
      ) : (
        <div className="mt-10 columns-1 md:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {items.map((r, i) => {
            const p = r.mode ? (MODE_PALETTE[r.mode] || MODE_PALETTE.confusion) : MODE_PALETTE.confusion;
            return (
              <div
                key={r.id}
                className={`mb-4 break-inside-avoid rounded-3xl border border-slate-100 p-6 fade-up ${p.bg}`}
                style={{ animationDelay: `${(i % 8) * 60}ms` }}
                data-testid={`wall-card-${r.id}`}
              >
                <div className={`text-[10px] uppercase tracking-[0.22em] ${p.text} opacity-80`}>
                  {r.mode || "Reflection"}
                </div>
                <p className="mt-3 text-slate-700 leading-relaxed font-soul text-xl">
                  “{r.body}”
                </p>
                <div className="mt-3 text-[11px] text-slate-400">
                  Shared anonymously · {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
