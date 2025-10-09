// import axios from "axios";

// /* ───────── API roots ───────── */
// export const API_ROOT =
//   String(import.meta.env.VITE_API_URL || "").trim();

// export const API_BASE = (() => {
//   const root = API_ROOT.replace(/\/+$/, "");
//   return `${root}/api`;
// })();

// /* ───────── Small utils (no axios refs here) ───────── */
// const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// function readCookie(name) {
//   const re = new RegExp(`(?:^|; )${escapeRegExp(name)}=([^;]*)`);
//   const m = document.cookie.match(re);
//   return m ? m[1] : null;
// }
// function getXsrfToken() {
//   const raw = readCookie("XSRF-TOKEN");
//   return raw ? decodeURIComponent(raw) : null;
// }
// const toPath = (u) => {
//   try {
//     return /^https?:\/\//i.test(u) ? new URL(u).pathname || "/" : (u || "/");
//   } catch {
//     return u || "/";
//   }
// };
// const IS_CROSS_ORIGIN = (() => {
//   try {
//     return new URL(API_ROOT).origin !== window.location.origin;
//   } catch {
//     return true;
//   }
// })();

// /* Public GETs that must NOT send cookies or tenant header */
// const PUBLIC_GETS = [/^\/?companies\/?$/i];

// /* ───────── BroadcastChannel ───────── */
// const bc =
//   typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("auth") : null;
// export function broadcast(type, payload = {}) {
//   try {
//     bc?.postMessage({ type, ...payload });
//   } catch {}
// }

// /* ───────── Axios instances ───────── */
// export const http = axios.create({
//   baseURL: API_ROOT,
//   withCredentials: true,
//   timeout: 20000,
//   headers: { Accept: "application/json" },
//   xsrfCookieName: "XSRF-TOKEN",
//   xsrfHeaderName: "X-XSRF-TOKEN",
// });

// export const apiClient = axios.create({
//   baseURL: API_BASE,
//   withCredentials: true,
//   timeout: 20000,
//   headers: { Accept: "application/json" },
//   xsrfCookieName: "XSRF-TOKEN",
//   xsrfHeaderName: "X-XSRF-TOKEN",
// });

// // Back-compat alias
// export const api = apiClient;
// export default apiClient;



// // Auth bootstrap readiness flag (default false)
// // Will be flipped by AuthContext after /me succeeds.
// let AUTH_READY = false;
// export function markAuthReady(v = true) {
//   AUTH_READY = !!v;
// }




// /* ───────── Tenant (cross-tab share; clears on last tab close) ───────── */
// const TENANT_KEY = "companyCode";
// const TAB_COUNT_KEY = "naysa_tabs_open";

// /** Prefer localStorage first so *all* tabs share the same tenant. */
// export const getTenant = () =>
//   localStorage.getItem(TENANT_KEY) ||
//   sessionStorage.getItem(TENANT_KEY) ||
//   null;

// /** Idempotent + silent-capable to prevent BC echo loops */
// export const setTenant = (code, opts = {}) => {
//   const { silent = false } = opts;
//   const current = getTenant();

//   if (!code) {
//     if (current != null) {
//       localStorage.removeItem(TENANT_KEY);
//       sessionStorage.removeItem(TENANT_KEY);
//     }
//     delete http.defaults.headers.common["X-Company-DB"];
//     delete apiClient.defaults.headers.common["X-Company-DB"];
//     return;
//   }

//   if (current === code) {
//     http.defaults.headers.common["X-Company-DB"] = code;
//     apiClient.defaults.headers.common["X-Company-DB"] = code;
//     return;
//   }

//   localStorage.setItem(TENANT_KEY, code);
//   sessionStorage.setItem(TENANT_KEY, code);
//   http.defaults.headers.common["X-Company-DB"] = code;
//   apiClient.defaults.headers.common["X-Company-DB"] = code;

//   if (!silent) broadcast("tenant-changed", { code });
// };

// /* Bring tenant from localStorage into this tab’s session AFTER axios exists */
// (() => {
//   const code = localStorage.getItem(TENANT_KEY);
//   if (code && !sessionStorage.getItem(TENANT_KEY)) {
//     sessionStorage.setItem(TENANT_KEY, code);
//     http.defaults.headers.common["X-Company-DB"] = code;
//     apiClient.defaults.headers.common["X-Company-DB"] = code;
//   }
// })();

