// src/components/ForecastSideBar.jsx
import React from "react";
import { formatLocalYMD } from "../utils/api";

/**
 * Props:
 *  - daily: array from extractDailyFromForecast([{ date, temp:{min,max}, desc, icon }...])
 *  - cityName: "City, COUNTRY"
 *  - lat, lon: numbers (optional; used for weather.com link)
 *  - timezone: seconds offset from UTC (required to compute local today)
 */
const ForecastSideBar = ({ daily = [], cityName = "", lat, lon, timezone = 0 }) => {
  // compute "today" for the city's timezone
  const todayLocal = formatLocalYMD(Math.floor(Date.now() / 1000), timezone);

  // drop "today" and keep next 5 days max
  const nextDays = daily.filter((d) => d.date !== todayLocal).slice(0, 5);

  if (!nextDays.length) {
    return (
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold mb-2">Next Days Forecast</h3>
        <p className="text-sm text-slate-300">No forecast available</p>
      </div>
    );
  }

  const linkHref =
    lat != null && lon != null
      ? `https://weather.com/weather/tenday/l/${lat},${lon}`
      : `https://weather.com/weather/tenday/l/${encodeURIComponent(cityName)}`;

  const formatCardDate = (dateISO) => {
    const d = new Date(dateISO);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Next Days Forecast</h3>
        <a
          href={linkHref}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-sky-300 hover:underline"
          title="Open full 10-day forecast on weather.com"
        >
          weather.com →
        </a>
      </div>

      <div className="mt-4 space-y-3">
        {nextDays.map((d, idx) => {
          const maxTemp = d.temp?.max ?? d.temp?.day ?? "--";
          const minTemp = d.temp?.min ?? d.temp?.night ?? "--";

          return (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 transition duration-200 shadow-sm"
            >
              {/* Date */}
              <div className="text-sm font-medium w-20">{formatCardDate(d.date)}</div>

              {/* Icon */}
              {d.icon ? (
                <img
                  src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                  alt={d.desc || "weather"}
                  className="w-8 h-8"
                />
              ) : (
                <div className="w-8 h-8" />
              )}

              {/* Description */}
              <div className="text-xs capitalize text-slate-300 flex-1 px-2">
                {d.desc || "—"}
              </div>

              {/* Temps */}
              <div className="text-sm font-semibold">
                {maxTemp}° / <span className="text-slate-400">{minTemp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForecastSideBar;
