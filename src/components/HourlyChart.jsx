import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
);

// Helper to safely format time labels
const getTimeLabel = (h) => {
  try {
    if (h.dt) {
      const ts = String(h.dt).length === 10 ? h.dt * 1000 : h.dt;
      return new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (h.time) {
      return h.time;
    }
    return "N/A";
  } catch {
  return "N/A";
}

};

const HourlyChart = ({ hourlyData }) => {
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="w-full max-w-2xl bg-white/30 backdrop-blur-md p-6 mt-6 rounded-2xl shadow-lg text-center">
        <p className="text-gray-700">No hourly data available</p>
      </div>
    );
  }

  const labels = hourlyData.map((h) => getTimeLabel(h));

  const data = {
    labels,
    datasets: [
      {
        label: "Temperature °C",
        // Support both main.temp (forecast API) and temp (onecall API)
        data: hourlyData.map((h) => h.main?.temp ?? h.temp ?? 0),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "white",
        pointBorderColor: "rgba(59, 130, 246, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { stepSize: 2 },
      },
    },
  };

  return (
    <div className="w-full max-w-2xl bg-white/30 backdrop-blur-md p-6 mt-6 rounded-2xl shadow-lg">
      <Line data={data} options={options} />
    </div>
  );
};

export default HourlyChart;