// /* Auto-clear tenant on last app tab close (still after axios exists) */
// (function manageTabCount() {
//   const n = parseInt(localStorage.getItem(TAB_COUNT_KEY) || "0", 10) || 0;
//   localStorage.setItem(TAB_COUNT_KEY, String(n + 1));
//   window.addEventListener("unload", () => {
//     const cur = parseInt(localStorage.getItem(TAB_COUNT_KEY) || "1", 10) || 1;
//     const next = Math.max(cur - 1, 0);
//     localStorage.setItem(TAB_COUNT_KEY, String(next));
//     if (next === 0) localStorage.removeItem(TENANT_KEY);
//   });
// })();

// /* ───────── CSRF cookie helper ───────── */
// export async function ensureCsrf() {
//   await http.get("/sanctum/csrf-cookie");
// }

// /* ───────── Interceptors ───────── */
// function attachJsonContentType(instance) {
//   instance.interceptors.request.use((config) => {
//     const method = String(config.method || "").toLowerCase();
//     if (/post|put|patch|delete/.test(method) && !config.headers?.["Content-Type"]) {
//       (config.headers ||= {})["Content-Type"] = "application/json";
//     }
//     return config;
//   });
// }
// attachJsonContentType(http);
// attachJsonContentType(apiClient);

// function attachXsrf(instance) {
//   instance.interceptors.request.use((config) => {
//     const method = String(config.method || "").toLowerCase();
//     if (IS_CROSS_ORIGIN && /post|put|patch|delete/.test(method)) {
//       const token = getXsrfToken();
//       if (token) (config.headers ||= {})["X-XSRF-TOKEN"] = token;
//     }
//     return config;
//   });
// }
// attachXsrf(http);
// attachXsrf(apiClient);

// // Attach/skip tenant; make /api/companies truly public
// function attachTenantAndPublic(instance) {
//   instance.interceptors.request.use((config) => {
//     const method = String(config.method || "").toLowerCase();
//     const path = toPath(config.url || "");
//     const skipByFlag = config.headers?.["X-No-Tenant"] === "1";
//     const isPublicGet = method === "get" && PUBLIC_GETS.some((re) => re.test(path));

//     if (isPublicGet && !config.headers?.["X-Use-Credentials"]) {
//       config.withCredentials = false;
//       if (config.headers) delete config.headers["X-Company-DB"];
//     } else {
//       const tenant = getTenant();
//       if (tenant && !skipByFlag && !config.headers?.["X-Company-DB"]) {
//         (config.headers ||= {})["X-Company-DB"] = tenant;
//       }
//     }
//     return config;
//   });
// }
// attachTenantAndPublic(http);
// attachTenantAndPublic(apiClient);

// // Back-compat path rewrite: /apiClient/* → /*
// apiClient.interceptors.request.use((config) => {
//   let u = config.url || "";
//   if (!/^https?:\/\//i.test(u)) {
//     if (u.startsWith("//")) u = u.replace(/^\/+/, "/");
//     if (u === "/apiClient") u = "/";
//     else if (u.startsWith("/apiClient/")) u = u.replace(/^\/apiClient\//, "/");
//     else if (u.startsWith("apiClient/")) u = u.replace(/^apiClient\//, "");
//     config.url = u;
//   }
//   return config;
// });

// /* 401/419 broadcast rules */
// const SKIP_401_BC = [
//   /\/login$/i,
//   /\/api\/me$/i,
//   /\/sanctum\/csrf-cookie$/i,
//   /\/api\/companies$/i,
// ];

// function shouldSkip401Broadcast(cfg) {
//   const skipHeader = cfg?.headers?.["X-Skip-Logout-Broadcast"] === "1";
//   if (skipHeader) return true;
//   if (cfg?.withCredentials === false) return true;
//   const path = toPath(cfg?.url || "");
//   return SKIP_401_BC.some((re) => re.test(path));
// }

