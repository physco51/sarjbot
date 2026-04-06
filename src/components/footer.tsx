export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-[#0B1120] py-8 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-primary">{"\u26A1"}</span>
            <span className="font-semibold text-foreground">SarjBot</span>
            <span className="text-muted-foreground/60">|</span>
            <span>Turkiye EV Sarj Fiyat Karsilastirma</span>
          </div>
          <p className="text-xs text-muted-foreground/60 text-center">
            Fiyatlar bilgi amaclidir. Guncel fiyatlar icin operatorlerin resmi sitelerini kontrol edin.
          </p>
        </div>
      </div>
    </footer>
  );
}
