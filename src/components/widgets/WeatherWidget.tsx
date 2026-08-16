import React, { useState, useEffect } from "react";

interface WeatherState {
  temp: number;
  condition: string;
  high: number;
  low: number;
  location: string;
  humidity: number;
  wind: number;
  iconType: "sunny" | "partly-cloudy" | "cloudy" | "rainy" | "moon";
  isDay: boolean;
  loading: boolean;
}

// Fallback to Lalit's current location (Vadodara)
const FALLBACK_WEATHER: WeatherState = {
  temp: 28,
  condition: "Partly Cloudy",
  high: 32,
  low: 24,
  location: "Vadodara",
  humidity: 62,
  wind: 9,
  iconType: "partly-cloudy",
  isDay: true,
  loading: false,
};

function mapWmoToCondition(code: number, isDay: boolean): { condition: string; iconType: WeatherState["iconType"] } {
  if (code === 0) {
    return { condition: isDay ? "Clear Sky" : "Clear Night", iconType: isDay ? "sunny" : "moon" };
  }
  if (code === 1 || code === 2) {
    return { condition: isDay ? "Partly Cloudy" : "Mainly Clear", iconType: isDay ? "partly-cloudy" : "moon" };
  }
  if (code === 3) {
    return { condition: "Overcast", iconType: "cloudy" };
  }
  if (code === 45 || code === 48) {
    return { condition: "Foggy", iconType: "cloudy" };
  }
  if (code >= 51 && code <= 67) {
    return { condition: "Rainy", iconType: "rainy" };
  }
  if (code >= 71 && code <= 77) {
    return { condition: "Snow", iconType: "cloudy" };
  }
  if (code >= 80 && code <= 82) {
    return { condition: "Rain Showers", iconType: "rainy" };
  }
  if (code >= 95) {
    return { condition: "Thunderstorm", iconType: "rainy" };
  }
  return { condition: isDay ? "Fair" : "Clear Night", iconType: isDay ? "partly-cloudy" : "moon" };
}

