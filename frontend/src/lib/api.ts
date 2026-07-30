import axios from "axios";

// Get base URL from environment (Vite proxy config or direct URL)
const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// CSRF is no longer required for stateless Bearer Tokens
export const fetchCsrfToken = async () => {};

// Response Interceptor for Unauthorized handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 419) {
      // Only redirect or trigger global events if we are not already on the login page
      // to prevent infinite loops. We dispatch a custom event.
      if (window.location.pathname !== "/login") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);
