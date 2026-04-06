"use client";

export function PlayStoreBadge({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Google Play'den indir"
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-border/40 hover:bg-white/10 hover:border-primary/30 transition-all group"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" fill="#4285F4"/>
        <path d="M17.05 8.751L5.071.738a1.005 1.005 0 00-1.462.156L13.793 12l3.258-3.249z" fill="#EA4335"/>
        <path d="M20.1 10.248l-3.05-1.497L13.793 12l3.258 3.249 3.049-1.497c.857-.424.857-1.08 0-1.504z" fill="#FBBC04"/>
        <path d="M3.609 22.186L13.793 12l3.258 3.249-11.98 6.013a1.005 1.005 0 01-1.462-.076z" fill="#34A853"/>
      </svg>
      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground leading-tight">
        Play Store
      </span>
    </a>
  );
}

export function AppStoreBadge({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="App Store'dan indir"
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-border/40 hover:bg-white/10 hover:border-primary/30 transition-all group"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" className="text-muted-foreground group-hover:text-foreground transition-colors"/>
      </svg>
      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground leading-tight">
        App Store
      </span>
    </a>
  );
}

export function AppLinks({
  playStoreUrl,
  appStoreUrl,
  compact,
}: {
  playStoreUrl: string | null;
  appStoreUrl: string | null;
  compact?: boolean;
}) {
  if (!playStoreUrl && !appStoreUrl) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {playStoreUrl && (
          <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" title="Google Play" className="p-1 rounded hover:bg-white/10 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" fill="#4285F4"/>
              <path d="M17.05 8.751L5.071.738a1.005 1.005 0 00-1.462.156L13.793 12l3.258-3.249z" fill="#EA4335"/>
              <path d="M20.1 10.248l-3.05-1.497L13.793 12l3.258 3.249 3.049-1.497c.857-.424.857-1.08 0-1.504z" fill="#FBBC04"/>
              <path d="M3.609 22.186L13.793 12l3.258 3.249-11.98 6.013a1.005 1.005 0 01-1.462-.076z" fill="#34A853"/>
            </svg>
          </a>
        )}
        {appStoreUrl && (
          <a href={appStoreUrl} target="_blank" rel="noopener noreferrer" title="App Store" className="p-1 rounded hover:bg-white/10 transition-colors">
            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {playStoreUrl && <PlayStoreBadge url={playStoreUrl} />}
      {appStoreUrl && <AppStoreBadge url={appStoreUrl} />}
    </div>
  );
}
