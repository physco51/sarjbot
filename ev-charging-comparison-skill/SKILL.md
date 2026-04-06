---
name: ev-charging-price-comparison
description: >
  Elektrikli araç (EV) şarj istasyonlarının fiyat karşılaştırması için web sitesi ve uygulama
  arayüzleri oluşturma becerisi. Bu skill'i şu durumlarda kullan: kullanıcı şarj istasyonu
  fiyat karşılaştırma sayfası, EV şarj fiyat listeleme arayüzü, şarj noktası filtreleme
  sistemi, şarj istasyonu sıralama tablosu, şarj maliyeti hesaplama aracı, şarj hızı
  karşılaştırma dashboard'u veya benzeri bir şey istediğinde. Ayrıca kullanıcı "şarj
  istasyonu", "EV charging", "elektrikli araç şarj", "fiyat karşılaştırma", "charging station
  comparison", "şarj ücreti", "kWh fiyat" gibi terimlerden herhangi birini kullandığında
  tetiklenmelidir. Hem Türkçe hem İngilizce isteklerde çalışır.
---

# EV Şarj İstasyonu Fiyat Karşılaştırma — Frontend Skill

Bu skill, elektrikli araç şarj istasyonlarının fiyatlarını karşılaştıran profesyonel, görsel
açıdan etkileyici ve işlevsel web arayüzleri oluşturmak için gereken tüm bilgi ve kalıpları
içerir.

> **İlk adım**: Projenin kapsamını anlayın — kullanıcı basit bir liste mi, tam özellikli bir
> dashboard mı, yoksa harita entegrasyonlu bir karşılaştırma platformu mu istiyor? Buna göre
> aşağıdaki bileşen setinden uygun olanları seçin.

---

## 1. Proje Mimarisi & Veri Modeli

### 1.1 Temel Veri Yapısı

Şarj istasyonu verilerini modellerken şu alanlar mutlaka bulunmalıdır:

```typescript
interface ChargingStation {
  id: string;
  name: string;                    // İstasyon adı
  operator: string;                // Operatör (ZES, Eşarj, Sharz, Trugo, vb.)
  location: {
    lat: number;
    lng: number;
    city: string;
    district: string;
    address: string;
  };
  connectors: Connector[];         // Şarj soketleri
  pricing: PricingModel;           // Fiyatlandırma
  amenities: string[];             // Olanaklar (WiFi, WC, Kafe, vb.)
  rating: number;                  // Kullanıcı puanı (1-5)
  reviewCount: number;
  availability: AvailabilityStatus;
  operatingHours: string;
  images: string[];
  lastUpdated: string;             // Son güncelleme tarihi
}

interface Connector {
  id: string;
  type: ConnectorType;             // CCS2, CHAdeMO, Type2, Tesla
  powerKW: number;                 // Şarj gücü (kW)
  status: 'available' | 'occupied' | 'out_of_service' | 'unknown';
}

type ConnectorType = 'CCS2' | 'CHAdeMO' | 'Type2' | 'AC' | 'Tesla_NACS' | 'GBT';

interface PricingModel {
  pricePerKWh: number;             // kWh başına ücret (₺, €, $ vb.)
  currency: string;
  sessionFee: number;              // Oturum başlangıç ücreti
  parkingFeePerMin: number;        // Park ücreti (dakika başı)
  idleFeePerMin: number;           // Boşta bekleme ücreti
  memberDiscount: number;          // Üyelik indirimi (%)
  peakPricePerKWh?: number;        // Yoğun saat fiyatı
  offPeakPricePerKWh?: number;     // Sakin saat fiyatı
  subscriptionPlans?: SubscriptionPlan[];
}

interface SubscriptionPlan {
  name: string;
  monthlyFee: number;
  discountPercent: number;
  freeKWhPerMonth: number;
}

type AvailabilityStatus = {
  totalSlots: number;
  availableSlots: number;
  waitTime: number;                // Tahmini bekleme süresi (dk)
};
```

