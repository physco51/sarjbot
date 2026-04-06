# Yardımcı Fonksiyonlar Referansı

Bu dosya, EV şarj karşılaştırma projesinde sıkça kullanılacak utility fonksiyonların
referans implementasyonlarını içerir.

---

## 1. Mesafe Hesaplama (Haversine)

İki koordinat arasındaki mesafeyi km cinsinden hesaplar.

```javascript
function haversineDistance(coord1, coord2) {
  const R = 6371; // Dünya yarıçapı (km)
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

---

## 2. Maliyet Hesaplama

```javascript
function calculateChargingCost({
  station,
  vehicle,
  currentSoC,    // Mevcut şarj yüzdesi (0-100)
  targetSoC,     // Hedef şarj yüzdesi (0-100)
  connectorType, // Hangi soket kullanılacak
}) {
  const batteryKWh = vehicle.batteryKWh;
  const energyNeeded = ((targetSoC - currentSoC) / 100) * batteryKWh;

  // Soket gücünü bul
  const connector = station.connectors.find(c => c.type === connectorType);
  if (!connector) return null;

  // Araç ve soketin minimum gücü
  const isDC = ['CCS2', 'CHAdeMO', 'Tesla_NACS'].includes(connectorType);
  const maxPower = isDC
    ? Math.min(connector.powerKW, vehicle.maxDCkW)
    : Math.min(connector.powerKW, vehicle.maxACkW);

  // Şarj süresi (dakika) — basitleştirilmiş; gerçekte şarj eğrisi nonlinear
  const chargingTimeHours = energyNeeded / (maxPower * 0.9); // %90 verimlilik
  const chargingTimeMinutes = Math.round(chargingTimeHours * 60);

  // Maliyet
  const energyCost = energyNeeded * station.pricing.pricePerKWh;
  const sessionFee = station.pricing.sessionFee || 0;
  const parkingCost = chargingTimeMinutes * (station.pricing.parkingFeePerMin || 0);
  const totalCost = energyCost + sessionFee + parkingCost;

  // Üyelik indirimi
  const discountedCost = totalCost * (1 - (station.pricing.memberDiscount || 0) / 100);

  // Kazanılan menzil
  const rangeGainedKm = Math.round(energyNeeded / (vehicle.efficiencyWhPerKm / 1000));

  // Benzin karşılaştırması
  const gasLitersPer100km = 7; // Ortalama benzinli araç
  const gasPricePerLiter = 44;  // ₺ (güncel ortalama)
  const equivalentGasCost = (rangeGainedKm / 100) * gasLitersPer100km * gasPricePerLiter;
  const savings = equivalentGasCost - totalCost;
  const savingsPercent = Math.round((savings / equivalentGasCost) * 100);

  return {
    energyNeededKWh: Math.round(energyNeeded * 100) / 100,
    chargingTimeMinutes,
    maxPowerKW: maxPower,
    energyCost: Math.round(energyCost * 100) / 100,
    sessionFee,
    parkingCost: Math.round(parkingCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    discountedCost: Math.round(discountedCost * 100) / 100,
    rangeGainedKm,
    costPerKm: Math.round((totalCost / rangeGainedKm) * 100) / 100,
    equivalentGasCost: Math.round(equivalentGasCost * 100) / 100,
    savingsPercent,
  };
}
```

---

## 3. Sıralama Fonksiyonları

```javascript
const SORT_FUNCTIONS = {
  price_asc: (a, b) => a.pricing.pricePerKWh - b.pricing.pricePerKWh,
  price_desc: (a, b) => b.pricing.pricePerKWh - a.pricing.pricePerKWh,
  distance_asc: (a, b, userLoc) =>
    haversineDistance(userLoc, a.location) - haversineDistance(userLoc, b.location),
  power_desc: (a, b) => {
    const maxA = Math.max(...a.connectors.map(c => c.powerKW));
    const maxB = Math.max(...b.connectors.map(c => c.powerKW));
    return maxB - maxA;
  },
  rating_desc: (a, b) => b.rating - a.rating,
  availability_desc: (a, b) =>
    b.availability.availableSlots - a.availability.availableSlots,
  total_cost: (a, b) => {
    // 30 dakikalık şarj maliyeti karşılaştırması
    const costA = a.pricing.pricePerKWh * 30 + a.pricing.sessionFee;
    const costB = b.pricing.pricePerKWh * 30 + b.pricing.sessionFee;
    return costA - costB;
  },
  popularity_desc: (a, b) => b.reviewCount - a.reviewCount,
};
```

---

## 4. Karşılaştırma Skor Hesaplama

```javascript
function calculateComparisonScore(station, weights = {}) {
  const w = {
    price: weights.price ?? 0.40,
    speed: weights.speed ?? 0.20,
    distance: weights.distance ?? 0.15,
    rating: weights.rating ?? 0.15,
    amenities: weights.amenities ?? 0.10,
  };

  // Her metriği 0-100 arası normalize et
  // Fiyat: düşük = daha iyi (ters oranla)
  const priceScore = Math.max(0, 100 - (station.pricing.pricePerKWh / 15) * 100);

  // Hız: yüksek = daha iyi
  const maxPower = Math.max(...station.connectors.map(c => c.powerKW));
  const speedScore = Math.min(100, (maxPower / 350) * 100);

  // Puan: doğrudan 0-100
  const ratingScore = (station.rating / 5) * 100;

  // Olanak: olanak sayısına göre
  const amenityScore = Math.min(100, (station.amenities.length / 7) * 100);

  const totalScore = Math.round(
    w.price * priceScore +
    w.speed * speedScore +
    w.rating * ratingScore +
    w.amenities * amenityScore
  );

  return { priceScore, speedScore, ratingScore, amenityScore, totalScore };
}
```

---

## 5. Fiyat Formatlama

```javascript
function formatPrice(amount, currency = 'TRY') {
  const symbols = { TRY: '₺', EUR: '€', USD: '$', GBP: '£' };
  const symbol = symbols[currency] || currency;

  if (currency === 'TRY') {
    return `${amount.toFixed(2)} ${symbol}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

function getPriceCategory(pricePerKWh) {
  if (pricePerKWh < 6) return { label: 'Ucuz', color: 'green', emoji: '💚' };
  if (pricePerKWh < 9) return { label: 'Orta', color: 'amber', emoji: '💛' };
  return { label: 'Pahalı', color: 'red', emoji: '❤️' };
}
```

---

## 6. URL Query String Senkronizasyonu

```javascript
function filtersToQueryString(filters) {
  const params = new URLSearchParams();

  if (filters.priceRange[0] > 0) params.set('pmin', filters.priceRange[0]);
  if (filters.priceRange[1] < 15) params.set('pmax', filters.priceRange[1]);
  if (filters.distance !== 10) params.set('dist', filters.distance);
  if (filters.connectorTypes.length) params.set('conn', filters.connectorTypes.join(','));
  if (filters.operators.length) params.set('op', filters.operators.join(','));
  if (filters.sortBy !== 'price_asc') params.set('sort', filters.sortBy);
  if (filters.searchQuery) params.set('q', filters.searchQuery);

  return params.toString();
}

function queryStringToFilters(search) {
  const params = new URLSearchParams(search);
  return {
    priceRange: [
      parseFloat(params.get('pmin') || '0'),
      parseFloat(params.get('pmax') || '15'),
    ],
    distance: parseInt(params.get('dist') || '10'),
    connectorTypes: params.get('conn')?.split(',').filter(Boolean) || [],
    operators: params.get('op')?.split(',').filter(Boolean) || [],
    sortBy: params.get('sort') || 'price_asc',
    searchQuery: params.get('q') || '',
    amenities: [],
    availability: 'all',
    powerRange: [0, 350],
  };
}
```

---

## 7. Debounce Hook

```javascript
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```
