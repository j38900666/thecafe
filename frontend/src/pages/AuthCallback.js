import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = location.hash || window.location.hash;
    const sessionId = new URLSearchParams(hash.replace("#", "")).get("session_id");
    if (!sessionId) {
      navigate("/admin", { replace: true });
      return;
    }

    (async () => {
      try {
        const res = await api.post("/auth/session", { session_id: sessionId });
        setUser(res.data);
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/admin", { replace: true, state: { user: res.data } });
      } catch {
        navigate("/admin", { replace: true });
      }
    })();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted">Signing you in...</p>
      </div>
    </div>
  );
}
