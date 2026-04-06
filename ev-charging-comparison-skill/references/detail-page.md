# İstasyon Detay Sayfası — Referans Dokümantasyonu

Bu dosya, şarj istasyonu detay sayfasının tasarımında kullanılacak wireframe, bileşen ve
etkileşim detaylarını içerir.

---

## 1. Sayfa Yapısı (Layout)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Geri   |   ZES — Kadıköy Feneryolu Şarj İstasyonu          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────┐  ┌──────────────────┐ │
│  │                                      │  │  FIYATLANDIRMA   │ │
│  │         [Hero Image / Gallery]       │  │                  │ │
│  │                                      │  │  DC Hızlı:       │ │
│  │  ◀  1/4  ▶                          │  │  7.50 ₺/kWh      │ │
│  └──────────────────────────────────────┘  │                  │ │
│                                             │  AC Normal:      │ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  4.50 ₺/kWh      │ │
│  │ 🟢 4/6   │ │ ⚡ 150kW │ │ ★ 4.3   │  │                  │ │
│  │ Müsait   │ │ DC Hızlı │ │ 128 yor. │  │  Oturum: Yok     │ │
│  └──────────┘ └──────────┘ └──────────┘  │                  │ │
│                                             │  [Maliyet        │ │
│  📍 Kadıköy, Feneryolu Mah.               │   Hesapla →]     │ │
│     Bağdat Cad. No:123                     │                  │ │
│  🕐 7/24 Açık                              │  ──────────────  │ │
│                                             │  Abonelik:       │ │
│  [Yol Tarifi]  [Paylaş]  [Karşılaştır]    │  Premium: 99₺/ay │ │
│                                             │  %15 indirim     │ │
│                                             └──────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  Tabs: [Genel] [Fiyatlar] [Yorumlar] [Müsaitlik] [Yakın]       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SOKETLER                                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │  CCS2   │ │  CCS2   │ │ Type2   │ │ Type2   │              │
│  │ 150 kW  │ │ 150 kW  │ │  22 kW  │ │  22 kW  │              │
│  │ 🟢Müsait│ │ 🔴 Dolu │ │ 🟢Müsait│ │ 🟢Müsait│              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
│  OLANAKLAR                                                       │
│  ☑ WiFi  ☑ WC  ☑ Kafe  ☑ Üstü Kapalı  ☐ AVM  ☐ Restaurant    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Fiyat Geçmişi Grafiği

Kullanıcılar fiyatların zaman içindeki değişimini görmek ister.

### 2.1 Grafik Tipi

Area chart (alan grafiği) — zaman serisini en iyi şekilde gösterir.

```
₺/kWh
10 ┤
 9 ┤                        ╭───
 8 ┤              ╭─────────╯
 7 ┤    ╭─────────╯
 6 ┤────╯
 5 ┤
   └──┬──────┬──────┬──────┬──────
     Oca   Mar    May    Tem    Eyl
```

### 2.2 Özellikler

- 3 ay / 6 ay / 1 yıl zaman aralığı seçici
- Hover'da tarih ve fiyat tooltip
- Minimum ve maksimum fiyat işaretleyici
- Trend çizgisi (ortalama)
- Operatör karşılaştırma overlay (aynı grafikte birden fazla operatör)

### 2.3 Implementasyon

Recharts veya Chart.js kullanın:

```jsx
<AreaChart data={priceHistory} width={600} height={300}>
  <defs>
    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
    </linearGradient>
  </defs>
  <XAxis dataKey="date" />
  <YAxis domain={['auto', 'auto']} />
  <Tooltip />
  <Area
    type="monotone"
    dataKey="price"
    stroke="var(--primary)"
    fill="url(#priceGradient)"
  />
</AreaChart>
```

---

## 3. Müsaitlik Tahmini Grafiği

Heatmap tarzında saatlik müsaitlik durumunu gösterin.

