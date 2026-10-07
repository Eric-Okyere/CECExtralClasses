import "./services/http"; // must load first: adds the login token to every API request
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@fontsource-variable/lexend";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/caveat/600.css";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "450195054535-tbf14l0n9dhvjon1ili187agq5bcf89k.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
