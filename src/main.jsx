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
  "744447080939-74851r8ek6pjl8ogs0q35kmsrmnvs8re.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
