# API Entegrasyon Referansı

Bu dosya, EV şarj istasyonu fiyat karşılaştırma platformunun dış servislerle
entegrasyonu için gerekli API kalıplarını ve veri kaynaklarını içerir.

---

## 1. Şarj İstasyonu Veri Kaynakları

### 1.1 Open Charge Map (Açık Veri)

En kapsamlı açık kaynak EV şarj istasyonu veritabanı.

- **URL**: `https://api.openchargemap.io/v3/poi`
- **Kimlik**: Ücretsiz API anahtarı gerekli
- **Rate Limit**: 1000 istek/gün (ücretsiz)
- **Kapsam**: Global, Türkiye dahil

```javascript
// Örnek istek
const fetchStations = async (lat, lng, radiusKm = 10) => {
  const params = new URLSearchParams({
    key: API_KEY,
    latitude: lat,
    longitude: lng,
    distance: radiusKm,
    distanceunit: 'km',
    maxresults: 100,
    compact: true,
    verbose: false,
    countryid: 218, // Türkiye
  });

  const res = await fetch(`https://api.openchargemap.io/v3/poi?${params}`);
  return res.json();
};
```

### 1.2 Operatör Kendi API'leri

Bazı operatörler kendi API'lerini sunar:

| Operatör | API Durumu | Not |
|----------|-----------|-----|
| ZES      | Kapalı API — mobil uygulama scraping gerekebilir | OCPI protokolü destekliyor |
| Eşarj    | Partner API mevcut | Başvuru gerekli |
| Tesla    | Yarı açık | Supercharger konumları açık |

### 1.3 OCPI Protokolü

Open Charge Point Interface — şarj ağları arası standart protokol.

```
GET /ocpi/2.2/locations
Authorization: Token <token>

Response:
{
  "data": [{
    "id": "LOC001",
    "name": "ZES Kadıköy",
    "coordinates": { "latitude": "40.9882", "longitude": "29.0364" },
    "evses": [{
      "uid": "EVSE001",
      "status": "AVAILABLE",
      "connectors": [{
        "id": "1",
        "standard": "IEC_62196_T2_COMBO",
        "power_type": "DC",
        "max_voltage": 500,
        "max_amperage": 300
      }]
    }],
    "time_zone": "Europe/Istanbul"
  }]
}
```

---

## 2. Harita Entegrasyonu

### 2.1 Leaflet (Ücretsiz, Açık Kaynak)

React projeleri için `react-leaflet` kullanın:

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function StationMap({ stations, center }) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: '500px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
      />
      {stations.map(station => (
        <Marker
          key={station.id}
          position={[station.location.lat, station.location.lng]}
          icon={getMarkerIcon(station)}
        >
          <Popup>
            <StationPopup station={station} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### 2.2 Özel Marker İkonları

Fiyat aralığına göre renkli marker'lar:

```javascript
function getMarkerIcon(station) {
  const price = station.pricing.pricePerKWh;
  let color;
  if (price < 6) color = '#22C55E';      // Yeşil
  else if (price < 9) color = '#F59E0B';  // Turuncu
  else color = '#EF4444';                  // Kırmızı

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 36px; height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex; align-items: center; justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <span style="transform: rotate(45deg); color: white; font-weight: 700; font-size: 11px;">
        ${price.toFixed(1)}
      </span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}
```

### 2.3 Marker Clustering

```javascript
import MarkerClusterGroup from 'react-leaflet-cluster';

<MarkerClusterGroup
  chunkedLoading
  maxClusterRadius={50}
  iconCreateFunction={(cluster) => {
    const count = cluster.getChildCount();
    const avgPrice = calculateAveragePrice(cluster);
    return L.divIcon({
      html: `<div class="cluster-icon">${count}</div>`,
      className: `cluster-${getPriceCategory(avgPrice).color}`,
      iconSize: [44, 44],
    });
  }}
>
  {/* Marker'lar buraya */}
</MarkerClusterGroup>
```

---

## 3. Gerçek Zamanlı Veri

### 3.1 WebSocket ile Müsaitlik Güncellemesi

```javascript
const useStationUpdates = (stationIds) => {
  const [updates, setUpdates] = useState({});

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/ws/stations');

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        stationIds,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setUpdates(prev => ({
        ...prev,
        [data.stationId]: {
          availability: data.availability,
          timestamp: data.timestamp,
        },
      }));
    };

    return () => ws.close();
  }, [stationIds]);

  return updates;
};
```

### 3.2 Polling Alternatifi

WebSocket yoksa 30 saniyelik polling:

```javascript
const usePollingUpdates = (stationIds, interval = 30000) => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchUpdates = async () => {
      const res = await fetch('/api/stations/availability', {
        method: 'POST',
        body: JSON.stringify({ ids: stationIds }),
      });
      setData(await res.json());
    };

    fetchUpdates();
    const timer = setInterval(fetchUpdates, interval);
    return () => clearInterval(timer);
  }, [stationIds, interval]);

  return data;
};
```

---

## 4. Geocoding & Reverse Geocoding

### 4.1 Konum Alma

```javascript
const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Tarayıcınız konum servisini desteklemiyor');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { location, error, loading, getLocation };
};
```

### 4.2 Nominatim (Ücretsiz Geocoding)

```javascript
async function geocodeAddress(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query)}&format=json&countrycodes=tr&limit=5`
  );
  return res.json();
}

async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?` +
    `lat=${lat}&lon=${lng}&format=json`
  );
  return res.json();
}
```

---

## 5. Fiyat Veri Toplama Stratejileri

Operatörlerin fiyatlarını toplamak için:

1. **OCPI API** — Standart protokol, en güvenilir
2. **RSS/Webhook** — Fiyat değişikliği bildirimi
3. **Crowdsourcing** — Kullanıcı bildirimleri (doğrulama mekanizması ile)
4. **Web Scraping** — Son çare, operatör web sitelerinden (yasal uyum dikkat)

### 5.1 Fiyat Güncelleme Akışı

```
Operatör API → Normalizer → Validator → Database → Cache → Frontend
                   ↑                       ↑
            Crowdsource data          Price history
```

Her fiyat güncellemesini kaydedin, böylece fiyat geçmişi grafiği oluşturabilirsiniz.
