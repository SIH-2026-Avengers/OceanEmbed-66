import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useOcean, LOCATION_DETAILS } from '../../context/OceanContext';
import { LocationKey, ParameterType } from '../../types/ocean';

interface Real2DMapProps {
  selectedParam?: ParameterType;
  heightClass?: string;
}

export const Real2DMap: React.FC<Real2DMapProps> = ({ selectedParam = 'sst', heightClass = 'h-[400px]' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { selectedLocation, setSelectedLocation, currentLocation } = useOcean();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLocation.latitude, currentLocation.longitude],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear non-tile layers
    map.eachLayer((layer) => {
      if (
        layer instanceof L.Marker ||
        layer instanceof L.Circle ||
        layer instanceof L.Rectangle ||
        layer instanceof L.CircleMarker
      ) {
        map.removeLayer(layer);
      }
    });

    // Add Thermal heat circles covering Arabian Sea & Bay of Bengal
    const arabianLoc = LOCATION_DETAILS.arabian_sea;
    const arabianCircle = L.circle([arabianLoc.latitude, arabianLoc.longitude], {
      radius: 480000,
      color: selectedLocation === 'arabian_sea' ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)',
      weight: selectedLocation === 'arabian_sea' ? 2 : 1,
      fillColor: selectedLocation === 'arabian_sea' ? '#ef4444' : '#0284c7',
      fillOpacity: selectedLocation === 'arabian_sea' ? 0.45 : 0.25,
    }).addTo(map);

    const bayLoc = LOCATION_DETAILS.bay_of_bengal;
    const bayCircle = L.circle([bayLoc.latitude, bayLoc.longitude], {
      radius: 480000,
      color: selectedLocation === 'bay_of_bengal' ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)',
      weight: selectedLocation === 'bay_of_bengal' ? 2 : 1,
      fillColor: selectedLocation === 'bay_of_bengal' ? '#ef4444' : '#0284c7',
      fillOpacity: selectedLocation === 'bay_of_bengal' ? 0.45 : 0.25,
    }).addTo(map);

    arabianCircle.on('click', () => setSelectedLocation('arabian_sea'));
    bayCircle.on('click', () => setSelectedLocation('bay_of_bengal'));

    // Custom HTML Marker generator
    const createMarkerHtml = (name: string, isSelected: boolean, temp: number) => {
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); cursor:pointer;">
            <div style="
              background: ${isSelected ? '#0b1329' : 'rgba(11, 19, 41, 0.85)'};
              border: 1.5px solid ${isSelected ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)'};
              color: ${isSelected ? '#00f0ff' : '#e2e8f0'};
              font-family: ui-monospace, monospace;
              font-size: 11px;
              font-weight: bold;
              padding: 4px 8px;
              border-radius: 6px;
              white-space: nowrap;
              box-shadow: ${isSelected ? '0 0 15px rgba(0, 240, 255, 0.7)' : 'none'};
            ">
              ${isSelected ? '📍 ' : ''}${name} (${temp}°C)
            </div>
            <div style="
              width: 8px;
              height: 8px;
              background: ${isSelected ? '#00f0ff' : '#94a3b8'};
              transform: rotate(45deg);
              margin-top: -4px;
              box-shadow: ${isSelected ? '0 0 10px #00f0ff' : 'none'};
            "></div>
          </div>
        `,
        iconSize: [0, 0],
      });
    };

    const arabianMarker = L.marker([arabianLoc.latitude, arabianLoc.longitude], {
      icon: createMarkerHtml(arabianLoc.name, selectedLocation === 'arabian_sea', arabianLoc.surfaceTemp),
    }).addTo(map);
    arabianMarker.on('click', () => setSelectedLocation('arabian_sea'));

    const bayMarker = L.marker([bayLoc.latitude, bayLoc.longitude], {
      icon: createMarkerHtml(bayLoc.name, selectedLocation === 'bay_of_bengal', bayLoc.surfaceTemp),
    }).addTo(map);
    bayMarker.on('click', () => setSelectedLocation('bay_of_bengal'));

    // Smooth pan to active location
    map.flyTo([currentLocation.latitude, currentLocation.longitude], 5, {
      duration: 1.0,
    });

  }, [selectedLocation, currentLocation, selectedParam, setSelectedLocation]);

  return (
    <div className={`w-full ${heightClass} relative rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#050814]" />
      
      {/* Top Map Badges */}
      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-lg bg-[#070d1e]/90 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 backdrop-blur-md flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>LIVE SATELLITE TILES (CARTODB DARK)</span>
      </div>

      <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-lg bg-[#070d1e]/90 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 backdrop-blur-md">
        VARIABLE: <span className="text-white font-bold">{selectedParam.toUpperCase()}</span>
      </div>
    </div>
  );
};
