import React from 'react';
import { LocationData } from '../services/geminiService';
import { MapDisplay } from './MapDisplay';
import { ArchIcon, HistoryIcon, PoiIcon } from './icons';

interface ResultDisplayProps {
  imageUrl: string;
  locationData: LocationData;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, locationData }) => {
  return (
    <div className="bg-slate-700/30 backdrop-blur-md p-4 md:p-8 rounded-3xl animate-fade-in border border-slate-600/50 shadow-2xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {/* Left Column: Image and Main Info */}
        <div className="flex flex-col gap-8">
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-700/50">
            <img src={imageUrl} alt="Analyzed location" className="w-full h-auto object-cover max-h-[450px] transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {locationData.locationName || "Identified Location"}
              </h3>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
              <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                Location Insight
              </h4>
              <p className="text-slate-200 leading-relaxed text-sm md:text-base">
                {locationData.description}
              </p>
            </div>

            {locationData.architecturalStyle && (
              <div className="animate-fade-in bg-amber-400/5 border border-amber-400/20 p-5 rounded-2xl group hover:bg-amber-400/10 transition-colors">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <ArchIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Architecture
                </h4>
                <div className="text-slate-300 text-sm leading-relaxed">
                  {locationData.architecturalStyle}
                </div>
              </div>
            )}

            {locationData.historicalSignificance && (
              <div className="animate-fade-in bg-emerald-400/5 border border-emerald-400/20 p-5 rounded-2xl group hover:bg-emerald-400/10 transition-colors">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  History & Legacy
                </h4>
                <div className="text-slate-300 text-sm leading-relaxed">
                  {locationData.historicalSignificance}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Map and POIs */}
        <div className="flex flex-col gap-8 h-full">
          <div className="flex-grow min-h-[400px] lg:min-h-0 relative">
            {locationData.latitude && locationData.longitude ? (
              <div className="h-full rounded-2xl overflow-hidden border border-slate-600/50 shadow-2xl ring-1 ring-slate-700/50">
                <MapDisplay latitude={locationData.latitude} longitude={locationData.longitude} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700">
                <PoiIcon className="w-16 h-16 text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">GPS Coordinates Unavailable</p>
              </div>
            )}
          </div>

          {locationData.nearbyAttractions && locationData.nearbyAttractions.length > 0 && (
            <div className="animate-fade-in bg-violet-500/5 border border-violet-500/20 p-6 rounded-2xl">
              <h4 className="text-xs font-black text-violet-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <PoiIcon className="w-4 h-4" />
                Explore Nearby
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {locationData.nearbyAttractions.map((poi, idx) => (
                  <span key={idx} className="px-4 py-2 bg-violet-500/10 border border-violet-500/20 text-violet-200 text-xs font-bold rounded-xl hover:bg-violet-500/20 transition-all cursor-default">
                    {poi}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};