// function attach401(instance) {
//   instance.interceptors.response.use(
//     (res) => res,
//     (err) => {
//       const status = err?.response?.status;
//       const cfg = err?.config;
//     // Only broadcast once auth is known to be established in this tab.
//      if (AUTH_READY && (status === 401 || status === 403 || status === 419) && !shouldSkip401Broadcast(cfg)) {
//         broadcast("logout", { reason: "remote" });
//       }
//       return Promise.reject(err);
//     }
//   );
// }


// attach401(http);
// attach401(apiClient);

// /* ───────── Heartbeat (optional helper) ───────── */
// export async function sendHeartbeat() {
//   try {
//     await apiClient.post("/auth/heartbeat", null, {
//       withCredentials: true,
//       headers: { "X-Skip-Logout-Broadcast": "1" },
//     });
//     return true;
//   } catch (err) {
//     const status = err?.response?.status;
//     if (status === 401 || status === 419) {
//       broadcast("logout", { reason: "remote" });
//     }
//     return false;
//   }
// }

// /* ───────── Convenience helpers ───────── */
// export const fetchData = async (endpoint, params = {}) => {
//   const { data } = await apiClient.get(endpoint, { params });
//   return data;
// };
// export const fetchDataJson = async (endpoint, jsonPayload = {}, page = 1, itemsPerPage = 50) => {
//   const { data } = await apiClient.get(endpoint, {
//     params: { PARAMS: JSON.stringify({ json_data: jsonPayload }), page, itemsPerPage },
//   });
//   return data;
// };
// export const postRequest = async (endpoint, body = {}, config = {}) => {
//   const { data } = await apiClient.post(endpoint, body, config);
//   return data;
// };
// export const postPdfRequest = async (endpoint, body = {}) => {
//   const { data } = await apiClient.post(endpoint, body, {
//     headers: { Accept: "application/pdf" },
//     responseType: "blob",
//   });
//   return data; // Blob
// };


import axios from "axios";

/* ───────── API roots ───────── */
export const API_ROOT = String(import.meta.env.VITE_API_URL || "").trim();

export const API_BASE = (() => {
  const root = API_ROOT.replace(/\/+$/, "");
  return `${root}/api`;
})();

/* ───────── Small utils (no axios refs here) ───────── */
const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function readCookie(name) {
  const re = new RegExp(`(?:^|; )${escapeRegExp(name)}=([^;]*)`);
  const m = document.cookie.match(re);
  return m ? m[1] : null;
}
function getXsrfToken() {
  const raw = readCookie("XSRF-TOKEN");
  return raw ? decodeURIComponent(raw) : null;
}
const toPath = (u) => {
  try {
    return /^https?:\/\//i.test(u) ? new URL(u).pathname || "/" : (u || "/");
  } catch {
    return u || "/";
  }
};
const IS_CROSS_ORIGIN = (() => {
  try {
    return new URL(API_ROOT).origin !== window.location.origin;
  } catch {
    return true;
  }
})();

/* Public GETs that must NOT send cookies or tenant header */
const PUBLIC_GETS = [/^\/?companies\/?$/i];

/* ───────── BroadcastChannel ───────── */
const bc =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("auth") : null;
export function broadcast(type, payload = {}) {
  try {
    bc?.postMessage({ type, ...payload });
  } catch {}
}

/* ───────── Axios instances ───────── */
export const http = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  timeout: 20000,
  headers: { Accept: "application/json" },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 20000,
  headers: { Accept: "application/json" },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Back-compat alias
export const api = apiClient;
export default apiClient;

/* ───────── Auth bootstrap readiness flag ───────── */
let AUTH_READY = false;
export function markAuthReady(v = true) {
  AUTH_READY = !!v;
}

/* ───────── Tenant (cross-tab share; clears on last tab close) ───────── */
const TENANT_KEY = "companyCode";
const TAB_COUNT_KEY = "naysa_tabs_open";

export const getTenant = () =>
  localStorage.getItem(TENANT_KEY) ||
  sessionStorage.getItem(TENANT_KEY) ||
  null;

