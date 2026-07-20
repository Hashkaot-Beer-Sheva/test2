import React, { useEffect, useRef } from 'react';
import './map.css';

export default function RealMap({ buildings = [], selected, setSelected, geocoding = false } = {}) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  useEffect(() => {
    if (!window.L || !mapRef.current || leafletRef.current) return undefined;
    const map = window.L.map(mapRef.current, { zoomControl: false }).setView([31.2639, 34.7998], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    window.L.control.zoom({ position: 'topright' }).addTo(map);
    leafletRef.current = map;
    return () => { map.remove(); leafletRef.current = null; };
  }, []);
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !window.L) return;
    const L = window.L;
    map.eachLayer((layer) => { if (!layer._url) map.removeLayer(layer); });
    const locatedBuildings = buildings.filter((building) => Number.isFinite(Number(building.lat)) && Number.isFinite(Number(building.lng)) && building.geoSource === 'arcgis');
    const points = locatedBuildings.map((building) => [Number(building.lat), Number(building.lng)]);
    const bounds = points.length ? L.latLngBounds(points) : L.latLngBounds([[31.262, 34.796], [31.266, 34.804]]);
    L.rectangle(bounds.pad(0.35), { color: '#ec806d', weight: 2, dashArray: '7 6', fillColor: '#f8c9b5', fillOpacity: 0.16 }).addTo(map).bindTooltip('Your Shechuna Gimel property area');
    locatedBuildings.forEach((building, index) => {
      const icon = L.divIcon({ className: `real-map-pin ${building.color} ${selected?.id === building.id ? 'chosen' : ''}`, html: '<span>⌂</span>', iconSize: [30, 30], iconAnchor: [15, 15] });
      L.marker(points[index], { icon }).addTo(map).bindPopup(`<b>${building.name || 'Building'}</b><br>${building.address || ''}<br>Coordinates: ${Number(points[index][0]).toFixed(6)}, ${Number(points[index][1]).toFixed(6)}<br>${building.units || 0} apartments`).on('click', () => setSelected(building));
    });
    if (points.length > 1 && !selected) map.fitBounds(bounds.pad(0.2), { maxZoom: 17, animate: false });
    if (selected) { const index = locatedBuildings.findIndex((building) => building.id === selected.id); if (index >= 0) map.panTo(points[index], { animate: true, duration: 0.4 }); }
  }, [buildings, selected, setSelected]);
  return <div className="panel map-panel"><div className="panel-head"><div><h2>Property map</h2><p>OpenStreetMap · Be'er Sheva</p></div><span className="filter">Drag to pan · Scroll to zoom</span></div><div className="map real-map" ref={mapRef}><div className="map-loading">Loading Be'er Sheva map...</div>{geocoding && <div className="geocode-overlay"><span className="spinner" />Finding building coordinates…</div>}</div><div className="map-legend"><span><i className="legend coral" />Managed buildings</span><span><i className="zone-key" />Shechuna Gimel area</span><span>Click a pin for building details</span></div></div>;
}
