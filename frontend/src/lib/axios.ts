import axios from "axios";

// API Base URL from environment or default to localhost
// Strip /api/v1 if already present in env to avoid double paths
let API_URL = import.meta.env.VITE_API_URL;
API_URL = API_URL.replace(/\/api\/v1$/, "");

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      
      // Optionally redirect to login
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