export const setTenant = (code, opts = {}) => {
  const { silent = false } = opts;
  const current = getTenant();

  if (!code) {
    if (current != null) {
      localStorage.removeItem(TENANT_KEY);
      sessionStorage.removeItem(TENANT_KEY);
    }
    delete http.defaults.headers.common["X-Company-DB"];
    delete apiClient.defaults.headers.common["X-Company-DB"];
    return;
  }

  if (current === code) {
    http.defaults.headers.common["X-Company-DB"] = code;
    apiClient.defaults.headers.common["X-Company-DB"] = code;
    return;
  }

  localStorage.setItem(TENANT_KEY, code);
  sessionStorage.setItem(TENANT_KEY, code);
  http.defaults.headers.common["X-Company-DB"] = code;
  apiClient.defaults.headers.common["X-Company-DB"] = code;

  if (!silent) broadcast("tenant-changed", { code });
};

/* Bring tenant from localStorage into this tab’s session AFTER axios exists */
(() => {
  const code = localStorage.getItem(TENANT_KEY);
  if (code && !sessionStorage.getItem(TENANT_KEY)) {
    sessionStorage.setItem(TENANT_KEY, code);
    http.defaults.headers.common["X-Company-DB"] = code;
    apiClient.defaults.headers.common["X-Company-DB"] = code;
  }
})();

/* Auto-clear tenant on last app tab close (still after axios exists) */
(function manageTabCount() {
  const n = parseInt(localStorage.getItem(TAB_COUNT_KEY) || "0", 10) || 0;
  localStorage.setItem(TAB_COUNT_KEY, String(n + 1));
  window.addEventListener("unload", () => {
    const cur = parseInt(localStorage.getItem(TAB_COUNT_KEY) || "1", 10) || 1;
    const next = Math.max(cur - 1, 0);
    localStorage.setItem(TAB_COUNT_KEY, String(next));
    if (next === 0) localStorage.removeItem(TENANT_KEY);
  });
})();

/* ───────── CSRF cookie helper ───────── */
export async function ensureCsrf() {
  await http.get("/sanctum/csrf-cookie");
}

/* ───────── Interceptors ───────── */
function attachJsonContentType(instance) {
  instance.interceptors.request.use((config) => {
    const method = String(config.method || "").toLowerCase();
    if (/post|put|patch|delete/.test(method) && !config.headers?.["Content-Type"]) {
      (config.headers ||= {})["Content-Type"] = "application/json";
    }
    return config;
  });
}
attachJsonContentType(http);
attachJsonContentType(apiClient);

function attachXsrf(instance) {
  instance.interceptors.request.use((config) => {
    const method = String(config.method || "").toLowerCase();
    if (IS_CROSS_ORIGIN && /post|put|patch|delete/.test(method)) {
      const token = getXsrfToken();
      if (token) (config.headers ||= {})["X-XSRF-TOKEN"] = token;
    }
    return config;
  });
}
attachXsrf(http);
attachXsrf(apiClient);

// Attach/skip tenant; make /api/companies truly public
function attachTenantAndPublic(instance) {
  instance.interceptors.request.use((config) => {
    const method = String(config.method || "").toLowerCase();
    const path = toPath(config.url || "");
    const skipByFlag = config.headers?.["X-No-Tenant"] === "1";
    const isPublicGet = method === "get" && PUBLIC_GETS.some((re) => re.test(path));

    if (isPublicGet && !config.headers?.["X-Use-Credentials"]) {
      config.withCredentials = false;
      if (config.headers) delete config.headers["X-Company-DB"];
    } else {
      const tenant = getTenant();
      if (tenant && !skipByFlag && !config.headers?.["X-Company-DB"]) {
        (config.headers ||= {})["X-Company-DB"] = tenant;
      }
    }
    return config;
  });
}
attachTenantAndPublic(http);
attachTenantAndPublic(apiClient);

