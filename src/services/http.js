/**
 * Attaches the logged-in user's token to EVERY request sent to our API, for both
 * axios and fetch. The backend now requires it on protected routes; before this,
 * many pages called the API without the token.
 *
 * Also: if the server says the session is no longer valid (401), the stale login
 * is cleared and the user is sent to the login page once, instead of every page
 * silently failing.
 *
 * Imported once from main.jsx, before the app renders.
 */
import axios from "axios";
import { API_BASE_URL } from "./BaseUrl";

const API_ORIGIN_PATH = API_BASE_URL.replace(/\/$/, "");

// Endpoints where a 401 means "wrong password" etc., not "session expired".
const AUTH_ENDPOINTS = ["auth/login", "auth/register", "auth/google-login", "auth/verify-email", "auth/resend-verification", "auth/forgot-password", "auth/reset-password"];

const isApiUrl = (url) => typeof url === "string" && url.startsWith(API_ORIGIN_PATH);
const isAuthEndpoint = (url) => AUTH_ENDPOINTS.some((p) => url.includes(p));

const getToken = () => {
  const t = localStorage.getItem("token");
  return t && t !== "null" && t !== "undefined" ? t : null;
};

let redirecting = false;
export const handleSessionExpired = () => {
  if (redirecting) return;
  redirecting = true;
  ["token", "user", "parentSession", "activeChildProfile", "activeLearner"].forEach((k) =>
    localStorage.removeItem(k)
  );
  sessionStorage.removeItem("autoSwitched");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign("/login?expired=1");
  } else {
    redirecting = false;
  }
};

// ---- axios ----
axios.interceptors.request.use((config) => {
  const url = config.baseURL ? `${config.baseURL}${config.url || ""}` : config.url;
  const token = getToken();
  if (token && isApiUrl(url)) {
    const current = config.headers?.Authorization || config.headers?.authorization;
    if (!current || /Bearer\s+(null|undefined)?$/.test(current)) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.__cecAuth = true;
  }
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const cfg = error.config || {};
    const url = cfg.baseURL ? `${cfg.baseURL}${cfg.url || ""}` : cfg.url;
    if (error.response?.status === 401 && cfg.__cecAuth && !isAuthEndpoint(url || "")) {
      handleSessionExpired();
    }
    return Promise.reject(error);
  }
);

// ---- fetch ----
if (typeof window !== "undefined" && !window.__cecFetchPatched) {
  window.__cecFetchPatched = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.href : input?.url;

    if (!isApiUrl(url)) return originalFetch(input, init);

    const token = getToken();
    let attached = false;
    if (token) {
      const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
      const current = headers.get("Authorization");
      if (!current || /Bearer\s+(null|undefined)?$/.test(current)) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      init = { ...init, headers };
      attached = true;
    }

    const res = await originalFetch(input, init);
    if (res.status === 401 && attached && !isAuthEndpoint(url)) handleSessionExpired();
    return res;
  };
}
