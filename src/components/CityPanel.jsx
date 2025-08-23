// src/components/CityPanel.jsx
import React from "react";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
} from "react-icons/wi";

const getIcon = (desc) => {
  if (!desc) return <WiDaySunny size={40} />;
  const d = desc.toLowerCase();
  if (d.includes("cloud")) return <WiCloud size={40} />;
  if (d.includes("rain")) return <WiRain size={40} />;
  if (d.includes("snow")) return <WiSnow size={40} />;
  if (d.includes("thunder")) return <WiThunderstorm size={40} />;
  if (d.includes("fog") || d.includes("mist")) return <WiFog size={40} />;
  return <WiDaySunny size={40} />;
};

export default function CityPanel({
  cityKey, // e.g., "Delhi,IN"
  cityData,
  forecastData,
  hourly,
  units,
  onRemove,
}) {
  const {
    name,
    country,
    temp,
    description,
    feels_like,
    humidity,
    pressure,
    wind_speed,
    sunrise,
    sunset,
    localTime,
  } = cityData || {};

  const unitSym = units === "metric" ? "°C" : "°F";

  const formatCardDate = (dateISO) => {
    const d = new Date(dateISO);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Ensure Next Days excludes "today" on the panel too
  const nextDays = (forecastData || []).filter((_, idx) => idx !== 0);

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-5 shadow-lg">
      {/* City & Current Weather */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-semibold mb-1">
            {name},{" "}
            <span className="text-sm text-slate-300">{country}</span>
          </div>
          <div className="text-sm text-slate-400">{localTime}</div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-3">
            <div className="text-6xl font-bold">
              {temp !== undefined ? temp : "--"}
              {unitSym}
            </div>
            <div className="text-center">
              {getIcon(description)}
              <div className="text-sm capitalize">{description}</div>
            </div>
          </div>
          <button
            onClick={() => onRemove?.(cityKey)}
            className="mt-2 text-xs text-red-300 hover:text-red-400 transition"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Weather details */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-200">
        <div>
          Feels:{" "}
          <span className="font-medium">
            {feels_like ?? "--"}
            {unitSym}
          </span>
        </div>
        <div>
          Humidity: <span className="font-medium">{humidity ?? "--"}%</span>
        </div>
        <div>
          Wind: <span className="font-medium">{wind_speed ?? "--"} m/s</span>
        </div>
        <div>
          Pressure: <span className="font-medium">{pressure ?? "--"} hPa</span>
        </div>
        <div>
          Sunrise: <span className="font-medium">{sunrise ?? "--"}</span>
        </div>
        <div>
          Sunset: <span className="font-medium">{sunset ?? "--"}</span>
        </div>
      </div>

      {/* Hourly Forecast */}
      {hourly && hourly.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm text-slate-300 mb-2">Hourly Forecast</h3>
          <div className="flex gap-3 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-500">
            {hourly.map((h, i) => (
              <div
                key={i}
                className="min-w-[84px] bg-white/5 rounded-lg p-2 text-center"
              >
                <div className="text-xs text-slate-300">{h?.time ?? "--"}</div>
                <div className="mt-1">{getIcon(h?.desc)}</div>
                <div className="mt-1 font-semibold">
                  {h?.temp !== undefined ? h.temp : "--"}
                  {unitSym}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Day Forecast */}
      {nextDays && nextDays.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm text-slate-300 mb-2">Next Days</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {nextDays.slice(0, 3).map((day, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-300">
                  {day?.date ? formatCardDate(day.date) : "--"}
                </div>
                <div className="my-1">{getIcon(day?.desc)}</div>
                <div className="font-semibold">
                  {day?.temp?.max !== undefined ? day.temp.max : "--"}
                  {unitSym} /{" "}
                  {day?.temp?.min !== undefined ? day.temp.min : "--"}
                  {unitSym}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
