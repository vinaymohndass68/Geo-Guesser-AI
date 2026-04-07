import React, { useState } from 'react';

interface MapDisplayProps {
  latitude: number;
  longitude: number;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ latitude, longitude }) => {
  const [zoom, setZoom] = useState(15);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 21));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 1));

  const mapSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=en&z=${zoom}&output=embed`;
  const externalMapLink = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=en&z=${zoom}`;

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg flex flex-col bg-slate-800">
      <div className="relative flex-grow">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapSrc}
          title="Location Map"
          key={mapSrc} // Force re-render on src change
        ></iframe>
      </div>
      <div className="p-2 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold w-8 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 flex items-center justify-center text-xl"
            aria-label="Zoom out"
          >
            -
          </button>
          <span className="text-sm text-slate-300 w-16 text-center" aria-live="polite">Zoom: {zoom}</span>
          <button
            onClick={handleZoomIn}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold w-8 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 flex items-center justify-center text-xl"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        <a
          href={externalMapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
};
