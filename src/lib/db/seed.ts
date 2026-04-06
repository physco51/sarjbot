import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { operators, prices, priceHistory } from "./schema";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, "sarjbot.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS operators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    website_url TEXT,
    play_store_url TEXT,
    app_store_url TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operator_id INTEGER NOT NULL REFERENCES operators(id),
    charge_type TEXT NOT NULL CHECK(charge_type IN ('AC','DC','HPC')),
    price_min REAL NOT NULL,
    price_max REAL,
    unit TEXT DEFAULT 'TL/kWh',
    note TEXT,
    source TEXT,
    source_url TEXT,
    is_verified INTEGER DEFAULT 1,
    is_available INTEGER DEFAULT 1,
    updated_at INTEGER DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operator_id INTEGER NOT NULL REFERENCES operators(id),
    charge_type TEXT NOT NULL CHECK(charge_type IN ('AC','DC','HPC')),
    price_min REAL NOT NULL,
    price_max REAL,
    source TEXT,
    recorded_at INTEGER DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS scrape_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('success','failure','partial')),
    operators_updated INTEGER DEFAULT 0,
    error_message TEXT,
    started_at INTEGER DEFAULT (unixepoch()),
    completed_at INTEGER
  );
`);

// Turkiye'deki tum EV sarj operatorleri (turkiye_ev_sarj_analiz.xlsx + mevcut)
const operatorData = [
  // === Excel listesindeki 100 operator ===
  { name: "ZES (Zorlu Energy)", slug: "zes", websiteUrl: "https://zes.net/fiyatlar-tr", description: "81 ilde en genis ag ve en cok soket" },
  { name: "Trugo (Togg)", slug: "trugo", websiteUrl: "https://www.trugo.com.tr/price", description: "Sadece ultra hizli (180-300kW) odakli" },
  { name: "Esarj (Enerjisa)", slug: "esarj", websiteUrl: "https://esarj.com/tarifeler", description: "Sehir ici ve otoyollarda cok guclu" },
  { name: "Sharz.net", slug: "sharz", websiteUrl: "https://sharz.net", description: "Yaygin bayi ve istasyon agi" },
  { name: "WAT Mobilite (Koc)", slug: "wat", websiteUrl: "https://www.watmobilite.com/cozumler/kamusal-alanlar", description: "Premium lokasyonlar ve Opet istasyonlari" },
  { name: "En Yakit", slug: "enyakit", websiteUrl: "https://enyakit.com.tr", description: "Tamamen hizli sarj (DC) odakli operasyon" },
  { name: "Otojet (Guzel Enerji)", slug: "oto-jet", websiteUrl: "https://oto-jet.com.tr/fiyatlarimiz.html", description: "TotalEnergies ve M Oil istasyonlari" },
  { name: "Astor Sarj", slug: "astor", websiteUrl: "https://www.astorsarj.com.tr", description: "Otoyol tesislerinde ultra hizli sarj" },
  { name: "Voltrun", slug: "voltrun", websiteUrl: "https://www.voltrun.com/voltrun-uyelik-tarife/", description: "Site, plaza ve sehir ici odakli" },
  { name: "Oncharge (Kalyon)", slug: "oncharge", websiteUrl: "https://oncharge.com.tr/fiyatlar", description: "AVM, konut ve stratejik otoyol noktalari" },
  { name: "Shell Recharge", slug: "shell-recharge", websiteUrl: "https://www.shell.com.tr/suruculer/shell-recharge-turkiye/fiyat-tarifesi.html", description: "Shell istasyonlari icindeki global ag" },
  { name: "e-POW (Petrol Ofisi)", slug: "e-pow", websiteUrl: "https://www.petrolofisi.com.tr/en/product-and-services/e-power", description: "Petrol Ofisi aginda entegre cozum" },
  { name: "Enerturk (RHG)", slug: "rhg-enerturk", websiteUrl: "https://www.enerturk.com/en/charge/membership-tariffs", description: "Ic Anadolu ve organize sanayi bolgeleri" },
  { name: "Aytemiz", slug: "aytemiz", websiteUrl: null, description: "Kendi akaryakit istasyonlarinda hizli sarj" },
  { name: "D-Charge (Dogus)", slug: "d-charge", websiteUrl: "https://dcharge.com.tr/tarifeler", description: "Audi, Porsche ve luks segment odakli" },
  { name: "Beefull", slug: "beefull", websiteUrl: "https://beefull.com/tarifeler/elektrikli-arac-tarifesi/", description: "Kafe, restoran ve otopark odakli" },
  { name: "CW Enerji", slug: "cw-enerji", websiteUrl: "https://cv-charging.com/en/electric-vehicle-charging-tariffs", description: "Gunes enerjisi cozumleriyle entegre" },
  { name: "Aksa Sarj", slug: "aksa-sarj", websiteUrl: "https://www.aksasarj.com.tr/tr/ucretler", description: "Stratejik enerji noktalari" },
  { name: "Q Charge", slug: "q-charge", websiteUrl: "https://qcharge.io/en/prices/", description: "Marmara ve Ege'de hizli buyume" },
  { name: "Tuncmatik Sarj", slug: "tuncmatik", websiteUrl: "https://tuncmatikcharge.com/fiyatlar/", description: "Guc sistemleri tecrubeli operator" },
  { name: "U-Sarj (TCDD)", slug: "u-sarj", websiteUrl: "https://usarj.com.tr/", description: "Lojistik ve ulasim merkezleri" },
  { name: "Kainat Hybrid", slug: "kainat-hybrid", websiteUrl: null, description: "Otoyol baglanti noktalari" },
  { name: "Ecoconnect", slug: "ecoconnect", websiteUrl: "https://econ.net.tr/", description: "Sehir ici mikro-mobilite ve otoparklar" },
  { name: "Tuncay EV", slug: "tuncay-ev", websiteUrl: null, description: "Bursa merkezli bolgesel guc" },
  { name: "B-Charge (Bakirci)", slug: "b-charge", websiteUrl: null, description: "Yetkili servis ve bayi aglari" },
  { name: "Hizzlan", slug: "hizzlan", websiteUrl: "https://hizzlan.com/en/pricing-and-plans", description: "Yeni nesil hizli sarj yatirimi" },
  { name: "K-Sarj (Hunat)", slug: "k-sarj", websiteUrl: "https://ksarj.com/fiyatlandirma", description: "Yerel odakli projeler" },
  { name: "Checkpoint", slug: "checkpoint", websiteUrl: null, description: "Ege bolgesi sahil seridi odakli" },
  { name: "Waygo (Tripy)", slug: "waygo", websiteUrl: null, description: "Paylasimli arac ve sehir ici AC odakli" },
  { name: "Arcona Teknoloji", slug: "arcona", websiteUrl: null, description: "Teknoloji kampusleri ve is merkezleri" },
  { name: "Alaska (MCZ)", slug: "alaska", websiteUrl: null, description: "Dogu ve Guneydogu odakli ag" },
  { name: "360 Enerji", slug: "360-enerji", websiteUrl: "https://sarj.360enerji.com.tr/", description: "Sehir ici ticari alanlar" },
  { name: "Alka Solar", slug: "alka-solar", websiteUrl: null, description: "Yenilenebilir enerji entegreli" },
  { name: "Bepet Petrol", slug: "bepet", websiteUrl: null, description: "Yerel akaryakit istasyonlari" },
  { name: "Ziraat Filo", slug: "ziraat-filo", websiteUrl: null, description: "Kamu ve banka lokasyonlari" },
  { name: "Yapi Kredi Sarj", slug: "yapi-kredi", websiteUrl: null, description: "Banka subeleri ve anlasmalı noktalar" },
  { name: "TT Ventures", slug: "tt-ventures", websiteUrl: "https://e4sarj.com.tr/", description: "Turk Telekom lokasyonlari" },
  { name: "Everstart (Migen)", slug: "everstart", websiteUrl: "https://www.mig-go.com", description: "Sanayi ve lojistik merkezleri" },
  { name: "otoWATT (Aydem)", slug: "otowatt", websiteUrl: "https://www.otowatt.com.tr", description: "Ege ve Bati Akdeniz odakli" },
  { name: "Green Sarj", slug: "green-sarj", websiteUrl: "https://greensarjistasyonlari.com/", description: "Cevre dostu tesis projeleri" },
  { name: "Mycharge (Manas)", slug: "mycharge", websiteUrl: "https://mycharge.com.tr/tarifeler/", description: "Organize sanayi ve tekstil bolgeleri" },
  { name: "Ecobox (Atay)", slug: "ecobox", websiteUrl: "https://www.ecoboxsarj.com/tarifeler", description: "Bolgesel otopark cozumleri" },
  { name: "Volnet Enerji", slug: "volnet", websiteUrl: null, description: "Sehir ici hizli kurulumlar" },
  { name: "Bladeco", slug: "bladeco", websiteUrl: "https://www.bladeco.com.tr/tarifeler/", description: "Butik istasyon noktalari" },
  { name: "Sarjplus", slug: "sarjplus", websiteUrl: null, description: "Marmara bolgesi yerel ag" },
  { name: "Ispirli Sarj", slug: "ispirli", websiteUrl: "https://www.ispirlisarj.com/tarifeler/", description: "Dogu Anadolu bolgesel yatirim" },
  { name: "Arsima Enerji", slug: "arsima", websiteUrl: "https://www.arsimaenerji.com/tarifeler.html", description: "Yerel belediye is birlikleri" },
  { name: "Konya Sarj", slug: "konya-sarj", websiteUrl: null, description: "Konya ve cevresi yerel operator" },
  { name: "Zeplin Turizm", slug: "zeplin", websiteUrl: "https://www.zeplinenerji.com.tr/", description: "Arac kiralama ofisleri ve havalimanlari" },
  { name: "Fortis Enerji", slug: "fortis", websiteUrl: "https://www.fortissarj.com/tr/", description: "Buyuk olcekli enerji yatirimlari" },
  { name: "Gosarj (Dyno)", slug: "gosarj", websiteUrl: null, description: "Ekspertiz noktalari ve servisler" },
  { name: "Alfamet Sarj", slug: "alfamet", websiteUrl: null, description: "Sanayi bolgeleri odakli" },
  { name: "Dicle Kok", slug: "dicle-kok", websiteUrl: "https://www.diclekokenerji.com.tr/", description: "Guneydogu Anadolu projeleri" },
  { name: "Filoport", slug: "filoport", websiteUrl: null, description: "Filo ve lojistik garajlari" },
  { name: "Magicline", slug: "magicline", websiteUrl: "https://elektrikliaracmarketim.com/", description: "Turistik bolgeler ve oteller" },
  { name: "GSM Charge", slug: "gsm-charge", websiteUrl: "https://www.gsmcharge.com.tr/en/prices/", description: "Iletisim kuleleri ve cevresi" },
  { name: "Onizsarj", slug: "onizsarj", websiteUrl: "https://onizsarj.com/fiyat-tarifesi/", description: "Insaat ve konut projeleri" },
  { name: "Kofteci Yusuf", slug: "kofteci-yusuf", websiteUrl: "https://kofteciyusuf.com.tr", description: "Sube otoparklarinda yuksek hizli sarj" },
  { name: "Smart Solargize", slug: "smart-solargize", websiteUrl: "https://solargize.com.tr/fiyatlar/", description: "Fabrika cati GES projeleriyle entegre" },
  { name: "Evbee", slug: "ev-bee", websiteUrl: "https://www.ev-bee.com/sabit-sarj-istasyonlari-fiyat-listesi", description: "Mobil sarj ve acil sarj cozumleri" },
  { name: "Aktif Sarj", slug: "aktif-sarj", websiteUrl: null, description: "Kamu binalari ve hastaneler" },
  { name: "Clixolar", slug: "clixolar", websiteUrl: "https://www.clixsolar.com/otoparklar/", description: "Perakende satis noktalari" },
  { name: "Monokon", slug: "monokon", websiteUrl: "https://www.monokonev.com/Price", description: "Rezidans ve plaza otoparklari" },
  { name: "Soil (Siyam)", slug: "soil", websiteUrl: null, description: "Soil akaryakit istasyonlari" },
  { name: "Mirsolar", slug: "mirsolar", websiteUrl: null, description: "Gunes enerjisi tarlalari cevresi" },
  { name: "Kingpower (Jetco)", slug: "kingpower", websiteUrl: null, description: "Ultra hizli teknolojik uniteler" },
  { name: "King Sarj", slug: "king-sarj", websiteUrl: null, description: "Yerel girisim agi" },
  { name: "Sarjon", slug: "sarjon", websiteUrl: "https://sarjon.com.tr/fiyatlar/", description: "Akilli sehir projeleri" },
  { name: "Borenco (Borusan)", slug: "borenco", websiteUrl: "https://5sarj.com/en", description: "BMW/Land Rover bayi ve servisleri" },
  { name: "G-Sarj (Gersan)", slug: "g-sarj", websiteUrl: "https://g-charge.com.tr", description: "Donanim ureticisi odakli ag" },
  { name: "Ronesans Sarj", slug: "ronesans", websiteUrl: null, description: "AVM ve buyuk insaat projeleri" },
  { name: "Turksarj", slug: "turksarj", websiteUrl: "https://turksarj.com.tr/ucretlendirme/", description: "Anadolu geneli yayilim" },
  { name: "Soil Sarj", slug: "soil-sarj", websiteUrl: null, description: "Akaryakit agi entegrasyonu" },
  { name: "Enom Elektrik", slug: "enom", websiteUrl: null, description: "Teknik altyapi odakli butik ag" },
  { name: "Alaska Enerji", slug: "alaska-enerji", websiteUrl: null, description: "Bolgesel hizli sarj" },
  { name: "FZY Enerji", slug: "fzy", websiteUrl: null, description: "Yenilenebilir kaynakli istasyonlar" },
  { name: "Interdata", slug: "interdata", websiteUrl: null, description: "Veri merkezleri ve teknokentler" },
  { name: "RST Teknoloji", slug: "rst", websiteUrl: null, description: "Ar-Ge merkezleri odakli" },
  { name: "Fotec Enerji", slug: "fotec", websiteUrl: null, description: "Otoyol kenari dinlenme tesisleri" },
  { name: "Royco (Siha)", slug: "royco", websiteUrl: null, description: "Lojistik depolari" },
  { name: "Petrodem", slug: "petrodem", websiteUrl: null, description: "Butik akaryakit istasyonlari" },
  { name: "Lumhouse", slug: "lumhouse", websiteUrl: "https://lumicle.com.tr/", description: "Akilli ev ve site projeleri" },
  { name: "Bolgedem", slug: "bolgedem", websiteUrl: null, description: "Muhendislik projeleri odakli" },
  { name: "Promaster", slug: "promaster", websiteUrl: null, description: "Danismanlik ve kurumsal filolar" },
  { name: "Imaj Design", slug: "imaj-design", websiteUrl: null, description: "Tasarim ofisleri ve butik noktalar" },
  { name: "Ispirli Enerji", slug: "ispirli-enerji", websiteUrl: null, description: "Dogu Anadolu enerji aglari" },
  { name: "Arenya Enerji", slug: "arenya", websiteUrl: null, description: "Turistik tesis yatirimlari" },
  { name: "Artas Enerji", slug: "artas", websiteUrl: null, description: "Avrupa Konutlari ve tema projeleri" },
  { name: "Solar Arac", slug: "solar-arac", websiteUrl: null, description: "GES park alanlari" },
  { name: "Arsima Sarj", slug: "arsima-sarj", websiteUrl: "https://www.arsimaenerji.com/tarifeler.html", description: "Yerel market otoparklari" },
  { name: "Konya Karatay", slug: "konya-karatay", websiteUrl: null, description: "Belediye odakli sarj noktalari" },
  { name: "Zeplin Filo", slug: "zeplin-filo", websiteUrl: null, description: "Kiralik arac kullanici odakli" },
  { name: "KRNEnerji", slug: "krn-enerji", websiteUrl: null, description: "Bolgesel kucuk isletmeler" },
  { name: "Forsel", slug: "forsel", websiteUrl: null, description: "Sanayi sitesi icleri" },
  { name: "Ayhan Teknoloji", slug: "ayhan", websiteUrl: "https://aostechnology.com.tr/", description: "Teknoloji marketleri cevresi" },
  { name: "Toger (Mionti)", slug: "toger", websiteUrl: "https://toger.co/pricing", description: "Butik otel ve tatil koyleri" },
  { name: "Dynopower", slug: "dynopower", websiteUrl: null, description: "Arac bakim merkezleri" },
  { name: "Alfasharj", slug: "alfasharj", websiteUrl: null, description: "Bati Anadolu hizli DC agi" },
  // === Excel'de olmayan ama fiyati bilinen operatorler ===
  { name: "SepasCharge", slug: "sepascharge", websiteUrl: "https://sepascharge.com/sarj-ucretleri", description: "Uygun fiyatli AC/DC sarj" },
  { name: "Elaris", slug: "elaris", websiteUrl: "https://elaris.com.tr/elaris-tarife/", description: "Genis fiyat araligi" },
  { name: "Porty", slug: "porty", websiteUrl: null, description: "DC sarj odakli" },
  { name: "Volti", slug: "volti", websiteUrl: "https://volti.com/elektrikli-arac-sarj-fiyatlari/", description: "AC ve DC sarj hizmetleri" },
  { name: "Tesla Supercharger", slug: "tesla", websiteUrl: "https://tesla.com", description: "Tesla ve diger araclara acik" },
  { name: "Powersarj", slug: "powersarj", websiteUrl: "https://powersarj.com/fiyatlandirma", description: "AC ve DC sarj istasyonlari" },
  { name: "Neva Charge", slug: "neva-charge", websiteUrl: "https://www.nevasarj.com/pages/ourstations/car-charger-ac-dc-kwh-price-tariff.html", description: "AC ve DC sarj istasyonlari" },
];

// App store links mapping
const appLinks: Record<string, { playStore: string | null; appStore: string | null }> = {
  "zes": { playStore: "https://play.google.com/store/apps/details?id=com.solidict.zorluenerji", appStore: "https://apps.apple.com/us/app/zes-ev-station-network/id1401503272" },
  "trugo": { playStore: "https://play.google.com/store/apps/details?id=com.togg.trugoapp", appStore: "https://apps.apple.com/tr/app/trugo/id6443913003" },
  "esarj": { playStore: "https://play.google.com/store/apps/details?id=com.esarj.mobile", appStore: "https://apps.apple.com/tr/app/e%C5%9Farj-mobile/id982709995" },
  "sharz": { playStore: "https://play.google.com/store/apps/details?id=com.ipitex.sharz", appStore: "https://apps.apple.com/us/app/sharz/id1445392005" },
  "wat": { playStore: "https://play.google.com/store/apps/details?id=com.watmobilite.watchtower", appStore: "https://apps.apple.com/tr/app/wat-mobilite-%C5%9Farj/id6754679342" },
  "enyakit": { playStore: "https://play.google.com/store/apps/details?id=com.ilerleyen.EnYakit", appStore: "https://apps.apple.com/tr/app/enyak%C4%B1t/id1498514720" },
  "oto-jet": { playStore: "https://play.google.com/store/apps/details?id=com.otojet.evcharge", appStore: "https://apps.apple.com/ge/app/otojet-ara%C3%A7-%C5%9Farj-i-stasyon-a%C4%9F%C4%B1/id6444728320" },
  "astor": { playStore: "https://play.google.com/store/apps/details?id=com.astor", appStore: "https://apps.apple.com/us/app/astor-%C5%9Farj/id1658407530" },
  "voltrun": { playStore: "https://play.google.com/store/apps/details?id=com.voltrun", appStore: "https://apps.apple.com/us/app/voltrun/id1242236792" },
  "oncharge": { playStore: "https://play.google.com/store/apps/details?id=com.kalyonev.oncharge", appStore: "https://apps.apple.com/us/app/oncharge-ev-charging-station/id1631342279" },
  "shell-recharge": { playStore: "https://play.google.com/store/apps/details?id=com.togg.shellapp", appStore: "https://apps.apple.com/tr/app/shell-recharge-t%C3%BCrkiye/id6451115578" },
  "e-pow": { playStore: "https://play.google.com/store/apps/details?id=com.petrolofisi.epower", appStore: "https://apps.apple.com/us/app/e-power/id6444776305" },
  "rhg-enerturk": { playStore: "https://play.google.com/store/apps/details?id=com.enerturk", appStore: "https://apps.apple.com/tr/app/rhg-enerturk/id6443610258" },
  "d-charge": { playStore: "https://play.google.com/store/apps/details?id=tr.com.dteknoloji.dcharge", appStore: "https://apps.apple.com/kw/app/d-charge/id6477779137" },
  "beefull": { playStore: "https://play.google.com/store/apps/details?id=com.beefull.charge", appStore: "https://apps.apple.com/tr/app/beefull/id1592420541" },
  "tuncmatik": { playStore: "https://play.google.com/store/apps/details?id=com.doldurmobile.tuncmatik", appStore: "https://apps.apple.com/us/app/tuncmatik-charge/id6470379374" },
  "sepascharge": { playStore: "https://play.google.com/store/apps/details?id=com.sepas.sepas", appStore: "https://apps.apple.com/tr/app/sepascharge/id6743440030" },
  "elaris": { playStore: "https://play.google.com/store/apps/details?id=com.elaris.mobil", appStore: "https://apps.apple.com/us/app/elaris/id6747248231" },
  "porty": { playStore: "https://play.google.com/store/apps/details?id=porty.com.thetwoweeks", appStore: "https://apps.apple.com/gr/app/porty4car/id6504822077" },
  "volti": { playStore: "https://play.google.com/store/apps/details?id=com.plugsurfing.volti", appStore: "https://apps.apple.com/tr/app/volti-network/id6445827156" },
  "tesla": { playStore: "https://play.google.com/store/apps/details?id=com.teslamotors.tesla", appStore: "https://apps.apple.com/us/app/tesla/id582007913" },
  "powersarj": { playStore: "https://play.google.com/store/apps/details?id=com.marsis.powersarjapp", appStore: "https://apps.apple.com/us/app/power%C5%9Farj/id6443541077" },
  "ev-bee": { playStore: "https://play.google.com/store/apps/details?id=com.maviarge.evbee", appStore: null },
  "k-sarj": { playStore: "https://play.google.com/store/apps/details?id=com.ipitex.ksarj", appStore: "https://apps.apple.com/tr/app/ksarj/id6470809641" },
  "mycharge": { playStore: "https://play.google.com/store/apps/details?id=com.mechatronic.ev", appStore: "https://apps.apple.com/tr/app/mycharge/id6737592400" },
  "monokon": { playStore: "https://play.google.com/store/apps/details?id=com.monokon.monokonev", appStore: "https://apps.apple.com/tr/app/monokon-ev-charge/id6449960542" },
  "fortis": { playStore: "https://play.google.com/store/apps/details?id=com.fortisenergy", appStore: "https://apps.apple.com/pe/app/fortis-energy/id6450174012" },
  "clixolar": { playStore: "https://play.google.com/store/apps/details?id=com.clixsolar.electrinn", appStore: "https://apps.apple.com/fi/app/clixsolar/id6468252945" },
  "everstart": { playStore: "https://play.google.com/store/apps/details?id=tr.com.migros.miggosarj", appStore: "https://apps.apple.com/us/app/miggo-%C5%9Farj/id6444700185" },
  "sarjon": { playStore: "https://play.google.com/store/apps/details?id=com.sarjon.cp.app", appStore: "https://apps.apple.com/us/app/sarjon/id1587123679" },
  "smart-solargize": { playStore: "https://play.google.com/store/apps/details?id=com.smartsolar.solargize", appStore: "https://apps.apple.com/us/app/solargize/id6464482583" },
  "hizzlan": { playStore: "https://play.google.com/store/apps/details?id=com.hizzlan.hizzlan", appStore: "https://apps.apple.com/us/app/h%C4%B1zzlan/id6448905773" },
  "gsm-charge": { playStore: "https://play.google.com/store/apps/details?id=tr.com.gsmcharge.app", appStore: "https://apps.apple.com/us/app/gsm-charge/id6444185286" },
  "onizsarj": { playStore: "https://play.google.com/store/apps/details?id=com.oniz", appStore: "https://apps.apple.com/il/app/%C3%B6niz%C5%9Farj/id6449744070" },
  "neva-charge": { playStore: "https://play.google.com/store/apps/details?id=io.electroop.nevasarj", appStore: "https://apps.apple.com/us/app/neva-%C5%9Farj/id1666078045" },
  "aksa-sarj": { playStore: "https://play.google.com/store/apps/details?id=tr.com.aksaelektrik.aksasarj", appStore: "https://apps.apple.com/us/app/aksa-%C5%9Farj/id1554479978" },
  "360-enerji": { playStore: "https://play.google.com/store/apps/details?id=io.electroop.enerji360", appStore: "https://apps.apple.com/us/app/360-enerji/id1667460333" },
  "arsima": { playStore: "https://play.google.com/store/apps/details?id=com.arsimaenergy", appStore: "https://apps.apple.com/tr/app/arsima-energy/id6450647894" },
  "bladeco": { playStore: "https://play.google.com/store/apps/details?id=com.bladeco.bladecocharge", appStore: "https://apps.apple.com/tr/app/bladeco-charge/id6473955452" },
  "dicle-kok": { playStore: "https://play.google.com/store/apps/details?id=com.fourtek.otopriz", appStore: "https://apps.apple.com/tr/app/otopriz/id6447184127" },
  "ecobox": { playStore: "https://play.google.com/store/apps/details?id=com.ecobox.ev", appStore: "https://apps.apple.com/tr/app/ecobox-%C5%9Farj/id6451493157" },
  "ispirli": { playStore: "https://play.google.com/store/apps/details?id=com.ispirli.ispirli", appStore: "https://apps.apple.com/us/app/i-%C5%9Farj/id6448745018" },
  "lumhouse": { playStore: "https://play.google.com/store/apps/details?id=io.electroop.lumicle", appStore: "https://apps.apple.com/us/app/lumicle/id1639325347" },
  "magicline": { playStore: "https://play.google.com/store/apps/details?id=com.magiclinesarj.magiclinemobile", appStore: "https://apps.apple.com/es/app/magicline-sarj/id6447995507" },
  "toger": { playStore: "https://play.google.com/store/apps/details?id=com.toger.app", appStore: "https://apps.apple.com/tr/app/toger-ara%C3%A7-%C5%9Farj-i-stasyon-a%C4%9F%C4%B1/id6449187134" },
  "u-sarj": { playStore: "https://play.google.com/store/apps/details?id=com.usarj", appStore: null },
  "zeplin": { playStore: "https://play.google.com/store/apps/details?id=com.doldurmobile.zeplin", appStore: "https://apps.apple.com/us/app/zeplin-energy/id6478288649" },
  "q-charge": { playStore: "https://play.google.com/store/apps/details?id=com.meta.qcharge", appStore: "https://apps.apple.com/tr/app/q-charge-sarj-i-stasyon-a%C4%9F%C4%B1/id6446162797" },
  "otowatt": { playStore: "https://play.google.com/store/apps/details?id=com.ipitex.otowatt", appStore: "https://apps.apple.com/tr/app/otowatt/id1598883799" },
  "g-sarj": { playStore: "https://play.google.com/store/apps/details?id=com.gersan.gcharge", appStore: "https://apps.apple.com/sa/app/g-charge/id1667358064" },
  "cw-enerji": { playStore: "https://play.google.com/store/apps/details?id=com.cw.chargingvehicles", appStore: "https://apps.apple.com/tr/app/cv-charging-vehicles/id6443815181" },
  "tt-ventures": { playStore: "https://play.google.com/store/apps/details?id=com.arac.e4sarj", appStore: "https://apps.apple.com/us/app/e4%C5%9Farj/id6447972292" },
  "ecoconnect": { playStore: "https://play.google.com/store/apps/details?id=com.raquun.econ", appStore: "https://apps.apple.com/us/app/econ/id6448791614" },
  "borenco": { playStore: "https://play.google.com/store/apps/details?id=com.borencoevcharge", appStore: "https://apps.apple.com/tr/app/5-%C5%9Farj-nearby-charging-point/id6450214747" },
  "ayhan": { playStore: "https://play.google.com/store/apps/details?id=com.ipitex.aostech", appStore: "https://apps.apple.com/tr/app/aos-technology/id6449093268" },
  "kofteci-yusuf": { playStore: "https://play.google.com/store/apps/details?id=com.kofteciyusufsarj.mobile", appStore: "https://apps.apple.com/us/app/k%C3%B6fteci-yusuf-%C5%9Farj/id6473527360" },
  "arsima-sarj": { playStore: "https://play.google.com/store/apps/details?id=com.arsimaenergy", appStore: "https://apps.apple.com/tr/app/arsima-energy/id6450647894" },
};

// [slug, chargeType, priceMin, priceMax, note, source, sourceUrl, isVerified]
type PriceRow = [string, "AC"|"DC"|"HPC", number, number|null, string, string, string, boolean];

const priceData: PriceRow[] = [
  // === RESMI SITEDEN DOGRULANMIS ===
  ["zes", "AC", 9.99, null, "22 kW", "zes.net", "https://zes.net/fiyatlar-tr", true],
  ["zes", "DC", 12.99, null, "180 kW'a kadar", "zes.net", "https://zes.net/fiyatlar-tr", true],
  ["zes", "HPC", 16.49, null, "180-720 kW", "zes.net", "https://zes.net/fiyatlar-tr", true],
  ["esarj", "AC", 9.90, null, "22 kW", "esarj.com", "https://esarj.com/tarifeler", true],
  ["esarj", "DC", 13.50, null, "DC", "esarj.com", "https://esarj.com/tarifeler", true],
  ["voltrun", "AC", 9.90, null, "22 kW", "voltrun.com", "https://www.voltrun.com/voltrun-uyelik-tarife/", true],
  ["voltrun", "DC", 12.90, null, "DC", "voltrun.com", "https://www.voltrun.com/voltrun-uyelik-tarife/", true],
  ["beefull", "AC", 9.90, null, "Tip-2", "beefull.com", "https://beefull.com/tarifeler/elektrikli-arac-tarifesi/", true],
  ["beefull", "DC", 12.99, null, "DC-HP CCS", "beefull.com", "https://beefull.com/tarifeler/elektrikli-arac-tarifesi/", true],
  ["astor", "AC", 9.49, null, "22 kW", "astorsarj.com.tr", "https://www.astorsarj.com.tr", true],
  ["astor", "DC", 12.49, null, "DC", "astorsarj.com.tr", "https://www.astorsarj.com.tr", true],
  ["rhg-enerturk", "AC", 6.60, 9.98, "AC-2 / AC-1", "enerturk.com", "https://www.enerturk.com/en/charge/membership-tariffs", true],
  ["rhg-enerturk", "DC", 12.49, null, "DC", "enerturk.com", "https://www.enerturk.com/en/charge/membership-tariffs", true],
  ["tuncmatik", "AC", 10.99, null, "AC Soket", "tuncmatikcharge.com", "https://tuncmatikcharge.com/fiyatlar/", true],
  ["tuncmatik", "DC", 15.49, null, "DC Soket", "tuncmatikcharge.com", "https://tuncmatikcharge.com/fiyatlar/", true],
  ["sepascharge", "AC", 8.99, null, "22 kW", "sepascharge.com", "https://sepascharge.com/sarj-ucretleri", true],
  ["sepascharge", "DC", 10.99, null, "80-200 kW", "sepascharge.com", "https://sepascharge.com/sarj-ucretleri", true],
  ["elaris", "AC", 8.49, 9.49, "AC-21 Konut / AC-22 Kamusal", "elaris.com.tr", "https://elaris.com.tr/elaris-tarife/", true],
  ["elaris", "DC", 10.00, null, "DC", "elaris.com.tr", "https://elaris.com.tr/elaris-tarife/", true],
  ["ev-bee", "AC", 9.95, null, "22 kW", "ev-bee.com", "https://www.ev-bee.com/sabit-sarj-istasyonlari-fiyat-listesi", true],
  ["ev-bee", "DC", 13.78, null, "150 kW'a kadar", "ev-bee.com", "https://www.ev-bee.com/sabit-sarj-istasyonlari-fiyat-listesi", true],
  ["ev-bee", "HPC", 15.36, null, "150 kW uzeri", "ev-bee.com", "https://www.ev-bee.com/sabit-sarj-istasyonlari-fiyat-listesi", true],
  ["oto-jet", "AC", 10.49, null, "Type 2 (7.5-22 kW)", "oto-jet.com.tr", "https://oto-jet.com.tr/fiyatlarimiz.html", true],
  ["oto-jet", "DC", 13.99, null, "CHAdeMO / CCS", "oto-jet.com.tr", "https://oto-jet.com.tr/fiyatlarimiz.html", true],
  ["volti", "AC", 9.99, null, "22 kW", "volti.com", "https://volti.com/elektrikli-arac-sarj-fiyatlari/", true],
  ["volti", "DC", 12.99, null, "DC", "volti.com", "https://volti.com/elektrikli-arac-sarj-fiyatlari/", true],
  ["powersarj", "AC", 9.99, null, "3.4-22 kW", "powersarj.com", "https://powersarj.com/fiyatlandirma", true],
  ["powersarj", "DC", 11.99, 12.49, "30-90 kW / 90-320 kW", "powersarj.com", "https://powersarj.com/fiyatlandirma", true],
  // Trugo - trugo.com.tr/price JS bundle icinden (resmi site, JS-rendered)
  ["trugo", "AC", 9.95, null, "22 kW ve alti", "trugo.com.tr", "https://www.trugo.com.tr/price", true],
  ["trugo", "DC", 13.78, null, "150 kW'a kadar", "trugo.com.tr", "https://www.trugo.com.tr/price", true],
  ["trugo", "HPC", 15.36, null, "150 kW ve uzeri", "trugo.com.tr", "https://www.trugo.com.tr/price", true],
  // WAT Mobilite - watmobilite.com/cozumler/kamusal-alanlar
  ["wat", "AC", 8.99, 9.99, "22 kW", "watmobilite.com", "https://www.watmobilite.com/cozumler/kamusal-alanlar", true],
  ["wat", "DC", 12.99, 14.49, "DC", "watmobilite.com", "https://www.watmobilite.com/cozumler/kamusal-alanlar", true],
  // === DOGRULANAMADI - Resmi siteye erisilemedi ===
  ["sharz", "AC", 9.49, null, "22 kW", "araclo.com", "https://www.araclo.com/elektrikli-arac-sarj-tarifeleri", false],
  ["sharz", "DC", 12.49, null, "DC", "araclo.com", "https://www.araclo.com/elektrikli-arac-sarj-tarifeleri", false],
  ["tesla", "DC", 9.40, null, "Tesla sahipleri", "chip.com.tr", "https://www.chip.com.tr/guncel/tesla-turkiyede-supercharger-fiyatlarina-zam-yapti_174670.html", false],
  ["porty", "AC", 8.40, null, "AC", "donanimhaber.com", "https://www.donanimhaber.com/elektrik-arac-sarj-istasyonlari-fiyat-listesi--191391", false],
  ["porty", "DC", 8.75, 9.90, "60kW / 60kW uzeri", "donanimhaber.com", "https://www.donanimhaber.com/elektrik-arac-sarj-istasyonlari-fiyat-listesi--191391", false],
  ["enyakit", "DC", 14.90, null, "Tek tarife", "enyakit.com.tr", "https://www.enyakit.com.tr/ucretlendirme", false],
  // === YENI EKLENEN OPERATORLER ===
  ["k-sarj", "AC", 7.90, null, "22 kW", "ksarj.com", "https://ksarj.com/fiyatlandirma", true],
  ["k-sarj", "DC", 9.50, 9.90, "DC", "ksarj.com", "https://ksarj.com/fiyatlandirma", true],
  ["turksarj", "AC", 8.40, null, "22 kW", "turksarj.com.tr", "https://turksarj.com.tr/ucretlendirme/", true],
  ["turksarj", "DC", 10.40, null, "DC", "turksarj.com.tr", "https://turksarj.com.tr/ucretlendirme/", true],
  ["mycharge", "AC", 8.50, null, "22 kW", "mycharge.com.tr", "https://mycharge.com.tr/tarifeler/", true],
  ["mycharge", "DC", 12.00, null, "DC", "mycharge.com.tr", "https://mycharge.com.tr/tarifeler/", true],
  ["monokon", "AC", 8.50, null, "22 kW", "monokonev.com", "https://www.monokonev.com/Price", true],
  ["monokon", "DC", 10.50, null, "DC", "monokonev.com", "https://www.monokonev.com/Price", true],
  ["fortis", "AC", 8.99, null, "22 kW", "fortissarj.com", "https://www.fortissarj.com/tr/", true],
  ["fortis", "DC", 11.99, null, "DC", "fortissarj.com", "https://www.fortissarj.com/tr/", true],
  ["clixolar", "AC", 9.49, null, "22 kW", "clixsolar.com", "https://www.clixsolar.com/otoparklar/", true],
  ["clixolar", "DC", 12.99, null, "DC", "clixsolar.com", "https://www.clixsolar.com/otoparklar/", true],
  ["everstart", "AC", 9.50, null, "22 kW", "mig-go.com", "https://www.mig-go.com", true],
  ["everstart", "DC", 12.50, null, "DC", "mig-go.com", "https://www.mig-go.com", true],
  ["kofteci-yusuf", "AC", 9.95, null, "22 kW", "cheapsarj.com", "https://cheapsarj.com", false],
  ["kofteci-yusuf", "DC", 15.36, null, "DC", "cheapsarj.com", "https://cheapsarj.com", false],
  ["kofteci-yusuf", "HPC", 15.36, null, "HPC", "cheapsarj.com", "https://cheapsarj.com", false],
  ["sarjon", "AC", 9.99, null, "22 kW", "sarjon.com.tr", "https://sarjon.com.tr/fiyatlar/", true],
  ["sarjon", "DC", 11.99, null, "DC", "sarjon.com.tr", "https://sarjon.com.tr/fiyatlar/", true],
  ["sarjon", "HPC", 13.19, null, "HPC", "sarjon.com.tr", "https://sarjon.com.tr/fiyatlar/", true],
  ["smart-solargize", "AC", 9.99, null, "22 kW", "solargize.com.tr", "https://solargize.com.tr/fiyatlar/", true],
  ["smart-solargize", "DC", 11.99, null, "DC", "solargize.com.tr", "https://solargize.com.tr/fiyatlar/", true],
  // === ARASTIRMA AJANSILARI TARAFINDAN BULUNANLAR ===
  ["shell-recharge", "AC", 11.99, null, "22 kW", "shell.com.tr", "https://www.shell.com.tr/suruculer/shell-recharge-turkiye/fiyat-tarifesi.html", true],
  ["shell-recharge", "DC", 13.50, 15.99, "Tiered", "shell.com.tr", "https://www.shell.com.tr/suruculer/shell-recharge-turkiye/fiyat-tarifesi.html", true],
  ["e-pow", "AC", 8.49, null, "22 kW", "petrolofisi.com.tr", "https://www.petrolofisi.com.tr/en/product-and-services/e-power", true],
  ["e-pow", "DC", 10.99, null, "DC", "petrolofisi.com.tr", "https://www.petrolofisi.com.tr/en/product-and-services/e-power", true],
  ["oncharge", "AC", 9.99, null, "22 kW", "oncharge.com.tr", "https://oncharge.com.tr/fiyatlar", true],
  ["oncharge", "DC", 13.50, null, "60-180 kW", "oncharge.com.tr", "https://oncharge.com.tr/fiyatlar", true],
  ["hizzlan", "AC", 9.99, null, "22 kW", "hizzlan.com", "https://hizzlan.com/en/pricing-and-plans", true],
  ["hizzlan", "DC", 12.99, null, "DC", "hizzlan.com", "https://hizzlan.com/en/pricing-and-plans", true],
  ["neva-charge", "AC", 9.90, null, "22 kW", "nevasarj.com", "https://www.nevasarj.com/pages/ourstations/car-charger-ac-dc-kwh-price-tariff.html", true],
  ["neva-charge", "DC", 13.90, null, "240 kW'a kadar", "nevasarj.com", "https://www.nevasarj.com/pages/ourstations/car-charger-ac-dc-kwh-price-tariff.html", true],
  ["gsm-charge", "AC", 9.99, null, "22 kW", "gsmcharge.com.tr", "https://www.gsmcharge.com.tr/en/prices/", true],
  ["gsm-charge", "DC", 11.99, null, "DC", "gsmcharge.com.tr", "https://www.gsmcharge.com.tr/en/prices/", true],
  ["onizsarj", "AC", 9.28, null, "≤22 kW", "onizsarj.com", "https://onizsarj.com/fiyat-tarifesi/", true],
  ["onizsarj", "DC", 10.48, 12.48, "≤100 kW / >100 kW", "onizsarj.com", "https://onizsarj.com/fiyat-tarifesi/", true],
  ["borenco", "AC", 10.99, null, "22 kW", "borusan.com.tr", "https://5sarj.com/en", true],
  ["aksa-sarj", "AC", 8.99, null, "22 kW", "aksasarj.com.tr", "https://www.aksasarj.com.tr/tr/ucretler", true],
  ["aksa-sarj", "DC", 12.49, null, "DC", "aksasarj.com.tr", "https://www.aksasarj.com.tr/tr/ucretler", true],
  // === BATCH A - Resmi sitelerden dogrulanmis ===
  ["360-enerji", "AC", 8.49, null, "22 kW", "360enerji.com.tr", "https://sarj.360enerji.com.tr/", true],
  ["360-enerji", "DC", 10.49, null, "DC", "360enerji.com.tr", "https://sarj.360enerji.com.tr/", true],
  ["arsima", "AC", 10.99, null, "22 kW", "arsimaenerji.com", "https://www.arsimaenerji.com/tarifeler.html", true],
  ["arsima", "DC", 11.99, null, "DC", "arsimaenerji.com", "https://www.arsimaenerji.com/tarifeler.html", true],
  ["arsima-sarj", "AC", 10.99, null, "22 kW", "arsimaenerji.com", "https://www.arsimaenerji.com/tarifeler.html", true],
  ["arsima-sarj", "DC", 11.99, null, "DC", "arsimaenerji.com", "https://www.arsimaenerji.com/tarifeler.html", true],
  ["ayhan", "AC", 8.99, null, "22 kW", "e-aracsarj.com", "https://www.e-aracsarj.com/marka/aos-technology", false],
  ["ayhan", "DC", 10.99, 11.99, "DC / 50kW+", "e-aracsarj.com", "https://www.e-aracsarj.com/marka/aos-technology", false],
  ["bladeco", "AC", 6.90, null, "22 kW", "bladeco.com.tr", "https://www.bladeco.com.tr/tarifeler/", true],
  ["bladeco", "DC", 9.90, null, "DC", "bladeco.com.tr", "https://www.bladeco.com.tr/tarifeler/", true],
  ["dicle-kok", "AC", 9.90, null, "22 kW (Otopriz)", "e-aracsarj.com", "https://www.e-aracsarj.com/marka/otopriz", false],
  ["dicle-kok", "DC", 12.50, null, "DC (Otopriz)", "e-aracsarj.com", "https://www.e-aracsarj.com/marka/otopriz", false],
  ["ecobox", "AC", 9.29, 9.60, "20-22 kW", "ecoboxsarj.com", "https://www.ecoboxsarj.com/tarifeler", true],
  ["ecobox", "DC", 11.90, null, "DC", "ecoboxsarj.com", "https://www.ecoboxsarj.com/tarifeler", true],
  // === BATCH B - Resmi sitelerden dogrulanmis ===
  ["ispirli", "AC", 8.99, 9.98, "Konut/Kamusal", "ispirlisarj.com", "https://www.ispirlisarj.com/tarifeler/", true],
  ["ispirli", "DC", 11.50, 13.49, "60kW alti / 60kW ustu", "ispirlisarj.com", "https://www.ispirlisarj.com/tarifeler/", true],
  ["lumhouse", "AC", 9.99, null, "22 kW (Lumicle)", "lumicle.com.tr", "https://lumicle.com.tr/", true],
  ["lumhouse", "DC", 13.49, null, "DC (Lumicle)", "lumicle.com.tr", "https://lumicle.com.tr/", true],
  ["magicline", "AC", 9.89, null, "22 kW", "cheapsarj.com", "https://www.cheapsarj.com/price", false],
  ["magicline", "DC", 13.49, null, "DC", "cheapsarj.com", "https://www.cheapsarj.com/price", false],
  ["magicline", "HPC", 13.49, null, "HPC", "cheapsarj.com", "https://www.cheapsarj.com/price", false],
  ["toger", "AC", 9.39, null, "22 kW", "toger.co", "https://toger.co/pricing", true],
  ["toger", "DC", 11.39, null, "120 kW ve alti", "toger.co", "https://toger.co/pricing", true],
  ["toger", "HPC", 12.39, null, "120 kW ustu", "toger.co", "https://toger.co/pricing", true],
  ["u-sarj", "AC", 8.29, null, "22 kW", "usarj.com.tr", "https://usarj.com.tr/", true],
  ["u-sarj", "DC", 11.49, null, "200 kW'a kadar", "usarj.com.tr", "https://usarj.com.tr/", true],
  ["zeplin", "AC", 8.50, null, "22 kW", "zeplinenerji.com.tr", "https://www.zeplinenerji.com.tr/", true],
  ["zeplin", "DC", 10.30, null, "DC", "zeplinenerji.com.tr", "https://www.zeplinenerji.com.tr/", true],
  // === BATCH C - Resmi/3. parti kaynaklar ===
  ["d-charge", "AC", 9.40, null, "22 kW", "dcharge.com.tr", "https://dcharge.com.tr/tarifeler", true],
  ["d-charge", "DC", 12.99, null, "DC/HPC", "dcharge.com.tr", "https://dcharge.com.tr/tarifeler", true],
  ["q-charge", "AC", 9.95, null, "22 kW", "qcharge.io", "https://qcharge.io/en/prices/", true],
  ["q-charge", "DC", 13.78, null, "150 kW ve alti", "qcharge.io", "https://qcharge.io/en/prices/", true],
  ["q-charge", "HPC", 15.36, null, "150 kW ustu", "qcharge.io", "https://qcharge.io/en/prices/", true],
  ["otowatt", "AC", 7.99, 9.99, "22 kW", "cheapsarj.com", "https://www.cheapsarj.com/price", false],
  ["otowatt", "DC", 11.49, 12.49, "DC", "cheapsarj.com", "https://www.cheapsarj.com/price", false],
  ["g-sarj", "AC", 8.90, null, "22 kW", "cheapsarj.com", "https://www.cheapsarj.com/price", false],
  ["g-sarj", "DC", 11.90, null, "DC/HPC", "cheapsarj.com", "https://www.cheapsarj.com/price", false],
  ["aytemiz", "AC", 9.90, null, "Esarj altyapisi", "esarj.com", "https://esarj.com/tarifeler", false],
  ["aytemiz", "DC", 13.50, null, "Esarj altyapisi", "esarj.com", "https://esarj.com/tarifeler", false],
  // === BATCH D - Resmi sitelerden dogrulanmis ===
  ["cw-enerji", "AC", 8.99, null, "22-44 kW (CV Charging)", "cv-charging.com", "https://cv-charging.com/en/electric-vehicle-charging-tariffs", true],
  ["cw-enerji", "DC", 10.99, null, "60-240 kW (CV Charging)", "cv-charging.com", "https://cv-charging.com/en/electric-vehicle-charging-tariffs", true],
  ["tt-ventures", "AC", 9.49, null, "22 kW (E4 Sarj)", "e4sarj.com.tr", "https://e4sarj.com.tr/", true],
  ["tt-ventures", "DC", 11.99, 14.99, "60kW alti / 60kW ustu (E4 Sarj)", "e4sarj.com.tr", "https://e4sarj.com.tr/", true],
  ["ecoconnect", "AC", 9.59, null, "22 kW (ECON)", "cheapsarj.com", "https://www.cheapsarj.com/price", false],
  ["ecoconnect", "DC", 9.89, 10.99, "30-180kW / 180kW+ (ECON)", "cheapsarj.com", "https://www.cheapsarj.com/price", false],
];

// Clear and re-seed
sqlite.exec("DELETE FROM price_history");
sqlite.exec("DELETE FROM prices");
sqlite.exec("DELETE FROM operators");

// Insert operators with app links
for (const op of operatorData) {
  const links = appLinks[op.slug];
  db.insert(operators).values({
    ...op,
    playStoreUrl: links?.playStore ?? null,
    appStoreUrl: links?.appStore ?? null,
  }).run();
}

// Get operator IDs
const allOps = sqlite.prepare("SELECT id, slug FROM operators").all() as { id: number; slug: string }[];
const slugToId = new Map(allOps.map((o) => [o.slug, o.id]));

// Insert prices and price history
for (const [slug, chargeType, priceMin, priceMax, note, source, sourceUrl, isVerified] of priceData) {
  const operatorId = slugToId.get(slug);
  if (!operatorId) continue;

  db.insert(prices)
    .values({ operatorId, chargeType, priceMin, priceMax, note, source, sourceUrl, isVerified })
    .run();

  db.insert(priceHistory)
    .values({ operatorId, chargeType, priceMin, priceMax, source: sourceUrl })
    .run();
}

console.log(`Seed complete: ${operatorData.length} operators, ${priceData.length} prices`);
sqlite.close();
