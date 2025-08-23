import React from "react";

// Helper to safely format dates
const getDateLabel = (day) => {
  try {
    if (day.dt) {
      // Handle both seconds & milliseconds timestamps
      const ts = String(day.dt).length === 10 ? day.dt * 1000 : day.dt;
      return new Date(ts).toLocaleDateString("en-US", { weekday: "short" });
    }
    if (day.date) {
      return new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
    }
    return "N/A";
  } catch {
  return "N/A";
}

};

const DayTabs = ({ days, selectedDay, onSelect }) => {
  return (
    <div className="flex gap-3 mt-6 bg-white/20 rounded-xl p-3">
      {days.map((day, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            idx === selectedDay
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white/40 text-gray-800 hover:bg-blue-300"
          }`}
        >
          {getDateLabel(day)}
        </button>
      ))}
    </div>
  );
};

export default DayTabs;
