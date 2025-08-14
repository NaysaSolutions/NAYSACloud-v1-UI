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


export const printRequest = async (endpoint, data = {}, config = {}) => {
  try {
    const options = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        ...config.headers // merge any extra headers
      },
      body: JSON.stringify(data),
      ...config // merge other config like credentials, mode, etc.
    };

    const response = await fetch(endpoint, options);

    
  if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate report: ${errorText}`);
    }

    const blob = await response.blob();
    if (blob.type !== "application/pdf") {
      const text = await blob.text();
      throw new Error(`Expected PDF but got: ${text}`);
    }

    const fileURL = URL.createObjectURL(blob);
    printWindow.location.href = fileURL;

  } catch (error) {
    console.error("API POST Error:", error);
    throw error;
  }
};


// No need for default export unless you want to export `apiClient`
export default apiClient;
