import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, BookHeart, Coffee } from "lucide-react";
import { api, MODE_PALETTE, formatError } from "../lib/api";
import Disclaimer from "../components/Disclaimer";

export default function Reflection() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [shareError, setShareError] = useState("");
  const [shared, setShared] = useState(false);
  const [shareText, setShareText] = useState("");

  useEffect(() => {
    const cached = sessionStorage.getItem(`anamcara_reflection_${slug}`);
    if (cached) {
      try { setData(JSON.parse(cached)); return; } catch (e) { void e; }
    }
    // fallback: re-fetch reflection (without quiz answers)
    api.post("/quiz/submit", { mode: slug, answers: [], open_text: "" })
      .then(({ data }) => setData(data));
  }, [slug]);

  const submitToWall = async () => {
    setShareError("");
    if (!shareText.trim() || shareText.trim().length < 4) {
      setShareError("Please write a few words before sharing.");
      return;
    }
    try {
      await api.post("/wall", { body: shareText.trim(), mode: slug });
      setShared(true);
      setShareText("");
    } catch (e) {
      setShareError(formatError(e));
    }
  };

  if (!data) {
    return <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-slate-500" data-testid="reflection-loading">Holding space…</div>;
  }

  const palette = MODE_PALETTE[data.mode?.palette] || MODE_PALETTE.confusion;

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <button
        onClick={() => navigate("/modes")}
        data-testid="reflection-back"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.6} /> Choose another feeling
      </button>

      <div className={`rounded-[2rem] ${palette.bg} p-8 sm:p-12 fade-up`}>
        <div className={`text-xs uppercase tracking-[0.24em] ${palette.text} opacity-80`}>
          {data.mode?.name}
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-800 leading-tight" data-testid="reflection-headline">
          {data.headline}
        </h1>
        <p className="mt-5 text-slate-700 leading-relaxed" data-testid="reflection-body">
          {data.body}
        </p>
      </div>

      {data.open_text && (
        <div className="mt-8 rounded-3xl bg-white border border-slate-100 p-6 fade-up delay-100">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">What you wrote</div>
          <p className="mt-3 text-slate-700 leading-relaxed font-soul text-2xl" data-testid="reflection-user-text">“{data.open_text}”</p>
          <div className="mt-3 text-sm text-slate-500">
            Whatever you wrote is allowed to be true. You don’t have to fix it tonight.
          </div>
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-4 fade-up delay-200">
        <div className="rounded-3xl bg-white border border-slate-100 p-7">
          <div className="flex items-center gap-2 text-slate-700">
            <Sparkles className="h-4 w-4 text-rose-400" strokeWidth={1.6} />
            <div className="text-xs uppercase tracking-[0.22em]">Echo notes</div>
          </div>
          <ul className="mt-4 space-y-3 text-slate-700">
            {data.echo?.map((line, i) => (
              <li key={i} className="leading-relaxed text-[15px]" data-testid={`reflection-echo-${i}`}>
                <span className="text-rose-400">•</span> {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-white border border-slate-100 p-7">
          <div className="flex items-center gap-2 text-slate-700">
            <Coffee className="h-4 w-4 text-amber-500" strokeWidth={1.6} />
            <div className="text-xs uppercase tracking-[0.22em]">Small things you could try</div>
          </div>
          <ul className="mt-4 space-y-3 text-slate-700">
            {data.coping?.map((line, i) => (
              <li key={i} className="leading-relaxed text-[15px]" data-testid={`reflection-coping-${i}`}>
                <span className="text-amber-500">·</span> {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {data.story && (
        <div className="mt-8 rounded-3xl border border-slate-100 bg-white/80 p-7 fade-up delay-300">
          <div className="flex items-center gap-2 text-slate-700">
            <BookHeart className="h-4 w-4 text-sky-500" strokeWidth={1.6} />
            <div className="text-xs uppercase tracking-[0.22em]">From someone else</div>
          </div>
          <p className="mt-4 text-slate-700 leading-relaxed font-soul text-2xl" data-testid="reflection-story">
            {data.story}
          </p>
          <div className="mt-3 text-xs text-slate-400">
            Shared anonymously by another person who once felt this way.
          </div>
        </div>
      )}

      <div className="mt-10 rounded-3xl bg-white border border-slate-100 p-7 fade-up delay-300">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Share gently (optional)</div>
        <h3 className="mt-2 text-lg text-slate-800">
          Would you like to share a sentence on the Reflection Wall?
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Completely anonymous. Reviewed by a moderator before appearing — to keep the wall a soft place.
        </p>
        {shared ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm" data-testid="share-success">
            Thank you for sharing. Your reflection is gently being read.
          </div>
        ) : (
          <>
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              maxLength={600}
              rows={3}
              placeholder="A line you’d like to leave for someone else who feels this way…"
              data-testid="reflection-share-input"
              className="mt-3 w-full rounded-2xl border border-slate-200 p-4 focus:outline-none focus:ring-2 focus:ring-slate-100 text-slate-700"
            />
            {shareError && <div className="mt-2 text-sm text-rose-600" data-testid="share-error">{shareError}</div>}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">{shareText.length} / 600</span>
              <button
                onClick={submitToWall}
                data-testid="reflection-share-submit"
                className="rounded-full bg-slate-900 text-white px-6 py-2.5 text-sm hover:bg-slate-700 transition"
              >
                Share quietly
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          to="/modes"
          data-testid="reflection-cta-again"
          className="rounded-full bg-slate-900 text-white px-6 py-3 text-sm hover:bg-slate-700 transition"
        >
          Try another reflection
        </Link>
        <Link
          to="/wall"
          data-testid="reflection-cta-wall"
          className="rounded-full bg-white border border-slate-200 text-slate-700 px-6 py-3 text-sm hover:bg-slate-50 transition"
        >
          Visit the Reflection Wall
        </Link>
      </div>

      <div className="mt-10">
        <Disclaimer testId="reflection-disclaimer" />
      </div>
    </div>
  );
}
