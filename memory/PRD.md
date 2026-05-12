# Anam Cara — PRD

## Original problem
Build "Anam Cara — A Guided Emotional Reflection Space" for young people (10–20). Soft,
warm, anonymous reflection app with 8 emotional modes (+ optional Happiness & Gratitude),
20-question reflective quizzes with a final open-ended question, gentle post-quiz
reflection (echo notes, coping suggestions, anonymous related story), an anonymous
Reflection Wall with admin moderation, persistent mental-health disclaimer, and
emotionally safe, non-clinical language.

## Architecture
- Backend: FastAPI + MongoDB (motor) — bcrypt + PyJWT admin auth, content served from
  Python static module.
- Frontend: React + Tailwind + shadcn/ui — Nunito (heads) + DM Sans (body), pastel palette
  per /app/design_guidelines.json.
- Anonymous users (no accounts). Single seeded admin via env (ADMIN_EMAIL/ADMIN_PASSWORD).

## User personas
- Young person (10–20) feeling overwhelmed, lonely, anxious, etc., wanting a quiet,
  judgement-free space to reflect.
- Admin / moderator (the site owner) reviewing every anonymous Reflection Wall submission
  before it goes public.

## Core requirements (static)
- 9 emotional modes with soft per-mode palette.
- 20-question quiz per mode; last question is open-ended free text.
- Post-quiz: gentle reflection headline + body, echo notes, coping suggestions, anonymous
  related story (from approved wall items, with curated fallback).
- Reflection Wall: anonymous submissions, admin-only approval, basic word filter for
  obvious harm/spam, no public usernames.
- Persistent disclaimer that this is not a replacement for professional mental health care.
- Mobile-first, accessible, soft motion, data-testids on every interactive element.

## Implemented (2026-02)
- Backend: /api/auth/login|logout|me, /api/modes, /api/modes/{slug}/quiz, /api/quiz/submit,
  /api/wall (GET/POST), /api/admin/reflections (GET/PATCH/DELETE), /api/admin/stats.
- Admin seed on startup; bcrypt hashes; httpOnly cookie + Authorization Bearer fallback.
- Frontend: Home, Modes, Quiz, Reflection, Wall, Wall Submit, About, Admin Login, Admin
  Dashboard, persistent Layout with footer disclaimer.
- 9 modes × 20 questions, static reflections, curated stories, gentle moderation regex.

## Backlog
- P1: Sharable image card of a reflection (no identity, just the headline/echo).
- P1: Optional mood streak (local-only, no account).
- P2: Multi-language support (start with Hindi/Spanish/Portuguese).
- P2: Audio companion (soft soundscape) toggle on quiz screen.
- P2: Curated resource list of professional helplines per country.
