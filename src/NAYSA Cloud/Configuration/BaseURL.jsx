// import axios from "axios";
// export const API_BASE = (() => {

//   const v = import.meta.env.VITE_API_URL
//   if (v === "/api" || v.endsWith("/api")) return v;
//   return `${String(v).replace(/\/+$/, "")}/api`;
// })();



// export const getTenant = () => localStorage.getItem("companyCode") || null;
// export const setTenant = (code) => {
//   if (code) {
//     localStorage.setItem("companyCode", code);
//     apiClient.defaults.headers.common["X-Company-DB"] = code;
//   } else {
//     localStorage.removeItem("companyCode");
//     delete apiClient.defaults.headers.common["X-Company-DB"];
//   }
// };


// export const apiClient = axios.create({
//   baseURL: API_BASE,
//   withCredentials: false,
//   timeout: 20000,
//   headers: {
//     Accept: "application/json",
//     "Content-Type": "application/json",
//   },
// });



// apiClient.interceptors.request.use((config) => {
//   const tenant = getTenant();
//   if (tenant && !config.headers["X-Company-DB"]) {
//     config.headers["X-Company-DB"] = tenant;
//   }
//   return config;
// });




// /** Tag missing-tenant errors for easier handling upstream (optional) */
// apiClient.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const msg = err?.response?.data?.message || "";
//     if (err?.response?.status === 400 && /Missing X-Company-DB/i.test(msg)) {
//       err.tenantRequired = true;
//     }
//     return Promise.reject(err);
//   }
// );




// export const fetchData = async (endpoint, params = {}) => {
//   try {
//     const response = await apiClient.get(endpoint, { params });
//     return response.data;
//   } catch (error) {
//     console.error("API GET Error:", error);
//     throw error;
//   }
// };




// export const fetchDataJson = async (endpoint, jsonPayload = {}, page = 1, itemsPerPage = 50) => {
//   try {
//     const response = await apiClient.get(endpoint, {
//       params: {
//         PARAMS: JSON.stringify({ json_data: jsonPayload }),
//         page,
//         itemsPerPage,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("API GET with JSON Error:", error);
//     throw error;
//   }
// };




// export const postRequest = async (endpoint, data = {}, config = {}) => {
//   try {
//     const response = await apiClient.post(endpoint, data, config);
//     return response.data;
//   } catch (error) {
//     console.error("API POST Error:", error);
//     throw error;
//   }
// };




// export const postPdfRequest = async (endpoint, data = {}) => {
//   try {
//     const response = await apiClient.post(endpoint, data, {
//       headers: { Accept: "application/pdf" },
//       responseType: "blob",
//     });
//     return response.data; // Blob
//   } catch (error) {
//     console.error("API POST PDF Error:", error);
//     throw error;
//   }
// };



// export const getToken = () => localStorage.getItem("token") || null;
// export const setToken = (t) => {
//   if (t) {
//     localStorage.setItem("token", t);
//     apiClient.defaults.headers.common.Authorization = `Bearer ${t}`;
//   } else {
//     clearToken();
//   }
// };

// export const clearToken = () => {
//   localStorage.removeItem("token");
//   delete apiClient.defaults.headers.common.Authorization;
// };


// export default apiClient;


// const initialTenant = getTenant();
// if (initialTenant) {
//   apiClient.defaults.headers.common["X-Company-DB"] = initialTenant;
// }


// src/NAYSA Cloud/Configuration/BaseURL.jsx
import axios from "axios";

/* ---------------- API BASE ---------------- */
export const API_BASE = (() => {
  const raw = String(import.meta.env.VITE_API_URL || "").trim() || "/api";
  if (raw === "/api" || raw.endsWith("/api")) return raw;
  return `${raw.replace(/\/+$/, "")}/api`;
})();

/* ---------------- Tenant helpers ---------------- */
export const getTenant = () => localStorage.getItem("companyCode") || null;

export const setTenant = (code) => {
  if (code) {
    localStorage.setItem("companyCode", code);
    apiClient.defaults.headers.common["X-Company-DB"] = code;
  } else {
    localStorage.removeItem("companyCode");
    delete apiClient.defaults.headers.common["X-Company-DB"];
  }
};

/* ---------------- Token helpers ---------------- */
const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY) || null;

export const setToken = (t) => {
  if (t) {
    localStorage.setItem(TOKEN_KEY, t);
    apiClient.defaults.headers.common.Authorization = `Bearer ${t}`;
  } else {
    clearToken();
  }
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete apiClient.defaults.headers.common.Authorization;
};

/* ---------------- Axios instance ---------------- */
export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: false,     // Bearer tokens (no cookies)
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/* ---------------- Interceptors ---------------- */
// Always attach tenant + token before sending
apiClient.interceptors.request.use((config) => {
  const tenant = getTenant();
  if (tenant && !config.headers["X-Company-DB"]) {
    config.headers["X-Company-DB"] = tenant;
  }
  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Keep your Missing-tenant tagging; avoid blanket token nuking on 401
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data   = err?.response?.data || {};
    const msg    = data?.message || "";

    // Tag missing-tenant errors for upstream handling (optional)
    if (status === 400 && /Missing X-Company-DB/i.test(msg)) {
      err.tenantRequired = true;
    }

    // Strict-lock is enforced only at /login; do NOT clear token here automatically.
    // Your App.jsx will handle bootstrap (/me) and decide what to do on 401.

    return Promise.reject(err);
  }
);

/* ---------------- Convenience helpers ---------------- */
export const fetchData = async (endpoint, params = {}) => {
  try {
    const { data } = await apiClient.get(endpoint, { params });
    return data;
  } catch (error) {
    console.error("API GET Error:", error);
    throw error;
  }
};

export const fetchDataJson = async (
  endpoint,
  jsonPayload = {},
  page = 1,
  itemsPerPage = 50
) => {
  try {
    const { data } = await apiClient.get(endpoint, {
      params: {
        PARAMS: JSON.stringify({ json_data: jsonPayload }),
        page,
        itemsPerPage,
      },
    });
    return data;
  } catch (error) {
    console.error("API GET with JSON Error:", error);
    throw error;
  }
};

export const fetchDataJsonLookup = async (
  endpoint,
  jsonPayload = {}
) => {
  try {
    const { data } = await apiClient.get(endpoint, {
      params: {
        PARAMS: JSON.stringify({ json_data: jsonPayload }),
      },
    });
    console.log("fetchDataJsonLookup data:", data);
    return data;
  } catch (error) {
    console.error("API GET with JSON Error:", error);
    throw error;
  }
};

export const postRequest = async (endpoint, body = {}, config = {}) => {
  try {
    const { data } = await apiClient.post(endpoint, body, config);
    return data;
  } catch (error) {
    console.error("API POST Error:", error);
    throw error;
  }
};

export const postPdfRequest = async (endpoint, body = {}) => {
  try {
    const { data } = await apiClient.post(endpoint, body, {
      headers: { Accept: "application/pdf" },
      responseType: "blob",
    });
    return data; // Blob
  } catch (error) {
    console.error("API POST PDF Error:", error);
    throw error;
  }
};

export default apiClient;

/* ---------------- Bootstrap defaults on module load ---------------- */
const initialTenant = getTenant();
if (initialTenant) {
  apiClient.defaults.headers.common["X-Company-DB"] = initialTenant;
}
const initialToken = getToken();
if (initialToken) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${initialToken}`;
}
