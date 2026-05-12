import React, { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore, formatError } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tokenStore.get()) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        if (mounted) setAdmin(data);
      } catch {
        tokenStore.clear();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data?.token) tokenStore.set(data.token);
      setAdmin({ id: data.id, email: data.email, role: data.role });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatError(e) };
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (e) { void e; }
    tokenStore.clear();
    setAdmin(null);
  };

  return (
    <AuthCtx.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
