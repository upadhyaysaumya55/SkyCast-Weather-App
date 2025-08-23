// src/utils/getBackground.js
export function getBackgroundClass(condition) {
  if (!condition || typeof condition !== "string") {
    return "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700";
  }

  const lower = condition.toLowerCase();

  if (lower.includes("cloud")) return "cloudy-bg";
  if (lower.includes("rain")) return "rainy-bg";
  if (lower.includes("clear")) return "sunny-bg";
  if (lower.includes("snow")) return "snowy-bg";
  if (lower.includes("storm") || lower.includes("thunder"))
    return "storm-bg";

  return "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700";
}
