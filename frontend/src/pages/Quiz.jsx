import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api, MODE_PALETTE, formatError } from "../lib/api";
import Disclaimer from "../components/Disclaimer";

export default function Quiz() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [openText, setOpenText] = useState("");
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/modes/${slug}/quiz`).then(({ data }) => setData(data))
      .catch((e) => setError(formatError(e)));
  }, [slug]);

  const palette = data?.mode ? (MODE_PALETTE[data.mode.palette] || MODE_PALETTE.confusion) : MODE_PALETTE.confusion;
  const questions = data?.questions || [];
  const total = questions.length;
  const progress = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;
  const currentQ = questions[index];
  const isOpen = currentQ?.type === "open";

  const canNext = useMemo(() => {
    if (!currentQ) return false;
    if (isOpen) return openText.trim().length >= 0; // open is optional but encouraged
    return Boolean(answers[index]);
  }, [currentQ, answers, index, openText, isOpen]);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        mode: slug,
        answers: Object.entries(answers).map(([qi, value]) => ({
          question_index: Number(qi),
          value,
        })),
        open_text: openText.trim(),
      };
      const { data: result } = await api.post("/quiz/submit", payload);
      sessionStorage.setItem(`anamcara_reflection_${slug}`, JSON.stringify({ ...result, open_text: openText.trim() }));
      navigate(`/reflection/${slug}`);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !data) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center">
        <div className="text-slate-700" data-testid="quiz-error">{error}</div>
      </div>
    );
  }

  if (!data) {
    return <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-slate-500" data-testid="quiz-loading">Settling in…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/modes")}
          data-testid="quiz-back"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.6} /> Modes
        </button>
        <span className="text-slate-300">/</span>
        <span className={`text-sm ${palette.text}`}>{data.mode.name}</span>
      </div>

      <div className={`rounded-3xl ${palette.bg} p-6 sm:p-8 border border-transparent`}>
        <div className="flex items-center justify-between text-xs">
          <span className={`uppercase tracking-[0.22em] ${palette.text} opacity-80`}>
            {data.mode.tagline}
          </span>
          <span className="text-slate-500" data-testid="quiz-progress-label">
            {Math.min(index + 1, total)} / {total}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full bg-white/70 rounded-full overflow-hidden">
          <div
            className={`h-full ${palette.dot} transition-all duration-500`}
            style={{ width: `${progress}%` }}
            data-testid="quiz-progress-bar"
          />
        </div>
      </div>

      <div className="mt-8 fade-up" key={index}>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 leading-snug" data-testid="quiz-question">
          {currentQ.text}
        </h2>

        {!isOpen ? (
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt) => {
              const selected = answers[index] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setAnswers((a) => ({ ...a, [index]: opt }))}
                  data-testid={`quiz-option-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`text-left rounded-2xl border px-5 py-4 transition-all ${
                    selected
                      ? `${palette.bg} ${palette.text} border-transparent ring-2 ${palette.ring}`
                      : "bg-white text-slate-700 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm">{opt}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <textarea
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              maxLength={1000}
              rows={6}
              data-testid="quiz-open-text"
              placeholder="Write freely. No one else will see this. There’s no right way to say it."
              className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-100"
            />
            <div className="mt-2 text-xs text-slate-400 text-right">{openText.length} / 1000</div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-rose-600" data-testid="quiz-submit-error">{error}</div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            data-testid="quiz-prev"
            className="text-sm text-slate-500 disabled:opacity-30 hover:text-slate-800"
          >
            ← Back
          </button>

          {index < total - 1 ? (
            <button
              onClick={() => setIndex((i) => i + 1)}
              disabled={!canNext}
              data-testid="quiz-next"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-6 py-3 text-sm disabled:opacity-30 hover:bg-slate-700 transition"
            >
              Continue <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              data-testid="quiz-submit"
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 text-white px-7 py-3 text-sm disabled:opacity-50 hover:bg-rose-600 transition"
            >
              {submitting ? "Reflecting…" : "See my reflection"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-10">
        <Disclaimer subtle testId="quiz-disclaimer" />
      </div>
    </div>
  );
}