// Back-compat path rewrite: /apiClient/* → /*
apiClient.interceptors.request.use((config) => {
  let u = config.url || "";
  if (!/^https?:\/\//i.test(u)) {
    if (u.startsWith("//")) u = u.replace(/^\/+/, "/");
    if (u === "/apiClient") u = "/";
    else if (u.startsWith("/apiClient/")) u = u.replace(/^\/apiClient\//, "/");
    else if (u.startsWith("apiClient/")) u = u.replace(/^apiClient\//, "");
    config.url = u;
  }
  return config;
});

/* 401/419 broadcast rules */
const SKIP_401_BC = [
  /\/login$/i,
  /\/api\/me$/i,
  /\/sanctum\/csrf-cookie$/i,
  /\/api\/companies$/i,
];

function shouldSkip401Broadcast(cfg) {
  const skipHeader = cfg?.headers?.["X-Skip-Logout-Broadcast"] === "1";
  if (skipHeader) return true;
  if (cfg?.withCredentials === false) return true;
  const path = toPath(cfg?.url || "");
  return SKIP_401_BC.some((re) => re.test(path));
}

function attach401(instance) {
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      const cfg = err?.config;
      // Only broadcast once auth is ready in this tab.
      if (AUTH_READY && (status === 401 || status === 403 || status === 419) && !shouldSkip401Broadcast(cfg)) {
        broadcast("logout", { reason: "remote" });
      }
      return Promise.reject(err);
    }
  );
}
attach401(http);
attach401(apiClient);

/* ───────── Track last *authenticated* API touch ───────── */
let LAST_AUTH_API_TS = 0;
export const getLastAuthApiTouch = () => LAST_AUTH_API_TS;
const noteAuthApiTouch = () => { LAST_AUTH_API_TS = Date.now(); };

const isPublicGetRequest = (cfg) => {
  const method = String(cfg?.method || "").toLowerCase();
  const path = toPath(cfg?.url || "");
  const isPublicGet = method === "get" && PUBLIC_GETS.some((re) => re.test(path));
  const skipCreds = cfg?.headers?.["X-Use-Credentials"] === "1" ? false : cfg?.withCredentials === false;
  return isPublicGet && skipCreds !== false;
};

function touchOnAuthRequests(instance) {
  instance.interceptors.request.use((config) => {
    if (!isPublicGetRequest(config) && config.withCredentials !== false) {
      noteAuthApiTouch();
    }
    return config;
  });
}
touchOnAuthRequests(http);
touchOnAuthRequests(apiClient);

/* ───────── Separate heartbeats ───────── */
// A) Remote-check (used when no API calls recently). Broadcasts `remote` on 401/419.
export async function pingRemoteCheck() {
  try {
    await apiClient.post("/auth/heartbeat", null, {
      withCredentials: true,
      headers: { "X-Skip-Logout-Broadcast": "1", "X-Heartbeat": "remote" },
    });
    return true;
  } catch (err) {
    const s = err?.response?.status;
    if (s === 401 || s === 419) {
      broadcast("logout", { reason: "remote" });
    }
    return false;
  }
}

// B) Expiry-check (TTL / server-side expiry). Broadcasts `expired` on 401/419.
export async function pingExpiryCheck() {
  try {
    await apiClient.post("/auth/heartbeat", null, {
      withCredentials: true,
      headers: { "X-Skip-Logout-Broadcast": "1", "X-Heartbeat": "expiry" },
    });
    return true;
  } catch (err) {
    const s = err?.response?.status;
    if (s === 401 || s === 419) {
      broadcast("logout", { reason: "expired" });
    }
    return false;
  }
}

/* ───────── Convenience helpers ───────── */
export const fetchData = async (endpoint, params = {}) => {
  const { data } = await apiClient.get(endpoint, { params });
  return data;
};



export const fetchDataJson = async (endpoint, jsonPayload = {}, page = 1, itemsPerPage = 50) => {
  const { data } = await apiClient.get(endpoint, {
    params: { PARAMS: JSON.stringify({ json_data: jsonPayload }), page, itemsPerPage },
  });
  return data;
};



export const fetchDataJsonLookup = async (endpoint, jsonPayload = {}, page = 1, itemsPerPage = 50) => {
  const { data } = await apiClient.get(endpoint, {
    params: { PARAMS: JSON.stringify({ json_data: jsonPayload }), page, itemsPerPage },
  });
  return data;
};
export const postRequest = async (endpoint, body = {}, config = {}) => {
  const { data } = await apiClient.post(endpoint, body, config);
  return data;
};


export const postPdfRequest = async (endpoint, body = {}) => {
  const { data } = await apiClient.post(endpoint, body, {
    headers: { Accept: "application/pdf" },
    responseType: "blob",
  });
  return data; // Blob
};
