"use client";

import { useState } from "react";

export function OperatorFavicon({
  websiteUrl,
  name,
  size = 16,
}: {
  websiteUrl: string | null;
  name: string;
  size?: number;
}) {
  const [error, setError] = useState(false);

  if (!websiteUrl || error) {
    // Fallback: first letter circle
    return (
      <div
        className="rounded shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary"
        style={{ width: size, height: size }}
      >
        {name.charAt(0)}
      </div>
    );
  }

  let domain: string;
  try {
    domain = new URL(websiteUrl).hostname;
  } catch {
    return (
      <div
        className="rounded shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary"
        style={{ width: size, height: size }}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${size * 2}`}
      alt=""
      width={size}
      height={size}
      className="rounded shrink-0"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
