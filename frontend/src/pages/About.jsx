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

      <h2 className="mt-12 text-2xl font-semibold text-slate-800">
        Why I Started <span className="font-soul text-rose-500">Anam Cara</span>
      </h2>
      <p className="mt-4 text-slate-700 leading-relaxed">
        I started Anam Cara at the age of sixteen with one simple belief:
        sometimes, the people who understand pain are the ones who know how to
        offer hope.
      </p>
      <p className="mt-4 text-slate-700 leading-relaxed">
        As someone who has experienced moments of overthinking, silent
        struggles, and the weight of thoughts that are difficult to explain, I
        learned that not everyone finds it easy to speak. For many people —
        especially introverts or those who feel misunderstood — emotions often
        stay unspoken. Those unspoken feelings can slowly become heavier.
      </p>
      <p className="mt-4 text-slate-700 leading-relaxed">
        I have also learned that not everyone has someone they feel safe talking
        to. While loving families and supportive friends can make a world of
        difference, many young people are still searching for a place where they
        can pause, reflect, and feel heard without fear of being judged.
      </p>
      <p className="mt-4 text-slate-700 leading-relaxed">
        As a psychology student, I know I cannot solve every problem or replace
        professional support. But if this space can help someone understand
        themselves a little better, feel a little lighter, or find the courage to
        take the first step toward speaking up, then it has already fulfilled its
        purpose.
      </p>
      <p className="mt-4 text-slate-700 leading-relaxed">
        Anam Cara exists because I believe that hope matters. Even the smallest
        moment of encouragement can become the beginning of healing, confidence,
        and change.
      </p>

      <h2 className="mt-12 text-2xl font-semibold text-slate-800">
        The Purpose of Anam Cara
      </h2>
      <ul className="mt-4 space-y-2 text-slate-700">
        <li>· A guided emotional reflection space</li>
        <li>· A safe anonymous emotional outlet</li>
        <li>· A structured, calm reflective experience for young people</li>
        <li>· A psychologically responsible self-awareness tool</li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold text-slate-800">
        What Anam Cara Doesn’t Replace
      </h2>
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