```
         00  02  04  06  08  10  12  14  16  18  20  22
Pzt      🟢  🟢  🟢  🟢  🟡  🟡  🔴  🔴  🔴  🟡  🟢  🟢
Sal      🟢  🟢  🟢  🟢  🟡  🟡  🔴  🟡  🔴  🟡  🟢  🟢
Çrş      🟢  🟢  🟢  🟡  🟡  🟡  🟡  🟡  🟡  🟢  🟢  🟢
Prş      🟢  🟢  🟢  🟢  🟡  🟡  🔴  🔴  🔴  🟡  🟢  🟢
Cum      🟢  🟢  🟢  🟡  🟡  🔴  🔴  🔴  🔴  🟡  🟡  🟢
Cts      🟢  🟢  🟢  🟢  🟡  🟡  🟡  🔴  🔴  🟡  🟢  🟢
Pzr      🟢  🟢  🟢  🟢  🟢  🟡  🟡  🟡  🟡  🟢  🟢  🟢
```

- 🟢 = Genellikle müsait (>60% boş)
- 🟡 = Orta yoğunluk (30-60% boş)
- 🔴 = Genellikle dolu (<30% boş)

Bu heatmap, kullanıcılara "En uygun şarj zamanı" konusunda yardımcı olur. Hover'da
tahmini bekleme süresi gösterin.

---

## 4. Yorum Sistemi

### 4.1 Yorum Kartı

```
┌──────────────────────────────────────────────────────┐
│  👤 Ahmet K.        ★★★★☆  4/5       2 gün önce    │
│  🚗 Tesla Model 3   ⚡ CCS2 150kW                    │
│                                                      │
│  "Hızlı ve temiz bir istasyon. WC'si gayet bakımlı. │
│   Tek sıkıntı hafta sonları çok kalabalık oluyor."  │
│                                                      │
│  👍 12   👎 1   💬 Yanıtla                           │
│                                                      │
│  Etiketler: [Temiz] [Hızlı] [Kalabalık]            │
└──────────────────────────────────────────────────────┘
```

### 4.2 Yorum Filtreleri

- Puana göre filtrele (5★, 4★, 3★, 2★, 1★)
- Soket tipine göre filtrele
- Tarih sıralaması (yeni/eski)
- Faydalı bulunma sayısına göre sırala
- Fotoğraflı yorumlar

### 4.3 Puan Dağılımı

```
5★ ████████████████████  45%
4★ ████████████░░░░░░░░  30%
3★ ██████░░░░░░░░░░░░░░  15%
2★ ██░░░░░░░░░░░░░░░░░░   5%
1★ ██░░░░░░░░░░░░░░░░░░   5%
```

---

## 5. Fiyat Karşılaştırma Detayı

Detay sayfasında, seçili istasyonun fiyatını bölgedeki ortalama ile karşılaştırın:

```
┌──────────────────────────────────────────────┐
│  Bu İstasyon vs Bölge Ortalaması             │
│                                              │
│  DC Hızlı:  7.50 ₺  ◀──── 8.30 ₺ (ort.)   │
│             %10 daha ucuz ✓                  │
│                                              │
│  AC Normal: 4.50 ₺  ────▶ 4.20 ₺ (ort.)   │
│             %7 daha pahalı ✗                 │
│                                              │
│  En ucuz alternatif: Eşarj Üsküdar (6.80₺)  │
│                       3.1 km uzaklıkta       │
└──────────────────────────────────────────────┘
```

---

## 6. Yakın İstasyonlar

Detay sayfasının alt kısmında mini harita ve yakın istasyon listesi:

```
┌──────────────────────────────────────────────┐
│  📍 Yakın İstasyonlar (5km içinde)           │
│                                              │
│  ┌─────────┐  1. Eşarj Üsküdar   6.80₺     │
│  │         │     1.2 km  •  🟢 Müsait       │
│  │  [Map]  │  2. Sharz Beşiktaş   9.00₺     │
│  │         │     2.5 km  •  🟡 Yoğun        │
│  │         │  3. Trugo Ataşehir   7.20₺     │
│  └─────────┘     4.1 km  •  🟢 Müsait       │
└──────────────────────────────────────────────┘
```

---

## 7. Yol Tarifi Entegrasyonu

- Google Maps / Apple Maps derin link
- Tahmini varış süresi
- Alternatif rota üzerindeki diğer istasyonlar
- "Rota üzerinde şarj planı" önerisi