### 1.2 Türkiye Pazarı Operatörleri

Türkiye'deki başlıca şarj ağları ve ortalama fiyat aralıkları:

| Operatör      | AC (₺/kWh) | DC (₺/kWh) | Hızlı DC (₺/kWh) | Oturum Ücreti |
|---------------|-------------|-------------|-------------------|---------------|
| ZES           | 4.50-5.50   | 7.00-9.00   | 9.00-11.00        | Yok           |
| Eşarj         | 4.00-5.00   | 6.50-8.50   | 8.50-10.50        | 2.00 ₺        |
| Sharz.net     | 4.50-5.50   | 7.50-9.50   | 9.50-11.50        | Yok           |
| Trugo         | 4.00-5.00   | 7.00-8.50   | 9.00-10.00        | Yok           |
| Tesla SC      | —           | —           | 8.00-10.00        | Yok           |
| Voltrun       | 4.50-5.50   | 7.00-9.00   | 9.00-11.00        | 1.50 ₺        |
| Aksapower     | 4.00-5.00   | 6.50-8.00   | 8.00-10.00        | Yok           |

> Bu fiyatlar referans amaçlıdır ve sürekli değişebilir. Gerçek veriler API'den çekilmelidir.

---

## 2. Filtreleme Sistemi

Filtreleme, bu tür bir platformun en kritik bileşenidir. Kullanıcılar hızla istedikleri
istasyonu bulabilmelidir.

### 2.1 Filtre Kategorileri

Aşağıdaki filtre gruplarını mutlaka uygulayın:

**A) Fiyat Filtreleri**
- kWh başına fiyat aralığı (range slider — min/max)
- Oturum ücreti var/yok toggle
- Ücretsiz şarj seçeneği
- Abonelik planı olan istasyonlar
- Dinamik fiyatlandırma (peak/off-peak) gösteren istasyonlar

**B) Konum Filtreleri**
- Şehir / ilçe dropdown (cascade)
- Mesafe yarıçapı (1km, 5km, 10km, 25km, 50km)
- Harita üzerinde alan seçimi (draw bounding box)
- Otoban/ana yol kenarı filtresi
- "Yakınımdaki" konum bazlı

**C) Teknik Filtreler**
- Soket tipi: CCS2, CHAdeMO, Type2, AC, Tesla NACS (multi-select chip)
- Şarj gücü aralığı: 3.7kW, 7kW, 11kW, 22kW, 50kW, 100kW, 150kW+, 250kW+, 350kW+
- Eş zamanlı şarj sayısı

**D) Operatör Filtreleri**
- Operatör seçimi (multi-select chip veya checkbox)
- Ağ uyumluluğu (roaming destekli)
- Ödeme yöntemi (uygulama, RFID kart, kredi kartı, QR)

**E) Olanak Filtreleri**
- WiFi, WC, Kafe, Restaurant, Alışveriş Merkezi, Otopark
- 7/24 açık
- Engelli erişimi
- Üstü kapalı

**F) Durum Filtreleri**
- Müsait / Dolu / Arızalı
- Bekleme süresi
- Son güncelleme zamanı

### 2.2 Filtre UI Kalıpları

```
┌─────────────────────────────────────────────────────────────┐
│ FILTER BAR (Sticky top / Sidebar)                           │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Fiyat  ▼ │ │ Mesafe ▼ │ │ Soket  ▼ │ │ Operatör▼│ [+]   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│ Aktif Filtreler: [CCS2 ×] [<8₺/kWh ×] [ZES ×]  Temizle   │
└─────────────────────────────────────────────────────────────┘
```

**Temel kurallar:**

