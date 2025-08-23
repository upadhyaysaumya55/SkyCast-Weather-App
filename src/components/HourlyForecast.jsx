import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const HourlyForecast = ({ hourlyData }) => {
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="hourly-forecast">
        <h2>🌡 Hourly Forecast</h2>
        <p>No hourly forecast available</p>
      </div>
    );
  }

  // ✅ hourlyData is already normalized by extractHourlyFromForecast
  const chartData = hourlyData.map((hour) => ({
    time: hour.time, // already formatted like "02:00 PM"
    temp: hour.temp,
  }));

  return (
    <div className="hourly-forecast">
      <h2>🌡 Hourly Forecast (Next 8 Hours)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="temp" stroke="#ff7300" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HourlyForecast;
