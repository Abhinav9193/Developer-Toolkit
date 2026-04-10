import axios from "axios";

/**
 * When running on Vercel with rewrites, the API calls go through Next.js
 * as same-origin requests (no CORS needed). The rewrite in next.config.js
 * proxies /api/* to the backend.
 *
 * For local dev without rewrites, it falls back to the env variable or localhost.
 */
const api = axios.create({
    baseURL: typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"),
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error(`API Error: ${error.response.status}`, error.response.data);
        } else if (error.request) {
            console.error("Network Error: No response received", error.message);
        } else {
            console.error("Request Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