- **Dropdown popover** kullanın, sayfa kaydırmasını bozacak inline açılır menülerden kaçının
- **Aktif filtre chip'leri** her zaman görünür olmalı — kaçı aktif, hızlı silme
- **Filtre sayacı badge'i** her dropdown'ın üstünde aktif filtre sayısını göstersin
- **Temizle butonu** global ve kategori bazında ayrı ayrı
- **URL query string sync** — filtreler URL'ye yansısın ki paylaşılabilsin
- **Debounce** — range slider'larda 300ms debounce uygulayın
- **Skeleton loading** — filtre sonuçları yüklenirken skeleton gösterin, sonuç sayısı anlık güncellensin
- **Boş durum tasarımı** — filtre sonucu 0 ise "Filtrelerinizi genişletin" önerisi gösterin

### 2.3 React Filtreleme Mimarisi

```jsx
// Filtre state'ini tek bir reducer'da yönetin
const initialFilters = {
  priceRange: [0, 15],       // ₺/kWh
  distance: 10,              // km
  connectorTypes: [],         // string[]
  operators: [],              // string[]
  powerRange: [0, 350],      // kW
  amenities: [],
  availability: 'all',       // 'all' | 'available' | 'occupied'
  sortBy: 'price_asc',
  searchQuery: '',
};

function filterReducer(state, action) {
  switch (action.type) {
    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload };
    case 'TOGGLE_CONNECTOR':
      return {
        ...state,
        connectorTypes: state.connectorTypes.includes(action.payload)
          ? state.connectorTypes.filter(c => c !== action.payload)
          : [...state.connectorTypes, action.payload],
      };
    case 'RESET_ALL':
      return initialFilters;
    case 'RESET_CATEGORY':
      return { ...state, [action.payload]: initialFilters[action.payload] };
    // ... diğer action'lar
  }
}

// useMemo ile filtreleme performansı
const filteredStations = useMemo(() => {
  let result = [...stations];

  // Fiyat filtresi
  result = result.filter(s =>
    s.pricing.pricePerKWh >= filters.priceRange[0] &&
    s.pricing.pricePerKWh <= filters.priceRange[1]
  );

  // Soket tipi filtresi
  if (filters.connectorTypes.length > 0) {
    result = result.filter(s =>
      s.connectors.some(c => filters.connectorTypes.includes(c.type))
    );
  }

  // Operatör filtresi
  if (filters.operators.length > 0) {
    result = result.filter(s => filters.operators.includes(s.operator));
  }

  // Mesafe filtresi (haversine hesaplama)
  if (userLocation) {
    result = result.filter(s =>
      haversineDistance(userLocation, s.location) <= filters.distance
    );
  }

  // Sıralama
  result.sort(getSortFunction(filters.sortBy));

  return result;
}, [stations, filters, userLocation]);
```

---

## 3. Sıralama Sistemi

### 3.1 Sıralama Seçenekleri

Aşağıdaki sıralama kriterlerini sunun:

| Sıralama              | Açıklama                                         | Varsayılan |
|-----------------------|---------------------------------------------------|-----------|
| Fiyat (Düşük→Yüksek) | kWh başına fiyata göre artan                      | ✓         |
| Fiyat (Yüksek→Düşük) | kWh başına fiyata göre azalan                     |           |
| Mesafe (Yakın→Uzak)   | Kullanıcıya olan mesafeye göre                    |           |
| Şarj Hızı (Hızlı→Yavaş) | Maksimum kW değerine göre                     |           |
| Puan (Yüksek→Düşük)  | Kullanıcı puanına göre                            |           |
| Toplam Maliyet        | 30 dk şarj maliyetini hesaplayarak                |           |
| Müsaitlik             | Boş soket sayısına göre                           |           |
| Popülerlik            | Değerlendirme sayısına göre                       |           |

### 3.2 Sıralama UI

```
┌─────────────────────────────────────────┐
│  Sırala:  [En Ucuz ▼]    ↑↓            │
│                                         │
│  Hızlı sıralama chip'leri:             │
│  [💰 En Ucuz] [📍 En Yakın] [⚡ En Hızlı] [⭐ En İyi Puan] │
└─────────────────────────────────────────┘
```

- Sıralama değiştiğinde **animasyonlu transition** ile elemanlar yeniden sıralansın
  (`layout animation` veya `FLIP` tekniği)
