import React from "react";

export default function Disclaimer({ subtle = false, testId = "disclaimer-banner" }) {
  return (
    <div
      data-testid={testId}
      className={`rounded-2xl border ${
        subtle
          ? "bg-white/70 border-slate-100 text-slate-600"
          : "bg-rose-50/70 border-rose-100 text-slate-700"
      } px-5 py-3 text-xs sm:text-sm leading-relaxed`}
    >
      A gentle note — Anam Cara is a reflection space, not therapy. It is{" "}
      <strong>not a replacement for professional mental health care</strong>.
    </div>
  );
}
