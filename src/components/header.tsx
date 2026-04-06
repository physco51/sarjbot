import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold">SarjBot</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              Fiyatlar
            </Link>
            <Link href="/karsilastir" className="hover:text-primary transition-colors">
              Karsilastir
            </Link>
            <Link href="/hakkinda" className="hover:text-primary transition-colors">
              Hakkinda
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