- Aktif sıralama chip'i **vurgulu** olsun
- İkincil sıralama desteği verin (önce fiyata göre, sonra mesafeye göre)

---

## 4. Listeleme Görünümleri

Kullanıcıya birden fazla görünüm modu sunun:

### 4.1 Kart Görünümü (Grid)

```
┌─────────────────────────────────┐
│  🟢 Müsait    ⚡ 150 kW         │
│  ┌───────────────────────────┐  │
│  │      [İstasyon Görseli]   │  │
│  └───────────────────────────┘  │
│  ZES — Kadıköy                  │
│  ★ 4.3 (128 yorum)             │
│                                 │
│  CCS2 | Type2 | CHAdeMO        │
│                                 │
│  ┌─────────────────────────┐   │
│  │  7.50 ₺/kWh  │ DC Hızlı │  │
│  └─────────────────────────┘   │
│                                 │
│  📍 2.3 km   🕐 7/24           │
│                                 │
│  [Karşılaştır ☐]  [Detay →]   │
└─────────────────────────────────┘
```

- 2-3 sütunlu responsive grid (mobilde tek sütun)
- Hover'da hafif scale ve gölge artışı
- Fiyat badge'i belirgin renkte (yeşil = ucuz, turuncu = orta, kırmızı = pahalı)
- Müsaitlik durumu canlı gösterge (yeşil/sarı/kırmızı nokta)

### 4.2 Liste Görünümü (Tablo)

```
┌──────┬──────────┬───────┬──────┬───────┬───────┬──────┬────────┐
│ #    │ İstasyon │ Oprtr │ Fiyat│ Güç   │ Soket │ Puan │ Mesafe │
├──────┼──────────┼───────┼──────┼───────┼───────┼──────┼────────┤
│ 1    │ Kadıköy  │ ZES   │ 7.50₺│ 150kW │ CCS2  │ 4.3  │ 2.3km  │
│ 2    │ Üsküdar  │ Eşarj │ 6.80₺│ 50kW  │ Type2 │ 4.1  │ 3.1km  │
└──────┴──────────┴───────┴──────┴───────┴───────┴──────┴────────┘
```

- Sütun başlıklarına tıklayarak sıralama (asc/desc ok ikonları)
- Satır hover highlight
- Compact / Comfortable row yüksekliği toggle
- Tablo başlığı sticky

### 4.3 Harita Görünümü

- Marker cluster (yakın istasyonlar gruplandırılır)
- Marker rengi fiyat aralığına göre (heatmap mantığı)
- Marker üzerinde hover popup: ad, fiyat, müsaitlik
- Marker tıklayınca detay sidebar açılır
- Harita ve liste senkronize kaydırma

### 4.4 Görünüm Değiştirici

```jsx
const VIEW_MODES = [
  { id: 'grid', icon: '⊞', label: 'Kart' },
  { id: 'list', icon: '☰', label: 'Liste' },
  { id: 'map',  icon: '🗺', label: 'Harita' },
];

// Sonuç sayısı ve görünüm toggle'ı her zaman birlikte gösterilmeli
// Örn: "47 istasyon bulundu  [⊞] [☰] [🗺]"
```

---

## 5. Karşılaştırma Sistemi

Bu bölüm projenin en kritik ve farklılaştırıcı özelliğidir.

### 5.1 Karşılaştırma Akışı

1. Kullanıcı kart/liste'den "Karşılaştır" butonuna tıklar
2. Alt bar'da seçilen istasyonlar görünür (maks 4)
3. "Karşılaştır" butonuyla yan yana karşılaştırma sayfası açılır
4. Sayfada özellikler satır satır karşılaştırılır

### 5.2 Karşılaştırma Tablosu Yapısı

