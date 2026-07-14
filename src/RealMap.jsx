import React, { useEffect, useRef } from 'react';
import './map.css';

export default function RealMap({ buildings, selected, setSelected }) {
  const mapRef = useRef(null); const leafletRef = useRef(null);
  useEffect(() => {
    if (!window.L || !mapRef.current || leafletRef.current) return undefined;
    const map = window.L.map(mapRef.current, { zoomControl: false }).setView([31.2639, 34.7998], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    window.L.control.zoom({ position: 'topright' }).addTo(map); leafletRef.current = map;
    return () => { map.remove(); leafletRef.current = null; };
  }, []);
  useEffect(() => {
    const map = leafletRef.current; if (!map || !window.L) return; const L = window.L;
    map.eachLayer((layer) => { if (!layer._url) map.removeLayer(layer); });
    const points = buildings.map((_, index) => [31.2634 + index * 0.0011, 34.7981 + index * 0.0015]);
    const bounds = points.length ? L.latLngBounds(points) : L.latLngBounds([[31.262, 34.796], [31.266, 34.804]]);
    L.rectangle(bounds.pad(0.45), { color: '#ec806d', weight: 2, dashArray: '7 6', fillColor: '#f8c9b5', fillOpacity: 0.16 }).addTo(map).bindTooltip('Your Shechuna Gimel property area');
    buildings.forEach((building, index) => { const icon = L.divIcon({ className: `real-map-pin ${building.color} ${selected?.id === building.id ? 'chosen' : ''}`, html: `<span>⌂</span><b>${building.name}</b><small>${building.units} apartments</small>`, iconSize: [130, 48], iconAnchor: [65, 24] }); L.marker(points[index], { icon }).addTo(map).on('click', () => setSelected(building)); });
    if (selected) { const index = buildings.findIndex((building) => building.id === selected.id); if (index >= 0) map.panTo(points[index], { animate: true, duration: 0.4 }); }
  }, [buildings, selected, setSelected]);
  return <div className="panel map-panel"><div className="panel-head"><div><h2>Shechuna Gimel property map</h2><p>OpenStreetMap · Be'er Sheva</p></div><span className="filter">Drag to pan · Scroll to zoom</span></div><div className="map real-map" ref={mapRef}><div className="map-loading">Loading Be'er Sheva map...</div></div><div className="map-legend"><span><i className="legend coral" />Managed buildings</span><span><i className="zone-key" />Shechuna Gimel area</span><span>Click a building to select it</span></div></div>;
}
