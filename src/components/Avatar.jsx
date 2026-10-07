import { useState } from "react";

/**
 * Shows a user's profile photo, or their first initial when there is no photo
 * or it fails to load.
 *
 * Google profile photos (lh3.googleusercontent.com) are often refused when the
 * browser sends the page address as the Referer, which is why they showed as
 * broken images. referrerPolicy="no-referrer" fixes that.
 *
 * `className` sizes and shapes both the photo and the fallback;
 * `fallbackClassName` adds colours/text styles for the initial.
 */
export default function Avatar({ src, name = "", className = "", fallbackClassName = "", alt }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={alt ?? `${name || "User"}'s profile photo`}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailedSrc(src)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt ?? `${name || "User"}'s profile`}
      className={`flex items-center justify-center shrink-0 ${className} ${fallbackClassName}`}
    >
      {initial}
    </div>
  );
}
