import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border/50 bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="text-lg">{"\u26A1"}</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Şarj<span className="text-primary">Bot</span>
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/">Fiyatlar</NavLink>
            <NavLink href="/karsilastir">Karşılaştır</NavLink>
            <NavLink href="/hesapla">Hesapla</NavLink>
            <NavLink href="/hakkinda">Hakkında</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
    >
      {children}
    </Link>
  );
}
