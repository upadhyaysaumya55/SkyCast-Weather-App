// src/App.jsx
import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import CityPanel from "./components/CityPanel";
import ForecastSideBar from "./components/ForecastSideBar";
import Loader from "./components/Loader";
import HourlyForecast from "./components/HourlyForecast";
import DayTabs from "./components/DayTabs";           // ✅ NEW
import HourlyChart from "./components/HourlyChart";   // ✅ NEW
import { getBackgroundClass } from "./utils/getBackground";

import {
  fetchCurrent,
  fetchForecastByCoords,
  extractDailyFromForecast,
  extractHourlyFromForecast,
  formatLocalHM,
} from "./utils/api";

export default function App() {
  const [cities, setCities] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cities"));
      if (Array.isArray(saved) && saved.length) return saved;
    } catch (e) {
      console.error("Error parsing cities from localStorage", e);
    }
    return ["Delhi,IN", "Dubai,AE"];
  });

  const [cityDataMap, setCityDataMap] = useState({});
  const [units, setUnits] = useState("metric");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // ✅ NEW state

  // ✅ Fetch city data
  const loadCity = useCallback(
    async (cityKey) => {
      try {
        if (!cityKey?.trim()) return false;

        const current = await fetchCurrent(cityKey, units);
        if (!current?.coord) throw new Error("Invalid current data");

        const { lat, lon } = current.coord;
        const forecast = await fetchForecastByCoords(lat, lon, units);

        const daily = extractDailyFromForecast(forecast);
        const hourly = extractHourlyFromForecast(forecast, 48); // get more hours for charts

        const tz = current.timezone || 0;

        const getLocalTime = () => {
          const nowUTC =
            new Date().getTime() + new Date().getTimezoneOffset() * 60000;
          const cityTime = new Date(nowUTC + tz * 1000);
          return cityTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        };

        const formatted = {
          name: current.name,
          country: current.sys?.country || "",
          temp:
            typeof current.main?.temp === "number"
              ? Math.round(current.main.temp)
              : "--",
          description: current.weather?.[0]?.description || "",
          feels_like:
            typeof current.main?.feels_like === "number"
              ? Math.round(current.main.feels_like)
              : "--",
          humidity: current.main?.humidity ?? "--",
          pressure: current.main?.pressure ?? "--",
          wind_speed: current.wind?.speed ?? "--",
          sunrise: current.sys?.sunrise
            ? formatLocalHM(current.sys.sunrise, tz)
            : "--",
          sunset: current.sys?.sunset
            ? formatLocalHM(current.sys.sunset, tz)
            : "--",
          localTime: getLocalTime(),
          timezone: tz,
          lat,
          lon,
          daily,
          hourly,
        };

        setCityDataMap((prev) => ({
          ...prev,
          [cityKey]: formatted,
        }));

        return true;
      } catch (err) {
        console.error(`loadCity error for "${cityKey}":`, err);
        return false;
      }
    },
    [units]
  );

  // ✅ Auto update time every 1 min
  useEffect(() => {
    const interval = setInterval(() => {
      setCityDataMap((prev) => {
        const updated = {};
        for (const [key, val] of Object.entries(prev)) {
          if (!val?.timezone) {
            updated[key] = val;
            continue;
          }
          const nowUTC =
            new Date().getTime() + new Date().getTimezoneOffset() * 60000;
          const cityTime = new Date(nowUTC + val.timezone * 1000);
          updated[key] = {
            ...val,
            localTime: cityTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
        return { ...prev, ...updated };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Initial data load
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        for (const c of cities) {
          if (!mounted) break;
          await loadCity(c);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [cities, units, loadCity]);

  // ✅ Persist cities
  useEffect(() => {
    localStorage.setItem("cities", JSON.stringify(cities));
  }, [cities]);

  const addCity = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const city = searchText.trim();
    if (!city) return;

    if (cities.includes(city)) {
      setSearchText("");
      if (!cityDataMap[city]) await loadCity(city);
      return;
    }

    setCities((prev) => [city, ...prev].slice(0, 10));
    setSearchText("");

    const ok = await loadCity(city);
    if (!ok) {
      setCities((prev) => prev.filter((c) => c !== city));
      alert(
        `Could not find data for "${city}".\n\nTip: Use "City,COUNTRY_CODE" (e.g., "Hajipur,IN").`
      );
    }
  };

  const removeCity = (cityKey) => {
    setCities((prev) => prev.filter((c) => c !== cityKey));
    setCityDataMap((prev) => {
      const next = { ...prev };
      delete next[cityKey];
      return next;
    });
  };

  // ✅ Detect user location
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${
              import.meta.env.VITE_WEATHER_API_KEY
            }&units=${units}`
          );
          const data = await res.json();
          const detected =
            data?.name && data?.sys?.country
              ? `${data.name},${data.sys.country}`
              : null;

          if (detected) {
            if (!cities.includes(detected)) {
              setCities((prev) => [detected, ...prev].slice(0, 10));
              const ok = await loadCity(detected);
              if (!ok) {
                setCities((prev) => prev.filter((c) => c !== detected));
                alert(
                  `Could not load weather for your location (${detected}).`
                );
              }
            } else if (!cityDataMap[detected]) {
              await loadCity(detected);
            }
          } else {
            alert("Could not determine city from your coordinates.");
          }
        } catch (err) {
          console.error(err);
          alert("Failed to determine city from geolocation.");
        }
      },
      (err) => {
        console.error("geolocation error", err);
        alert("Could not get your location. Check permissions.");
      }
    );
  };

  const primaryCityKey = cities[0];
  const primaryCity = primaryCityKey ? cityDataMap[primaryCityKey] : null;

  // ✅ Background theme
  const backgroundClass = getBackgroundClass(primaryCity?.description || "");

  return (
    <div className={`${backgroundClass} min-h-screen transition-all`}>
      <div className="container mx-auto p-6">
        {/* Header Component */}
        <Header
          onSearch={addCity}
          onGeolocate={handleGeolocate}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Content */}
          <main className="md:col-span-3 space-y-6">
            {loading && <Loader />}
            <AnimatePresence>
              {cities.map((cityKey) => {
                const data = cityDataMap[cityKey];
                return (
                  <div key={cityKey} className="space-y-4">
                    <CityPanel
                      cityKey={cityKey}
                      cityData={data || {
                        name: cityKey.split(",")[0] || cityKey,
                        country: cityKey.split(",")[1] || "",
                        temp: "--",
                        description: "Loading...",
                        feels_like: "--",
                        humidity: "--",
                        pressure: "--",
                        wind_speed: "--",
                        sunrise: "--",
                        sunset: "--",
                        localTime: "--",
                        daily: [],
                        hourly: [],
                      }}
                      forecastData={data?.daily || []}
                      hourly={data?.hourly || []}
                      units={units}
                      onRemove={removeCity}
                    />

                    {/* ✅ Day Tabs for daily forecast */}
                    {data?.daily?.length > 0 && (
                      <DayTabs
                        days={data.daily}
                        selectedDayIndex={selectedDayIndex}
                        onSelectDay={setSelectedDayIndex}
                      />
                    )}

                    {/* ✅ Hourly Chart for the selected day */}
                    {data?.hourly?.length > 0 && (
                      <HourlyChart
                        hourlyData={data.hourly}
                        selectedDayIndex={selectedDayIndex}
                        timezone={data.timezone}
                      />
                    )}

                    {/* ✅ Legacy Hourly Forecast List */}
                    {data?.hourly?.length > 0 && (
                      <HourlyForecast hourlyData={data.hourly.slice(0, 8)} />
                    )}
                  </div>
                );
              })}
            </AnimatePresence>
          </main>

          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-6">
            <ForecastSideBar
              daily={primaryCity?.daily || []}
              cityName={
                primaryCity ? `${primaryCity.name}, ${primaryCity.country}` : ""
              }
              lat={primaryCity?.lat}
              lon={primaryCity?.lon}
              timezone={primaryCity?.timezone || 0}
            />

            {/* Settings Card */}
            <div className="bg-white/4 border border-white/6 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Settings</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setUnits("metric")}
                  className={`px-3 py-2 rounded ${
                    units === "metric" ? "bg-white/10" : "bg-transparent"
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setUnits("imperial")}
                  className={`px-3 py-2 rounded ${
                    units === "imperial" ? "bg-white/10" : "bg-transparent"
                  }`}
                >
                  °F
                </button>
              </div>
              <div className="mt-4 text-sm text-slate-300">
                Data auto-refreshes when you change units or add a city.
                <br />
                For best results, search using <b>"City,COUNTRY_CODE"</b>.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
