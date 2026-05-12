import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Leaf, Moon, Sparkles } from "lucide-react";
import Disclaimer from "../components/Disclaimer";

const PRINCIPLES = [
  { icon: Heart,    label: "Witnessed",   blurb: "Your feelings are seen without being judged." },
  { icon: Leaf,     label: "Anonymous",   blurb: "No names. No accounts. No pressure to perform." },
  { icon: Moon,     label: "Gentle",      blurb: "Slow language. Soft pace. Always your speed." },
  { icon: Sparkles, label: "Reflective",  blurb: "Awareness over diagnosis. Pause over fix." },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-rose-100/60 blur-3xl breathe" />
        <div className="absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full bg-sky-100/60 blur-3xl breathe" style={{ animationDelay: "2s" }} />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-16 relative">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500 fade-up" data-testid="hero-eyebrow">
                <span className="h-1 w-6 bg-rose-300 rounded-full" />
                A soul friend, quietly here
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 leading-[1.05] tracking-tight fade-up delay-100" data-testid="hero-heading">
                You are allowed
                <br />
                <span className="font-soul text-rose-500 text-5xl sm:text-6xl lg:text-7xl">to pause.</span>
                <br />
                You are allowed to feel.
              </h1>
              <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed fade-up delay-200">
                Anam Cara is a quiet, anonymous reflection space — a safe friend
                sitting beside you while you sort through what’s heavy. No
                advice. No diagnosis. Just gentle presence.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 fade-up delay-300">
                <Link
                  to="/modes"
                  data-testid="hero-cta-start"
                  className="group inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-7 py-3.5 text-sm hover:bg-slate-700 hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  Begin a reflection
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.6} />
                </Link>
                <Link
                  to="/wall"
                  data-testid="hero-cta-wall"
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 text-slate-700 px-7 py-3.5 text-sm hover:bg-slate-50 transition-all"
                >
                  Read the Reflection Wall
                </Link>
              </div>
              <div className="mt-8 fade-up delay-400">
                <Disclaimer subtle testId="hero-disclaimer" />
              </div>
            </div>

            <div className="lg:col-span-5 fade-up delay-300">
              <div className="relative">
                <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-rose-100/70 blur-2xl" />
                <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-amber-100/70 blur-2xl" />
                <div className="relative rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)]">
                  <img
                    src="https://images.unsplash.com/photo-1759240837736-29a76e7e5076?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80"
                    alt="A soft pastel sky"
                    className="w-full h-[420px] object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/85 backdrop-blur px-5 py-4 border border-white/60">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Today’s whisper</div>
                    <div className="mt-1 text-slate-800 leading-relaxed text-sm">
                      “It’s okay if today only asked for breathing. You are not behind.”
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRINCIPLES.map(({ icon: Icon, label, blurb }, i) => (
            <div
              key={label}
              className={`rounded-3xl bg-white border border-slate-100 p-6 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all fade-up delay-${(i + 1) * 100}`}
              data-testid={`principle-${label.toLowerCase()}`}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-100">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div className="mt-4 font-semibold text-slate-800">{label}</div>
              <div className="mt-1 text-sm text-slate-500 leading-relaxed">{blurb}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <div className="rounded-[2rem] border border-slate-100 bg-white/80 p-8 sm:p-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">How it feels</div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-800 leading-tight">
              Like someone quietly listening, without trying to fix you.
            </h2>
            <p className="mt-5 text-slate-600 leading-relaxed">
              Pick a feeling. Move through a few soft, reflective questions.
              At the end, write whatever needs to be said — only you will see it.
              We’ll offer a gentle reflection, a few coping suggestions, and
              a story from someone else who has felt this way.
            </p>
            <Link
              to="/modes"
              data-testid="home-secondary-cta"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-6 py-3 text-sm hover:bg-slate-700 transition"
            >
              See the reflection modes <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["confusion","anxiety","burnout","overthinking","loneliness","pressure","exhaustion","disconnected","happiness"].map((slug) => (
              <div
                key={slug}
                className="aspect-square rounded-2xl border border-slate-100 flex items-end p-3 text-[11px] text-slate-700 capitalize"
                style={{
                  background:
                    {
                      confusion: "#F1F5F9", anxiety: "#CCFBF1", burnout: "#FFEDD5",
                      overthinking: "#E0E7FF", loneliness: "#E0F2FE", pressure: "#FFE4E6",
                      exhaustion: "#F4F4F5", disconnected: "#FEF3C7", happiness: "#FCE7F3",
                    }[slug],
                }}
              >
                {slug}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
