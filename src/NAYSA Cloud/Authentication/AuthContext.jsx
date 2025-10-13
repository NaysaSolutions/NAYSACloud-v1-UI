import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  apiClient,
  ensureCsrf,
  setTenant,
  getTenant,
  markAuthReady,
  pingRemoteCheck,       // remote heartbeat (seconds)
  pingExpiryCheck,       // expiry heartbeat (aligned to minutes)
  getLastAuthApiTouch,   // last authenticated API touch
} from "@/NAYSA Cloud/Configuration/BaseURL.jsx";
import Swal from "sweetalert2";

const AuthContext = createContext(null);

/* -------- Timing (VITE_SESSION_LIFETIME in MINUTES) -------- */
const IDLE_LIMIT_MINUTES =
  typeof import.meta.env.VITE_SESSION_LIFETIME !== "undefined"
    ? parseInt(import.meta.env.VITE_SESSION_LIFETIME, 10)
    : 60;
const IDLE_LIMIT_MS = IDLE_LIMIT_MINUTES * 60 * 1000;

/* -------- Heartbeats --------
   Remote heartbeat: configured in SECONDS (default 15s).
   Expire heartbeat: aligned to VITE_SESSION_LIFETIME in MINUTES (minimum 1 minute).
*/
const REMOTE_HEARTBEAT_MS = Math.max(
  1000,
  (Number(import.meta.env.VITE_REMOTE_HEARTBEAT_SECONDS ?? 15) | 0) * 1000
);
// Align expiry heartbeat to the lifetime window in minutes (never less than 1 minute).
const EXPIRE_HEARTBEAT_MS = Math.max(60_000, IDLE_LIMIT_MINUTES * 60_000);

/* ---------------- Leader heartbeat across tabs ---------------- */
const AUTH_BC_NAME = "auth";
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const HB_LEASE_KEY = "naysa_hb_leader";
// Lease uses the slower heartbeat with a safety factor.
const HB_LEASE_MS = Math.max(EXPIRE_HEARTBEAT_MS * 1.25, 45_000);

function readLease() {
  try {
    return JSON.parse(localStorage.getItem(HB_LEASE_KEY) || "null");
  } catch {
    return null;
  }
}
function tryAcquireLeader() {
  const now = Date.now();
  const cur = readLease();
  if (!cur || !cur.id || cur.expiresAt <= now) {
    localStorage.setItem(
      HB_LEASE_KEY,
      JSON.stringify({ id: TAB_ID, expiresAt: now + HB_LEASE_MS })
    );
    return true;
  }
  return cur.id === TAB_ID;
}
function renewLeader() {
  const now = Date.now();
  localStorage.setItem(
    HB_LEASE_KEY,
    JSON.stringify({ id: TAB_ID, expiresAt: now + HB_LEASE_MS })
  );
}

