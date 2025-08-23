import React from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

export default function Header({ onSearch, onGeolocate, searchText, setSearchText }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold">Skycast-Weather</div>
        <div className="text-sm text-slate-300 hidden md:block">Multi-City Dashboard</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white/6 rounded-full px-3 py-2 shadow-inner">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search city or postcode"
            className="bg-transparent outline-none text-slate-100 placeholder-slate-400 w-56 md:w-72"
            onKeyDown={(e)=> e.key === 'Enter' && onSearch()}
          />
          <button onClick={onSearch} className="ml-2 text-slate-200 hover:text-white">
            <FaSearch />
          </button>
        </div>

        <button title="Use my location" onClick={onGeolocate}
                className="bg-white/6 p-2 rounded-full hover:bg-white/10">
          <FaMapMarkerAlt />
        </button>
      </div>
    </header>
  );
}