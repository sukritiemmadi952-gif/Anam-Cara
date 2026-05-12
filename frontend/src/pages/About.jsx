import React from "react";
import { Link } from "react-router-dom";
import Disclaimer from "../components/Disclaimer";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">About</div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-800 leading-tight" data-testid="about-heading">
        What <span className="font-soul text-rose-500">Anam Cara</span> means.
      </h1>
      <p className="mt-5 text-slate-700 leading-relaxed">
        “Anam Cara” is Irish Gaelic for <em>soul friend</em>, a concept gently
        described in the work of John O’Donohue. A soul friend is someone who
        listens without judgement, who sees you fully, and who sits beside you
        without trying to change you.
      </p>
      <p className="mt-4 text-slate-700 leading-relaxed">
        This is what this space hopes to feel like — a small, quiet companion for
        moments when feelings are too tangled to share out loud.
      </p>

      <h2 className="mt-12 text-2xl font-semibold text-slate-800">What this is</h2>
      <ul className="mt-4 space-y-2 text-slate-700">
        <li>· A guided emotional reflection space</li>
        <li>· A safe anonymous emotional outlet</li>
        <li>· A structured, calm reflective experience for young people</li>
        <li>· A psychologically responsible self-awareness tool</li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold text-slate-800">What this is not</h2>
      <ul className="mt-4 space-y-2 text-slate-700">
        <li>· Therapy or counselling</li>
        <li>· Clinical treatment</li>
        <li>· Diagnosis of any kind</li>
        <li>· Crisis support</li>
      </ul>

      <div className="mt-8">
        <Disclaimer testId="about-disclaimer" />
      </div>

      <h2 className="mt-12 text-2xl font-semibold text-slate-800">Privacy, gently</h2>
      <p className="mt-3 text-slate-700 leading-relaxed">
        No sign-up. No usernames. No personal identity required. The reflections
        you write during a quiz live only on your device. Notes submitted to the
        Reflection Wall are reviewed before they appear, and they never carry
        your name.
      </p>

      <div className="mt-12">
        <Link to="/modes" data-testid="about-cta" className="rounded-full bg-slate-900 text-white px-7 py-3 text-sm hover:bg-slate-700 transition">
          Begin a reflection
        </Link>
      </div>
    </div>
  );
}