/* ---------------- Local user cache ---------------- */
const USER_CACHE_KEY = "naysa_user";
const cacheUser = (u) => {
  try {
    if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_CACHE_KEY);
  } catch {}
};
const readCachedUser = () => {
  try {
    const s = localStorage.getItem(USER_CACHE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readCachedUser());
  const [loading, setLoading] = useState(true);

  const logoutLatchRef = useRef(false);
  const pendingLogoutNoticeRef = useRef(false);
  const lastActivity = useRef(Date.now());
  const idleTimer = useRef(null);
  const remoteHbTimer = useRef(null);
  const expireHbTimer = useRef(null);
  const bcRef = useRef(null);

  /* ---------------- Hard logout (local) ---------------- */
  const hardLogout = useCallback(() => {
    setUser(null);
    cacheUser(null);
    markAuthReady(false);
  }, []);

  /* ---------------- API logout ---------------- */
  const logout = useCallback(async () => {
    try {
      await apiClient.post("/logout");
    } catch {/* ignore */} finally {
      bcRef.current?.postMessage({ type: "logout", reason: "manual" });
      hardLogout();
    }
  }, [hardLogout]);

  /* ---------------- BroadcastChannel ---------------- */
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel(AUTH_BC_NAME);
    bcRef.current = bc;

    bc.onmessage = (e) => {
      if (!e?.data?.type) return;

      if (e.data.type === "logout") {
        if (logoutLatchRef.current) return;
        logoutLatchRef.current = true;

        const reason = e.data.reason;
        const showPopup = document.visibilityState === "visible";

        const msg =
          reason === "idle"
            ? {
                icon: "warning",
                title: "Signed out for inactivity",
                text: "You were inactive and have been signed out. Please sign in again.",
              }
            : reason === "expired"
            ? {
                icon: "warning",
                title: "Session expired",
                text: "Your session expired. Please sign in again.",
              }
            : reason === "remote"
            ? {
                icon: "info",
                title: "Signed out",
                text:
                  "Your account was signed in elsewhere or the server ended the session.",
              }
            : {
                icon: "warning",
                title: "Session ended",
                text: "Your session has ended. Please sign in again.",
              };

        if (showPopup) {
          Swal.fire({ ...msg, confirmButtonText: "OK" }).then(() => hardLogout());
        } else {
          pendingLogoutNoticeRef.current = true;
          hardLogout();
        }
        return;
      }

      if (e.data.type === "tenant-changed" && e.data.code) {
        const incoming = String(e.data.code || "");
        const current = String(getTenant() || "");
        if (incoming && incoming !== current) {
          setTenant(incoming, { silent: true });
        }
      }
    };

    return () => bc.close();
  }, [hardLogout]);

  /* ---------------- Bootstrap (restore session once) ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const code = getTenant();
        if (code) setTenant(code);

        await ensureCsrf();

        const res = await apiClient.get("/me", {
          withCredentials: true,
          headers: { "X-Skip-Logout-Broadcast": "1", "X-Use-Credentials": "1" },
        });

        const me = res?.data;
        setUser(me);
        cacheUser(me);
        logoutLatchRef.current = false;
        markAuthReady(true);
      } catch {
        setUser(null);
        cacheUser(null);
        markAuthReady(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- On-focus/visible: queued popup + light check ---------------- */
  useEffect(() => {
    let t = null;
    const check = async () => {
      try {
        await apiClient.get("/me"); // 401/419 -> interceptor broadcasts
      } catch {}
    };
    const onFocus = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(t);
      t = setTimeout(() => {
        if (pendingLogoutNoticeRef.current) {
          pendingLogoutNoticeRef.current = false;
          Swal.fire({
            icon: "warning",
            title: "Session ended",
            text: "Your session has ended. Please sign in again.",
            confirmButtonText: "OK",
          });
        }
        check();
      }, 500);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearTimeout(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  /* ---------------- Activity tracking (per tab) ---------------- */
  useEffect(() => {
    const bump = () => (lastActivity.current = Date.now());
    ["mousemove", "keydown", "click", "scroll", "touchstart", "visibilitychange"].forEach((ev) =>
      window.addEventListener(ev, bump, { passive: true })
    );
    return () =>
      ["mousemove", "keydown", "click", "scroll", "touchstart", "visibilitychange"].forEach((ev) =>
        window.removeEventListener(ev, bump)
      );
  }, []);

  /* ---------------- Idle + separate heartbeats ---------------- */
  useEffect(() => {
    if (!user) return;

    let stopped = false;

    // 1) Idle
    const idleCheck = () => {
      if (stopped) return;
      const idleFor = Date.now() - lastActivity.current;
   

      if (idleFor >= IDLE_LIMIT_MS) {
        bcRef.current?.postMessage({ type: "logout", reason: "idle" });
        const msg = {
          icon: "warning",
          title: "Signed out for inactivity",
          text: "You were inactive and have been signed out. Please sign in again.",
        };
        if (document.visibilityState === "visible") {
          Swal.fire({ ...msg, confirmButtonText: "OK" }).then(() => hardLogout());
        } else {
          pendingLogoutNoticeRef.current = true;
          hardLogout();
        }
      } else {
        idleTimer.current = window.setTimeout(idleCheck, 1000);
      }
    };

    // 2) Heartbeat A — "login elsewhere" (remote) when no API traffic
    const remoteTick = async () => {
      if (stopped) return;

      if (document.visibilityState !== "visible") {
        remoteHbTimer.current = window.setTimeout(remoteTick, REMOTE_HEARTBEAT_MS);
        return;
      }

      // If we haven't done any authenticated API call in this window, ping
      const sinceLast = Date.now() - getLastAuthApiTouch();
      if (sinceLast >= REMOTE_HEARTBEAT_MS) {
        const leader = tryAcquireLeader();
        if (leader && !stopped) {
          const ok = await pingRemoteCheck(); // 401/419 => broadcast 'remote'
          if (!ok) return;
          renewLeader();
        }
      }

      const jitter = Math.floor(Math.random() * 500);
      remoteHbTimer.current = window.setTimeout(remoteTick, REMOTE_HEARTBEAT_MS + jitter);
    };

    // 3) Heartbeat B — expiry (aligned to minutes)
    const expireTick = async () => {
      if (stopped) return;

      if (document.visibilityState !== "visible") {
        expireHbTimer.current = window.setTimeout(expireTick, EXPIRE_HEARTBEAT_MS);
        return;
      }

      const leader = tryAcquireLeader();
      if (leader && !stopped) {
        const ok = await pingExpiryCheck(); // 401/419 => broadcast 'expired'
        if (!ok) return;
        renewLeader();
      }

      const jitter = Math.floor(Math.random() * 1000);
      expireHbTimer.current = window.setTimeout(expireTick, EXPIRE_HEARTBEAT_MS + jitter);
    };

    // Kick them off
    idleCheck();
    remoteTick();
    expireTick();

    return () => {
      stopped = true;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (remoteHbTimer.current) clearTimeout(remoteHbTimer.current);
      if (expireHbTimer.current) clearTimeout(expireHbTimer.current);
    };
  }, [user, hardLogout]);

  /* ---------------- Login ---------------- */
  const login = useCallback(
    async ({ companyCode, USER_CODE, PASSWORD }) => {
      setTenant(companyCode);

      await ensureCsrf();
      await apiClient.post(
        "/login",
        { USER_CODE, PASSWORD },
        { headers: { "X-Skip-Logout-Broadcast": "1" } }
      );

      const { data } = await apiClient.get("/me", {
        withCredentials: true,
        headers: { "X-Skip-Logout-Broadcast": "1" },
      });

      lastActivity.current = Date.now();
      setUser(data);
      cacheUser(data);
      logoutLatchRef.current = false;
      markAuthReady(true);
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