// SF Symbol vector weather icons (No raw emojis)
const WeatherIcon = ({ type, size = 36 }: { type: string; size?: number }) => {
  const s = size;
  if (type === "sunny") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4.5" fill="#FFD60A" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <line
            key={i}
            x1="12"
            y1="2.5"
            x2="12"
            y2="5"
            stroke="#FFD60A"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${deg} 12 12)`}
          />
        ))}
      </svg>
    );
  }
  if (type === "rainy") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path
          d="M6 13a5 5 0 1 1 9.9-1H17a3 3 0 0 1 0 6H7a4 4 0 0 1-1-7.87"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.6"
          fill="none"
        />
        <line x1="9" y1="18" x2="7" y2="21" stroke="#64D2FF" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="13" y1="18" x2="11" y2="21" stroke="#64D2FF" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "cloudy") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path
          d="M5 13a5 5 0 1 1 9.9-1H16a3 3 0 0 1 0 6H7a4 4 0 0 1-2-7.46"
          stroke="rgba(210,225,245,0.9)"
          strokeWidth="1.6"
          fill="rgba(200,215,240,0.18)"
        />
      </svg>
    );
  }
  if (type === "moon") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          stroke="rgba(215,230,255,0.95)"
          strokeWidth="1.6"
          fill="rgba(180,200,255,0.18)"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // partly-cloudy default
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8.5" r="3.5" fill="#FFD60A" opacity="0.95" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <line
          key={i}
          x1="9"
          y1="1.5"
          x2="9"
          y2="3.2"
          stroke="#FFD60A"
          strokeWidth="1.6"
          strokeLinecap="round"
          transform={`rotate(${deg} 9 8.5)`}
        />
      ))}
      <path
        d="M8 14a4.5 4.5 0 1 1 8.9-.9H18a2.8 2.8 0 0 1 0 5.6H9a3.4 3.4 0 0 1-1-6.35"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        fill="rgba(255,255,255,0.16)"
      />
    </svg>
  );
};

interface WeatherWidgetProps {
  compact?: boolean;
}

export default function WeatherWidget({ compact }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherState>({ ...FALLBACK_WEATHER, loading: true });

  const fetchLiveWeather = async (lat: number, lon: number, cityName?: string) => {
    try {
      // 1. Fetch Real Weather via Open-Meteo API
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await weatherRes.json();

      let detectedCity = cityName;

      // 2. If cityName not known, reverse-geocode via Nominatim
      if (!detectedCity) {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const geoData = await geoRes.json();
          detectedCity =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.suburb ||
            geoData.address?.state_district ||
            geoData.address?.state ||
            "Local Area";
        } catch {
          detectedCity = "My Location";
        }
      }

      const current = data.current || {};
      const daily = data.daily || {};
      const isDay = current.is_day === 1;
      const weatherCode = current.weather_code ?? 1;
      const { condition, iconType } = mapWmoToCondition(weatherCode, isDay);

      setWeather({
        temp: Math.round(current.temperature_2m ?? 28),
        condition,
        high: Math.round(daily.temperature_2m_max?.[0] ?? (current.temperature_2m + 4)),
        low: Math.round(daily.temperature_2m_min?.[0] ?? (current.temperature_2m - 4)),
        location: detectedCity || "Local",
        humidity: Math.round(current.relative_humidity_2m ?? 55),
        wind: Math.round(current.wind_speed_10m ?? 8),
        iconType,
        isDay,
        loading: false,
      });
    } catch {
      setWeather({ ...FALLBACK_WEATHER, loading: false });
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchLiveWeather(pos.coords.latitude, pos.coords.longitude);
        },
        async () => {
          // If Geolocation is blocked/denied, use IP-based Geolocation API
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              fetchLiveWeather(ipData.latitude, ipData.longitude, ipData.city);
              return;
            }
          } catch {
            // Fallback to Vadodara coordinates
            fetchLiveWeather(22.3025, 73.2386, "Vadodara");
          }
        },
        { timeout: 5000 }
      );
    } else {
      fetchLiveWeather(22.3025, 73.2386, "Vadodara");
    }
  }, []);

  const GLASS: React.CSSProperties = {
    background: "linear-gradient(145deg, rgba(22,28,42,0.88) 0%, rgba(16,22,36,0.94) 100%)",
    backdropFilter: "blur(64px) saturate(200%)",
    WebkitBackdropFilter: "blur(64px) saturate(200%)",
    border: "0.5px solid rgba(255,255,255,0.14)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 0.5px 0 rgba(255,255,255,0.18)",
    fontFamily: "var(--font-system)",
  };

  if (compact) {
    return (
      <div
        style={{
          ...GLASS,
          borderRadius: 16,
          padding: "14px 16px 12px",
          userSelect: "none",
          width: 162,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>
          {weather.location}
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 200,
            color: "white",
            lineHeight: 1,
            letterSpacing: "-2px",
            fontVariantNumeric: "tabular-nums",
            marginBottom: 6,
          }}
        >
          {weather.temp}°
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            paddingTop: 8,
            borderTop: "0.5px solid rgba(255,255,255,0.09)",
          }}
        >
          <WeatherIcon type={weather.iconType} size={14} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", letterSpacing: "0.01em" }}>
            {weather.condition}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...GLASS, borderRadius: 18, padding: "16px 18px", userSelect: "none", width: 204 }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.72)",
              marginBottom: 4,
              fontWeight: 600,
              maxWidth: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {weather.location}
          </div>
          <div style={{ fontSize: 42, fontWeight: 200, color: "white", lineHeight: 1, letterSpacing: "-1.5px" }}>
            {weather.temp}°
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 5, fontWeight: 500 }}>
            {weather.condition}
          </div>
        </div>
        <WeatherIcon type={weather.iconType} size={46} />
      </div>

      {/* Stats with Vector Icons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 10,
          borderTop: "0.5px solid rgba(255,255,255,0.1)",
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
          H:{weather.high}° L:{weather.low}°
        </span>

        {/* Humidity Vector */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
          <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span>{weather.humidity}%</span>
        </div>

        {/* Wind Vector */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
          <svg className="w-3 h-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
          </svg>
          <span>{weather.wind}km/h</span>
        </div>
      </div>
    </div>
  );
}
