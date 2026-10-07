// API location. Override per environment with VITE_API_BASE_URL in a .env file, e.g.
//   VITE_API_BASE_URL=http://localhost:5001/api/
const raw = import.meta.env.VITE_API_BASE_URL || "https://cecbackend.onrender.com/api/";

export const API_BASE_URL = raw.endsWith("/") ? raw : `${raw}/`;
