import axios from "axios";
export const API_BASE = (() => {

  const v = import.meta.env.VITE_API_URL
  if (v === "/api" || v.endsWith("/api")) return v;
  return `${String(v).replace(/\/+$/, "")}/api`;
})();



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


export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});



apiClient.interceptors.request.use((config) => {
  const tenant = getTenant();
  if (tenant && !config.headers["X-Company-DB"]) {
    config.headers["X-Company-DB"] = tenant;
  }
  return config;
});




/** Tag missing-tenant errors for easier handling upstream (optional) */
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || "";
    if (err?.response?.status === 400 && /Missing X-Company-DB/i.test(msg)) {
      err.tenantRequired = true;
    }
    return Promise.reject(err);
  }
);




export const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error("API GET Error:", error);
    throw error;
  }
};




export const fetchDataJson = async (endpoint, jsonPayload = {}, page = 1, itemsPerPage = 50) => {
  try {
    const response = await apiClient.get(endpoint, {
      params: {
        PARAMS: JSON.stringify({ json_data: jsonPayload }),
        page,
        itemsPerPage,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API GET with JSON Error:", error);
    throw error;
  }
};




export const postRequest = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error("API POST Error:", error);
    throw error;
  }
};




export const postPdfRequest = async (endpoint, data = {}) => {
  try {
    const response = await apiClient.post(endpoint, data, {
      headers: { Accept: "application/pdf" },
      responseType: "blob",
    });
    return response.data; // Blob
  } catch (error) {
    console.error("API POST PDF Error:", error);
    throw error;
  }
};



export default apiClient;


const initialTenant = getTenant();
if (initialTenant) {
  apiClient.defaults.headers.common["X-Company-DB"] = initialTenant;
}
