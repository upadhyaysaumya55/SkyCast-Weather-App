// src/utils/api.jsx
const API_KEY = "3e307f2eb90d413dfc5f6b9f8a5ffe73";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("API fetch error:", error);
    return { error: error.message };
  }
}

/* ---------------- Current & Forecast fetchers ---------------- */

export async function fetchCurrent(city, units = "metric") {
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(
    city
  )}&units=${units}&appid=${API_KEY}`;
  const data = await fetchJSON(url);
  if (data.error || data.cod !== 200) {
    throw new Error(`City "${city}" not found or invalid.`);
  }
  return data;
}

export async function fetchForecastByCoords(lat, lon, units = "metric") {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
  const data = await fetchJSON(url);
  if (data.error || data.cod !== "200") {
    throw new Error("Could not fetch forecast.");
  }
  return data;
}

/* ---------------- Timezone-safe helpers ---------------- */

// Shift unix time by city timezone offset (seconds) and return Date.
function shiftedDate(unixSeconds, tzOffsetSeconds) {
  return new Date((unixSeconds + tzOffsetSeconds) * 1000);
}

// Format as YYYY-MM-DD in the city's local time
export function formatLocalYMD(unixSeconds, tzOffsetSeconds) {
  const d = shiftedDate(unixSeconds, tzOffsetSeconds);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Format as hh:mm AM/PM in the city's local time
export function formatLocalHM(unixSeconds, tzOffsetSeconds) {
  const d = shiftedDate(unixSeconds, tzOffsetSeconds);
  let h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

/* ---------------- Forecast transformers ---------------- */

// ✅ Daily forecast extractor (keep this one)
export function extractDailyFromForecast(forecastData) {
  if (!forecastData?.list) return [];

  const tz = forecastData.city?.timezone || 0;
  const todayLocal = formatLocalYMD(Math.floor(Date.now() / 1000), tz);

  const byDay = new Map();

  forecastData.list.forEach((item) => {
    const dateISO = formatLocalYMD(item.dt, tz);
    if (dateISO < todayLocal) return; // skip past

    const localHour = shiftedDate(item.dt, tz).getUTCHours();
    const scoreToNoon = Math.abs(localHour - 12); // prefer closest to noon

    if (!byDay.has(dateISO)) {
      byDay.set(dateISO, {
        date: dateISO,
        temp: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
        desc: "",
        icon: "",
        _bestScore: Number.POSITIVE_INFINITY,
      });
    }

    const bucket = byDay.get(dateISO);
    bucket.temp.min = Math.min(bucket.temp.min, item.main.temp_min);
    bucket.temp.max = Math.max(bucket.temp.max, item.main.temp_max);

    if (scoreToNoon < bucket._bestScore) {
      bucket._bestScore = scoreToNoon;
      bucket.desc = item.weather?.[0]?.description || "";
      bucket.icon = item.weather?.[0]?.icon || "";
    }
  });

  return Array.from(byDay.values())
    .map((d) => ({
      date: d.date,
      temp: {
        min: Number.isFinite(d.temp.min) ? Math.round(d.temp.min) : undefined,
        max: Number.isFinite(d.temp.max) ? Math.round(d.temp.max) : undefined,
      },
      desc: d.desc,
      icon: d.icon,
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

// ✅ Hourly forecast extractor (new function)
export function extractHourlyFromForecast(forecastData, hours = 8) {
  if (!forecastData?.list) return [];

  const tz = forecastData.city?.timezone || 0;

  return forecastData.list.slice(0, hours).map((item) => ({
    time: formatLocalHM(item.dt, tz),
    temp: Math.round(item.main.temp),
    desc: item.weather?.[0]?.description || "",
    icon: item.weather?.[0]?.icon || "",
  }));
}
