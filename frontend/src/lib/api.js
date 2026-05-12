import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

const TOKEN_KEY = "anamcara_admin_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatError(err) {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || "Something went quiet on our side. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (typeof e?.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (typeof detail?.msg === "string") return detail.msg;
  return String(detail);
}

export const MODE_PALETTE = {
  confusion:    { bg: "bg-slate-50",   text: "text-slate-800",  ring: "ring-slate-200",  dot: "bg-slate-300",   soft: "#F1F5F9" },
  anxiety:      { bg: "bg-teal-50",    text: "text-teal-800",   ring: "ring-teal-200",   dot: "bg-teal-300",    soft: "#CCFBF1" },
  burnout:      { bg: "bg-orange-50",  text: "text-orange-800", ring: "ring-orange-200", dot: "bg-orange-300",  soft: "#FFEDD5" },
  overthinking: { bg: "bg-indigo-50",  text: "text-indigo-800", ring: "ring-indigo-200", dot: "bg-indigo-300",  soft: "#E0E7FF" },
  loneliness:   { bg: "bg-sky-50",     text: "text-sky-800",    ring: "ring-sky-200",    dot: "bg-sky-300",     soft: "#E0F2FE" },
  pressure:     { bg: "bg-rose-50",    text: "text-rose-800",   ring: "ring-rose-200",   dot: "bg-rose-300",    soft: "#FFE4E6" },
  exhaustion:   { bg: "bg-zinc-50",    text: "text-zinc-800",   ring: "ring-zinc-200",   dot: "bg-zinc-300",    soft: "#F4F4F5" },
  disconnected: { bg: "bg-amber-50",   text: "text-amber-800",  ring: "ring-amber-200",  dot: "bg-amber-300",   soft: "#FEF3C7" },
  happiness:    { bg: "bg-pink-50",    text: "text-pink-800",   ring: "ring-pink-200",   dot: "bg-pink-300",    soft: "#FCE7F3" },
};
