// src/api.js
import axios from "axios";

export const API_BASE_URL = "http://localhost:5000"; // helpful for file URLs

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // backend base URL
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