```
┌─────────────────┬────────────┬────────────┬────────────┐
│                  │  ZES       │  Eşarj     │  Sharz     │
│                  │  Kadıköy   │  Üsküdar   │  Beşiktaş  │
├─────────────────┼────────────┼────────────┼────────────┤
│ kWh Fiyatı      │  7.50 ₺ 🟢│  8.20 ₺    │  9.00 ₺ 🔴│
│ Oturum Ücreti   │  Yok    🟢│  2.00 ₺    │  Yok    🟢│
│ 30dk Maliyet    │  32.50 ₺🟢│  38.10 ₺   │  42.00 ₺🔴│
│ Maks Güç        │  150 kW 🟢│  50 kW  🔴│  100 kW    │
│ Soket Tipleri   │  CCS2,T2   │  CCS2      │  CCS2,ChMO │
│ Müsaitlik       │  3/4    🟢│  1/2       │  0/3    🔴│
│ Puan            │  ★ 4.3     │  ★ 4.1     │  ★ 3.8  🔴│
│ Mesafe          │  2.3 km    │  3.1 km    │  4.7 km    │
│ Olanaklar       │  WiFi, WC  │  WiFi      │  WC, Kafe  │
│ Çalışma Saatleri│  7/24      │  08-22     │  7/24      │
├─────────────────┼────────────┼────────────┼────────────┤
│ TOPLAM SKOR     │  92/100 🏆│  78/100    │  71/100    │
└─────────────────┴────────────┴────────────┴────────────┘
```

### 5.3 Karşılaştırma Özellikleri

- **En iyi değer vurgulama**: Her satırda en iyi değer yeşil badge, en kötü kırmızı
- **Fark göstergesi**: Fiyat farkını yüzde olarak gösterin (%12 daha ucuz)
- **Maliyet hesaplama**: Kullanıcı araç modeli ve batarya kapasitesi girerek gerçek maliyet görsün
- **Toplam skor**: Ağırlıklı skor hesaplaması (fiyat %40, hız %20, mesafe %15, puan %15, olanak %10)
- **Sticky header**: Karşılaştırma tablosunda istasyon isimleri scroll'da sabit kalsın
- **Satır gizleme**: Aynı olan satırlar "Sadece farkları göster" toggle ile gizlenebilsin
- **PDF/Screenshot export**: Karşılaştırma tablosu kaydedilebilsin
- **Paylaş**: Karşılaştırma linki paylaşılabilsin

### 5.4 Alt Bar (Selection Tray)

Karşılaştırmaya eklenen istasyonlar için sayfanın altında sabit bir bar:

