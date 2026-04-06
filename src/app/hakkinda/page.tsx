export default function HakkindaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Hakkında</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">ŞarjBot Nedir?</h2>
          <p className="text-muted-foreground leading-relaxed">
            ŞarjBot, Türkiye&apos;deki tüm elektrikli araç şarj istasyonlarının
            güncel fiyatlarını tek bir sayfada karşılaştırmanızı sağlayan bir araçtır.
            AC, DC ve HPC şarj fiyatlarını görebilir, operatörleri karşılaştırabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Fiyatlar Nasıl Güncelleniyor?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Fiyatlar çeşitli kaynaklardan otomatik olarak çekilmektedir. Ayrıca ana sayfadaki
            &quot;Fiyatları Güncelle&quot; butonunu kullanarak manuel güncelleme yapabilirsiniz.
            Fiyatlar bilgi amaçlı olup, kesin fiyatlar için operatörlerin resmi sitelerini
            kontrol etmenizi öneririz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Desteklenen Operatörler</h2>
          <p className="text-muted-foreground leading-relaxed">
            ZES, Trugo, Eşarj, WAT Mobilite, Voltrun, Sharz.net, Beefull, Astor,
            RHG Enertürk, Tuncmatik Charge, SepasCharge, Elaris, EV-Bee, Oto-Jet,
            Porty, Volti, Tesla Supercharger, EnYakıt, Powersarj ve daha birçok
            operatörün fiyatları takip edilmektedir.
          </p>
        </section>
      </div>
    </div>
  );
}
