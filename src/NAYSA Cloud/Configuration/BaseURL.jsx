// src/baseURL.jsx
import axios from "axios";

// Create Axios instance
export const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// GET request
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



// POST request
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
      headers: {
        Accept: "application/pdf",
      },
      responseType: "blob", // important for PDF
    });
    return response.data; // returns a Blob
  } catch (error) {
    console.error("API POST PDF Error:", error);
    throw error;
  }
};



// No need for default export unless you want to export `apiClient`
export default apiClient;
