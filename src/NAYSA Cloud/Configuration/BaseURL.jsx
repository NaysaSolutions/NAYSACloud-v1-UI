// src/baseURL.jsx
import axios from "axios";

// Create Axios instance
const apiClient = axios.create({
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



// No need for default export unless you want to export `apiClient`
export default apiClient;