```
┌──────────────────────────────────────────────────────────────────┐
│  📊 Karşılaştır (2/4)                                          │
│  ┌──────────┐  ┌──────────┐  ┌─ ─ ─ ─ ─┐  ┌─ ─ ─ ─ ─┐       │
│  │ ZES      │  │ Eşarj    │  │  + Ekle  │  │  + Ekle  │       │
│  │ Kadıköy ×│  │ Üskdar ×│  │          │  │          │       │
│  └──────────┘  └──────────┘  └─ ─ ─ ─ ─┘  └─ ─ ─ ─ ─┘       │
│                                           [Karşılaştır →]      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Maliyet Hesaplama Aracı

Kullanıcıların gerçek şarj maliyetini hesaplamasına yardımcı olun.

### 6.1 Girdiler

- Araç modeli (dropdown — model seçince batarya kapasitesi otomatik gelsin)
- Mevcut şarj yüzdesi (%)
- Hedef şarj yüzdesi (%)
- Şarj tipi (AC / DC / Hızlı DC)

### 6.2 Çıktılar

- Tahmini şarj süresi
- Toplam kWh
- Toplam maliyet (₺)
- Park ücreti dahil maliyet
- Km başına maliyet
- Benzinli araçla karşılaştırma ("Bu şarj ile X km gidebilirsiniz, benzinli araçla Y₺ tutardı")

### 6.3 UI

```
┌────────────────────────────────────────────────────┐
│  💰 Maliyet Hesapla                                │
│                                                    │
│  Araç:  [Tesla Model 3 LR          ▼]            │
│  Batarya: 75 kWh                                  │
│                                                    │
│  Mevcut: ████████░░░░░░░ 35%                      │
│  Hedef:  █████████████░░ 80%                      │
│                                                    │
│  ─────────────────────────────────                │
│  Şarj edilecek: 33.75 kWh                         │
│  Tahmini süre:  ~22 dk (150kW DC)                 │
│  Maliyet:       253.13 ₺                          │
│  Kazanılan km:  ~202 km                           │
│  ₺/km:          1.25 ₺                            │
│  ─────────────────────────────────                │
│  🆚 Benzinli: ~440 ₺ (7L/100km, 31₺/L)          │
│     %42 tasarruf!                                  │
└────────────────────────────────────────────────────┘
```

---

## 7. Arama Sistemi

### 7.1 Arama Çubuğu

- **Autocomplete**: Hem istasyon adı, hem operatör, hem konum önerileri
- **Arama kategorileri**: "ZES Kadıköy" → operatör + konum birleşik arama
- **Geçmiş aramalar**: LocalStorage'da son 10 arama
- **Popüler aramalar**: Trend olan istasyonlar
- **Sesli arama**: Mikrofon ikonu (Web Speech API)

### 7.2 Arama Sonuçları

- Sonuçlar kategorize edilsin (İstasyonlar, Operatörler, Lokasyonlar)
- Anlık sonuç sayısı: "23 sonuç"
- Arama metni highlight

---

## 8. Görsel Tasarım Yönergeleri

### 8.1 Renk Paleti

EV/enerji sektörü için tavsiye edilen paletler:

**Palet A — Elektrik Mavisi (Futuristik / Temiz Enerji)**
```css
:root {
  --primary: #0EA5E9;        /* Elektrik Mavisi */
  --primary-dark: #0369A1;
  --secondary: #10B981;      /* Enerji Yeşili */
  --accent: #F59E0B;         /* Uyarı/Highlight */
  --danger: #EF4444;
  --bg-primary: #0F172A;     /* Koyu arka plan */
  --bg-secondary: #1E293B;
  --bg-card: #1E293B;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --border: #334155;
}
```

**Palet B — Yeşil Enerji (Doğal / Sürdürülebilir)**
```css
:root {
  --primary: #22C55E;
  --primary-dark: #15803D;
  --secondary: #3B82F6;
  --accent: #EAB308;
  --bg-primary: #FAFDF7;
  --bg-card: #FFFFFF;
  --text-primary: #1A2E05;
  --text-secondary: #4B5563;
}
```

**Palet C — Neon Enerji (Cesur / Teknoloji)**
```css
:root {
  --primary: #00F0FF;        /* Cyan Neon */
  --secondary: #7C3AED;     /* Violet */
  --accent: #FACC15;
  --bg-primary: #030712;
  --bg-card: rgba(15, 23, 42, 0.8);
  --glow: 0 0 20px rgba(0, 240, 255, 0.3);
}
```

### 8.2 Tipografi

Önerilen font eşlemeleri:

| Stil           | Display Font              | Body Font               |
|---------------|---------------------------|-------------------------|
| Futuristik    | Outfit, Syne              | DM Sans, Plus Jakarta   |
| Temiz/Minimal | Satoshi, General Sans     | Instrument Sans         |
| Cesur/Tekno   | Clash Display, Cabinet Gr.| Switzer, Geist          |

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
```

### 8.3 Fiyat Görsel Kodlaması

Fiyatları renk kodlamayla sezgisel hale getirin:

```css
.price-low    { color: #22C55E; }  /* < 6 ₺/kWh */
.price-medium { color: #F59E0B; }  /* 6-9 ₺/kWh */
.price-high   { color: #EF4444; }  /* > 9 ₺/kWh */
```

Ayrıca fiyat bar'ı kullanın — istasyonlar arasında görsel karşılaştırma sağlayın:

```
ZES    ██████████░░░░░░  7.50₺
Eşarj  ████████████░░░░  8.20₺
Sharz  ██████████████░░  9.00₺
```

