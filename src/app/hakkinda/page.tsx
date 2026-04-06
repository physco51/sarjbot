export default function HakkindaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Hakkinda</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">SarjBot Nedir?</h2>
          <p className="text-muted-foreground leading-relaxed">
            SarjBot, Turkiye&apos;deki tum elektrikli arac sarj istasyonlarinin
            guncel fiyatlarini tek bir sayfada karsilastirmanizi saglayan bir aractir.
            AC, DC ve HPC sarj fiyatlarini gorebilir, operatorleri karsilastirabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Fiyatlar Nasil Guncelleniyor?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Fiyatlar cesitli kaynaklardan otomatik olarak cekilmektedir. Ayrica ana sayfadaki
            &quot;Fiyatlari Guncelle&quot; butonunu kullanarak manuel guncelleme yapabilirsiniz.
            Fiyatlar bilgi amacli olup, kesin fiyatlar icin operatorlerin resmi sitelerini
            kontrol etmenizi oneririz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Desteklenen Operatorler</h2>
          <p className="text-muted-foreground leading-relaxed">
            ZES, Trugo, Esarj, WAT Mobilite, Voltrun, Sharz.net, Beefull, Astor,
            RHG Enerturk, Tuncmatik Charge, SepasCharge, Elaris, EV-Bee, Oto-Jet,
            Porty, Volti, Tesla Supercharger, Enyakit ve Powersarj operatorlerinin
            fiyatlari takip edilmektedir.
          </p>
        </section>
      </div>
    </div>
  );
}
