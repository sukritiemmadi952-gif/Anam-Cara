import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api, MODE_PALETTE } from "../lib/api";
import Disclaimer from "../components/Disclaimer";

export default function Modes() {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/modes").then(({ data }) => setModes(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-20">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500" data-testid="modes-eyebrow">
          Choose a feeling
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800 leading-tight" data-testid="modes-heading">
          What sits closest to your <span className="font-soul text-rose-500">heart</span> right now?
        </h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          There is no right answer. Pick whatever feels closest — even if it isn’t perfect.
          You can always come back and choose another later.
        </p>
        <div className="mt-5">
          <Disclaimer subtle testId="modes-disclaimer" />
        </div>
      </div>

      {loading ? (
        <div className="mt-10 text-slate-500" data-testid="modes-loading">Settling in…</div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modes.map((m, idx) => {
            const p = MODE_PALETTE[m.palette] || MODE_PALETTE.confusion;
            return (
              <Link
                key={m.slug}
                to={`/modes/${m.slug}/quiz`}
                data-testid={`mode-card-${m.slug}`}
                className={`group rounded-3xl border ${p.bg} hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all p-7 fade-up`}
                style={{ animationDelay: `${idx * 60}ms`, borderColor: "transparent" }}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                  <div className={`text-xs uppercase tracking-[0.22em] ${p.text} opacity-80`}>
                    {m.tagline}
                  </div>
                </div>
                <h3 className={`mt-4 text-2xl font-semibold ${p.text}`}>{m.name}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{m.description}</p>
                <div className={`mt-6 inline-flex items-center gap-1.5 text-sm ${p.text}`}>
                  Begin <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.6} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