### 8.4 İkon Seti

Soket tipleri ve olanaklar için tutarlı SVG ikon seti kullanın:

- Soket tipleri: CCS2, CHAdeMO, Type2, AC, Tesla ikon setleri
- Olanaklar: WiFi, WC, Kafe, Park, AVM, Üstü Kapalı
- Durum: Müsait (yeşil pulse), Dolu (kırmızı), Arızalı (gri)
- Şarj hızı: Yıldırım ikonu (tek=yavaş, çift=hızlı, üçlü=ultra hızlı)

### 8.5 Animasyonlar

- **Sayfa yükleme**: Staggered card reveal (her kart 50ms arayla)
- **Filtre değişikliği**: Layout animation (kartlar smooth hareket etsin)
- **Hover efektleri**: Kartlarda subtle scale (1.02) ve shadow artışı
- **Fiyat güncelleme**: Sayı counter animation
- **Harita marker**: Pulse animation (müsait istasyonlar)
- **Skeleton loading**: Gradient shimmer efekti
- **Karşılaştırma tray**: Slide-up entrance

---

## 9. Responsive Tasarım

### 9.1 Breakpoint'ler

```css
/* Mobile First */
--mobile:    < 640px   → Tek sütun, drawer filtreler, bottom sheet detay
--tablet:    640-1024px → 2 sütun grid, sidebar filtre
--desktop:   1024-1440px → 3 sütun grid, inline filtre bar
--wide:      > 1440px   → 4 sütun grid, split view (liste + harita)
```

### 9.2 Mobil Özel Davranışlar

- Filtreler bottom sheet / drawer içinde açılsın
- Karşılaştırma tray alt kısımda sticky
- Swipe ile kart arası geçiş
- Pull-to-refresh
- Harita tam ekran modlu
- Sticky search bar

---

## 10. Performans & Erişilebilirlik

### 10.1 Performans

- **Virtualized list**: 100+ istasyonda `react-window` veya `tanstack-virtual` kullanın
- **Debounce**: Filtre değişikliklerinde 300ms debounce
- **Memoization**: `useMemo` ile filtreleme, `React.memo` ile kart bileşenleri
- **Image lazy loading**: Görseller viewport'a girdiğinde yüklensin
- **Pagination / Infinite scroll**: 20-50 arası sayfa başı öğe

### 10.2 Erişilebilirlik (a11y)

- Tüm interaktif öğelerde `aria-label`
- Filtre chip'lerinde `role="checkbox"` veya `role="option"`
- Sıralama butonlarında `aria-sort`
- Renk kodlarının yanında metin açıklama (sadece renk değil)
- Klavye navigasyonu: Tab, Enter, Escape
- Ekran okuyucu: Filtre sonucu değişikliği `aria-live="polite"` ile duyurulsun

---

## 11. Bileşen Kontrol Listesi

Projenin tamamı için gereken React bileşenleri:

```
src/
├── components/
│   ├── filters/
│   │   ├── FilterBar.jsx           # Üst filtre çubuğu
│   │   ├── PriceRangeSlider.jsx    # Fiyat aralığı slider
│   │   ├── ConnectorTypeChips.jsx  # Soket tipi seçimi
│   │   ├── OperatorSelect.jsx      # Operatör multi-select
│   │   ├── DistanceSlider.jsx      # Mesafe filtresi
│   │   ├── AmenityFilter.jsx       # Olanak filtreleri
│   │   ├── ActiveFilterChips.jsx   # Aktif filtre göstergesi
│   │   └── FilterDrawer.jsx        # Mobil filtre drawer
│   ├── sorting/
│   │   ├── SortDropdown.jsx        # Sıralama dropdown
│   │   └── QuickSortChips.jsx      # Hızlı sıralama chip'leri
│   ├── listing/
│   │   ├── StationCard.jsx         # Kart görünümü
│   │   ├── StationRow.jsx          # Tablo satırı
│   │   ├── StationGrid.jsx         # Grid container
│   │   ├── StationTable.jsx        # Tablo container
│   │   ├── StationMap.jsx          # Harita görünümü
│   │   ├── ViewToggle.jsx          # Görünüm değiştirici
│   │   └── ResultCount.jsx         # Sonuç sayısı
│   ├── comparison/
│   │   ├── ComparisonTray.jsx      # Alt karşılaştırma bar'ı
│   │   ├── ComparisonTable.jsx     # Yan yana karşılaştırma
│   │   ├── ComparisonScore.jsx     # Toplam skor hesaplama
│   │   └── DifferenceHighlight.jsx # Fark vurgulama
│   ├── calculator/
│   │   ├── CostCalculator.jsx      # Maliyet hesaplama
│   │   ├── VehicleSelector.jsx     # Araç seçici
│   │   └── BatterySlider.jsx       # Batarya seviye slider'ları
│   ├── search/
│   │   ├── SearchBar.jsx           # Arama çubuğu
│   │   └── SearchSuggestions.jsx   # Otomatik tamamlama
│   ├── detail/
│   │   ├── StationDetail.jsx       # İstasyon detay sayfası
│   │   ├── PricingBreakdown.jsx    # Fiyat detayları
│   │   ├── ReviewList.jsx          # Yorumlar
│   │   └── AvailabilityChart.jsx   # Müsaitlik grafiği
│   └── common/
│       ├── Badge.jsx               # Durum badge'leri
│       ├── Chip.jsx                # Filtre chip
│       ├── Skeleton.jsx            # Loading skeleton
│       ├── EmptyState.jsx          # Boş sonuç durumu
│       ├── Tooltip.jsx             # Bilgi tooltip
│       └── PriceTag.jsx            # Fiyat etiketi
├── hooks/
│   ├── useFilters.js               # Filtre state yönetimi
│   ├── useSort.js                  # Sıralama logic
│   ├── useComparison.js            # Karşılaştırma state
│   ├── useGeolocation.js           # Konum servisi
│   └── useDebounce.js              # Debounce hook
├── utils/
│   ├── haversine.js                # Mesafe hesaplama
│   ├── costCalculator.js           # Maliyet hesaplama
│   ├── priceFormatter.js           # Fiyat formatlama
│   └── filterHelpers.js            # Filtre yardımcıları
└── data/
    ├── stations.json               # Örnek veri
    ├── vehicles.json               # Araç veritabanı
    └── operators.json              # Operatör bilgileri
```

---

## 12. Detay sayfasını tasarlarken nelere dikkat etmeli

Daha fazla detay gerektiğinde `references/detail-page.md` dosyasını okuyun. O dosyada:
- İstasyon detay sayfası wireframe'leri
- Fiyat geçmişi grafiği tasarımı
- Yorum sistemi UI kalıpları
- Müsaitlik tahmini grafiği
- Yol tarifi entegrasyonu

bulunmaktadır.

---

## 13. Hızlı Başlangıç Kontrol Listesi

Bir EV şarj karşılaştırma arayüzü oluştururken bu sırayı izleyin:

1. ☐ Veri modelini tanımlayın (Bölüm 1)
2. ☐ Örnek veri seti oluşturun (en az 20-30 istasyon)
3. ☐ Filtre sistemi mimarisini kurun (Bölüm 2)
4. ☐ Sıralama mekanizmasını ekleyin (Bölüm 3)
5. ☐ Kart ve liste görünümlerini oluşturun (Bölüm 4)
6. ☐ Karşılaştırma akışını implement edin (Bölüm 5)
7. ☐ Maliyet hesaplama aracını ekleyin (Bölüm 6)
8. ☐ Arama sistemini kurun (Bölüm 7)
9. ☐ Görsel tasarımı uygulayın (Bölüm 8)
10. ☐ Responsive düzenlemeleri yapın (Bölüm 9)
11. ☐ Performans ve erişilebilirlik testleri (Bölüm 10)
