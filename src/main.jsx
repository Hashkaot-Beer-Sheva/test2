import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './enhancements.css';
import './people.css';
import './drawer.css';
import './finance.css';
import '../maintenance.css';
import './finance-dashboard.css';
import './leasing.css';
import './renewal.css';
import './renewal-register.css';
import './renewal-dashboard.css';
import './pinui.css';
import './top-search.css';
import RealMap from './RealMap';

import { seed, mockExpansion, spreadsheetImport, bulkApartments, bulkEvents, bulkBills, buildApartmentOperations } from './mockData';

const money = (n) => `₪${Number(n || 0).toLocaleString('en-US')}`;
const coordinatesLabel = (building) => Number.isFinite(Number(building?.lat)) && Number.isFinite(Number(building?.lng))
  ? `${Number(building.lat).toFixed(6)}, ${Number(building.lng).toFixed(6)}`
  : 'Coordinates pending';
const hydrateData = (loadMock = false) => {
  const saved = JSON.parse(localStorage.getItem('blockwise-data') || 'null');
  const base = loadMock ? {
    ...seed,
    buildings: [...seed.buildings, ...mockExpansion.buildings, ...spreadsheetImport.buildings],
    apartments: [...seed.apartments, ...mockExpansion.apartments, ...spreadsheetImport.apartments],
    people: [...seed.people, ...mockExpansion.people, ...spreadsheetImport.people],
  } : (saved || { buildings: [], apartments: [], people: [], bills: [], events: [], maintenance: [] });
  const apartments = [
    ...(base.apartments || []),
    ...mockExpansion.apartments.filter(
      (a) => !(base.apartments || []).some((item) => item.id === a.id)
    ),
    ...bulkApartments.filter((a) => !(base.apartments || []).some((item) => item.id === a.id)),
    ...spreadsheetImport.apartments.filter(
      (a) => !(base.apartments || []).some((item) => item.id === a.id)
    ),
  ];
  const operations = buildApartmentOperations(apartments);
  return {
    ...base,
    buildings: [
      ...(base.buildings || []),
      ...mockExpansion.buildings.filter(
        (b) => !(base.buildings || []).some((item) => item.id === b.id)
      ),
      ...spreadsheetImport.buildings.filter(
        (b) => !(base.buildings || []).some((item) => item.id === b.id)
      ),
    ],
    apartments: operations.apartments,
    people: [
      ...(base.people || []),
      ...mockExpansion.people.filter((p) => !(base.people || []).some((item) => item.id === p.id)),
      ...spreadsheetImport.people.filter(
        (p) => !(base.people || []).some((item) => item.id === p.id)
      ),
    ],
    events: [
      ...(base.events || []),
      ...bulkEvents.filter((event) => !(base.events || []).some((item) => item.id === event.id)),
    ],
    bills: [
      ...(base.bills || []),
      ...bulkBills.filter((bill) => !(base.bills || []).some((item) => item.id === bill.id)),
    ],
    maintenance: [
      ...(base.maintenance || []),
      ...operations.maintenance.filter(
        (item) => !(base.maintenance || []).some((existing) => existing.id === item.id)
      ),
    ],
  };
};
const parseMasterCsv = (text) => { const lines = text.trim().split(/\r?\n/).filter(Boolean); if (lines.length < 2) return { buildings: [], apartments: [] }; const headers = lines[0].split(','); const rows = lines.slice(1).map((line) => { const values = line.split(','); return Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()])); }); const buildingMap = new Map(); const apartments = rows.map((row, index) => { const key = `${row.Street}-${row['Street Number']}`; if (!buildingMap.has(key)) buildingMap.set(key, { id: `csv-building-${buildingMap.size + 1}`, name: `${row.Street} ${row['Street Number']}`, street: row.Street, streetNumber: row['Street Number'], address: row['Address (Not editable)'] || `${row.Street} ${row['Street Number']}`, area: 'Shechuna Gimel', units: 0, floors: Number(row.Floor || 0), zone: row.Class || 'Residential', color: 'gold', lat: 31.2643 + buildingMap.size * 0.0004, lng: 34.7989 + buildingMap.size * 0.0004 }); const building = buildingMap.get(key); building.units += 1; return { id: `csv-apartment-${row['Appt ID'] || index}`, buildingId: building.id, uniqueId: row.UniquID, apptId: row['Appt ID'], number: row.Appt, entrance: row.Entrance, street: row.Street, streetNumber: row['Street Number'], altAddress: row.AltAddress, addressNotEditable: row['Address (Not editable)'], rooms: Number(row['#Rooms'] || 0), garden: row.Garden === 'TRUE', floor: Number(row.Floor || 0), size: Number(row.Size || 0), parcel: row.Parcel, subA: row['Sub A'], ownerName: row['Owner 1'] || 'Individual owner', owner2: row['Owner 2'], id1: row['ID-1'], id2: row['ID-2'], phone1: row['Phone 1'], phone2: row['Phone 2'], warning: row.Warning, propertyClass: row.Class, internalOwner: row['Int Owner'], note: row.Note, validated: row.Validated === 'TRUE', validationDate: row['Validation date'], ownerContract: row.OWNER_CONTRACT, invested: Number(row.Invested || 0), housewares: row.Housewares, agreement: row.Agreement, rentable: row.Rentable === 'Yes', representative: row.Representative, lawyer: row.Lawyer, pinuiStatus: row.Status, status: 'Vacant', rent: 0, tenantName: '', resident: '' }; }); return { buildings: [...buildingMap.values()], apartments }; };
const mergeMasterCsv = (current = { buildings: [], apartments: [] }, imported = { buildings: [], apartments: [] }) => { const buildings = [...(current.buildings || [])]; const idMap = new Map(); (imported.buildings || []).forEach((building) => { const existing = buildings.find((item) => item.street === building.street && item.streetNumber === building.streetNumber); if (existing) idMap.set(building.id, existing.id); else { buildings.push(building); idMap.set(building.id, building.id); } }); const apartments = [...(current.apartments || [])]; (imported.apartments || []).forEach((apartment) => { if (apartments.some((existing) => existing.apptId === apartment.apptId)) return; apartments.push({ ...apartment, buildingId: idMap.get(apartment.buildingId) || apartment.buildingId }); }); return { ...current, buildings, apartments }; };
const addressKey = (building) => `${String(building.street || '').trim()} ${String(building.streetNumber || '').trim()} ${String(building.entrance || 'main').trim()}`.replace(/\s+/g, ' ').trim();
const geocodeBuildings = async (buildings, onUpdate) => {
  const cached = new Map();
  const updated = [...buildings];
  for (let index = 0; index < updated.length; index += 1) {
    const building = updated[index];
    if (!building.street || !building.streetNumber) continue;
    const key = addressKey(building);
    if (building.geoSource === 'arcgis' && building.geocodeAddress === key) { cached.set(key, { lat: building.lat, lng: building.lng, geoSource: building.geoSource, geocodeAddress: key }); continue; }
    if (cached.has(key)) { updated[index] = { ...building, ...cached.get(key) }; onUpdate?.([...updated]); continue; }
    try {
      const query = `${key}, Be'er Sheva, Israel`;
      console.info('[Property geocode] Looking up:', query);
      const response = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&sourceCountry=ISR&singleLine=${encodeURIComponent(query)}`);
      const arcgis = await response.json();
      const candidate = arcgis.candidates?.[0];
      const results = candidate?.location ? [{ lat: candidate.location.y, lon: candidate.location.x }] : [];
      const source = 'arcgis';
      if (results[0]) {
        const location = { lat: Number(results[0].lat), lng: Number(results[0].lon), geoSource: source, geocodeAddress: key };
        cached.set(key, location);
        updated[index] = { ...building, ...location };
        console.info('[Property geocode] Found:', query, '=>', updated[index].lat, updated[index].lng, `(${source})`);
      } else {
        updated[index] = { ...building, geoSource: 'not-found' };
        console.warn('[Property geocode] No coordinates found:', query);
      }
      onUpdate?.([...updated]);
    } catch (error) { updated[index] = { ...building, geoSource: 'not-found' }; onUpdate?.([...updated]); console.warn('[Property geocode] Failed:', query, error); }
  }
  return updated;
};
const splitImportedBuildingsByEntrance = (imported) => {
  const buildings = [];
  const apartments = [];
  const groups = new Map();
  (imported.buildings || []).forEach((building) => {
    const rows = (imported.apartments || []).filter((apartment) => apartment.buildingId === building.id);
    rows.forEach((apartment) => {
      const entrance = apartment.entrance || 'main';
      const key = `${building.id}-${entrance}`;
      if (!groups.has(key)) {
        const next = { ...building, id: `csv-building-${buildings.length + 1}`, entrance, name: `${building.name} · Entrance ${entrance}`, units: 0, geoSource: undefined };
        groups.set(key, next);
        buildings.push(next);
      }
      const target = groups.get(key);
      target.units += 1;
      apartments.push({ ...apartment, buildingId: target.id });
    });
  });
  return { ...imported, buildings, apartments };
};
function App() {
  const [data, setData] = useState(hydrateData);
  const geocodingRef = React.useRef(false);
  const [geocodeQueue, setGeocodeQueue] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [selected, setSelected] = useState(data.buildings[0]);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [topSelected, setTopSelected] = useState(null);
  const loadMockData = () => { const mock = hydrateData(true); localStorage.setItem('blockwise-data', JSON.stringify(mock)); setData(mock); setSelected(mock.buildings[0]); setTopSelected(null); };
  const startEmpty = () => { const empty = { buildings: [], apartments: [], people: [], bills: [], events: [], maintenance: [] }; localStorage.setItem('blockwise-data', JSON.stringify(empty)); setData(empty); setSelected(undefined); setTopSelected(null); };
  useEffect(() => { if (!selected && data.buildings[0]) setSelected(data.buildings[0]); }, [data.buildings, selected]);
  useEffect(() => localStorage.setItem('blockwise-data', JSON.stringify(data)), [data]);
  useEffect(() => {
    const normalized = [];
    const seen = new Set();
    data.apartments.forEach((apartment) => {
      const number = normalizeApartmentNumber(apartment.number || apartment.appt);
      const key = `${apartment.buildingId}-${number || apartment.apptId || apartment.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      normalized.push({ ...apartment, number });
    });
    if (normalized.length !== data.apartments.length || normalized.some((item, index) => item.number !== data.apartments[index].number)) setData((current) => ({ ...current, apartments: normalized }));
  }, [data.apartments]);
  useEffect(() => {
    const buildings = data.buildings.map((building) => {
      const linked = data.apartments.filter((apartment) => apartment.buildingId === building.id);
      const units = linked.length;
      const floors = Math.max(0, ...linked.map((apartment) => Number(apartment.floor || 0)));
      return { ...building, units, floors };
    });
    if (buildings.some((building, index) => building.units !== data.buildings[index].units || building.floors !== data.buildings[index].floors)) setData((current) => ({ ...current, buildings }));
  }, [data.apartments, data.buildings]);
  useEffect(() => {
    let cancelled = false;
    if (geocodingRef.current) return undefined;
    const needsCoordinates = Boolean(geocodeQueue?.length);
    if (!needsCoordinates) return undefined;
    geocodingRef.current = true;
    geocodeBuildings(geocodeQueue, (buildings) => {
      if (!cancelled) setData((current) => ({ ...current, buildings }));
    }).then((buildings) => {
      if (!cancelled) { setData((current) => ({ ...current, buildings })); setGeocodeQueue(null); }
      geocodingRef.current = false;
    });
    return () => { cancelled = true; geocodingRef.current = false; };
  }, [geocodeQueue]);
  useEffect(() => {
    const grouped = new Map();
    const addPerson = (person) => {
      const name = String(person.name || '').trim();
      if (!name) return;
      const phone = String(person.phone || '').trim();
      const key = name.toLowerCase();
      const previous = grouped.get(key);
      grouped.set(key, previous ? { ...previous, phone: previous.phone || phone, email: previous.email || person.email || '', apartmentIds: [...new Set([...(previous.apartmentIds || []), ...(person.apartmentIds || [])])] } : { ...person, name, phone, apartmentIds: [...new Set(person.apartmentIds || [])] });
    };
    (data.people || []).forEach(addPerson);
    data.apartments.forEach((apartment) => {
      const primaryOwner = apartment.ownerName && apartment.ownerName !== 'Individual owner' ? apartment.ownerName : apartment.internalOwner;
      if (primaryOwner) addPerson({ id: `csv-owner-${apartment.id}`, name: primaryOwner, role: 'Owner', phone: apartment.phone1, apartmentIds: [apartment.id], notes: 'Imported from master CSV' });
      if (apartment.owner2) addPerson({ id: `csv-owner-${apartment.id}-2`, name: apartment.owner2, role: 'Owner', phone: apartment.phone2, apartmentIds: [apartment.id], notes: 'Imported from master CSV' });
    });
    const people = [...grouped.values()];
    if (JSON.stringify(people) !== JSON.stringify(data.people || [])) setData((current) => ({ ...current, people }));
  }, [data.apartments, data.people]);
  const apartments = data.apartments.filter((a) => a.buildingId === selected?.id);
  const occupied = data.apartments.filter((a) => a.status === 'Leased').length;
  const rent = data.apartments.reduce((s, a) => s + Number(a.rent || 0), 0);
  const saveRecord = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const kind = f.get('kind');
    const record = Object.fromEntries(f.entries());
    record.id = crypto.randomUUID();
    if (kind === 'building') {
      record.units = Number(record.units);
      record.floors = Number(record.floors);
      record.color = 'coral';
      record.x = 20 + Math.random() * 60;
      record.y = 20 + Math.random() * 55;
      setData({ ...data, buildings: [...data.buildings, record] });
    }
    if (kind === 'apartment') {
      record.rent = Number(record.rent || 0);
      record.buildingId = selected.id;
      setData({ ...data, apartments: [...data.apartments, record] });
    }
    if (kind === 'person') {
      record.apartmentIds = [];
      setData({ ...data, people: [...(data.people || []), record] });
    }
    if (kind === 'maintenance') {
      record.cost = Number(record.cost || 0);
      record.buildingId = selected.id;
      setData({ ...data, maintenance: [...data.maintenance, record] });
    }
    setModal(null);
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'blockwise-backup.json';
    a.click();
  };
  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setData(JSON.parse(r.result));
    r.readAsText(file);
  };
  const importCsv = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const imported = splitImportedBuildingsByEntrance(parseMasterCsv(String(reader.result || ''))); if (!imported || !Array.isArray(imported.buildings) || !Array.isArray(imported.apartments)) throw new Error('CSV did not produce building and apartment records'); const current = data && Array.isArray(data.buildings) && Array.isArray(data.apartments) ? data : hydrateData(); const nextData = mergeMasterCsv(current, imported); const normalized = { ...nextData, buildings: nextData.buildings || [], apartments: nextData.apartments || [], people: nextData.people || [], bills: nextData.bills || [], events: nextData.events || [], maintenance: nextData.maintenance || [] }; localStorage.setItem('blockwise-data', JSON.stringify(normalized)); setData(normalized); setGeocodeQueue(normalized.buildings); } catch (error) { console.error('CSV import failed', error); window.alert(`Could not import CSV: ${error.message}`); } }; reader.onerror = () => window.alert('Could not read this CSV file. Save it as UTF-8 CSV and try again.'); reader.readAsText(file, 'UTF-8'); e.target.value = ''; };
  const visibleBuildings = data.buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.area.toLowerCase().includes(search.toLowerCase())
  );
  const topResults = search.trim()
    ? [
        ...data.buildings
          .filter((b) =>
            `${b.name} ${b.address || ''} ${b.area || ''}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((item) => ({ type: 'building', item })),
        ...data.apartments
          .filter((a) =>
            `${a.number} ${a.ownerName || ''} ${a.tenantName || ''}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((item) => ({ type: 'apartment', item })),
        ...data.people
          .filter((person) => `${person.name || ''} ${person.phone || ''} ${person.email || ''}`.toLowerCase().includes(search.toLowerCase()))
          .map((item) => ({ type: 'person', item })),
      ].slice(0, 10)
    : [];
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="brandmark">B</div>
          <div>
            blockwise<span>PROPERTY OPS</span>
          </div>
        </div>
        <div className="workspace">
          <small>WORKSPACE</small>
          <div className="select">
            Be'er Sheva <b>⌄</b>
          </div>
        </div>
        <nav>
          {[
            ['Overview', '▦'],
            ['Buildings', '⌂'],
            ['Apartments', '▥'],
            ['Finance', '₪'],
            ['Maintenance', '⚒'],
            ['Reports', '◒'],
            ['People', '◉'],
            ['Pinui-Binui', '↗'],
          ].map(([label, icon]) => (
            <button
              className={tab === label ? 'active' : ''}
              onClick={() => setTab(label)}
              key={label}
            >
              <i>{icon}</i>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sync">
            <span className="dot" />{' '}
            <div>
              <b>Local data saved</b>
              <small>Ready for Supabase sync</small>
            </div>
          </div>
          <div className="user">
            <div className="avatar">EL</div>
            <div>
              <b>Effie Landau</b>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <div className="crumb">WORKSPACE / {tab.toUpperCase()}</div>
            <h1>{tab === 'Overview' ? 'Good morning, Effie' : tab}</h1>
            <p>
              {tab === 'Overview'
                ? 'Here is what is happening across your properties.'
                : 'Manage your property records and operations.'}
            </p>
          </div>
          <div className="actions top-search-wrap">
            <button className="outline small" onClick={loadMockData}>Load mock data</button>
            <button className="outline small" onClick={startEmpty}>Start empty</button>
            <label className="outline small csv-import-label">Upload CSV<input type="file" accept=".csv,text/csv" onChange={importCsv} /></label>
            <input
              className="search"
              placeholder="Search buildings or apartments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {topResults.length > 0 && (
              <div className="top-search-results">
                {topResults.map(({ type, item }) => (
                  <button
                    key={`${type}-${item.id}`}
                    onClick={() => {
                      setSearch('');
                      if (type === 'building') setSelected(item);
                      if (type === 'apartment') setSelected(data.buildings.find((building) => building.id === item.buildingId));
                      setTopSelected(type === 'person' ? null : { type, item });
                    }}
                  >
                    {type === 'person' ? (
                      <><b>{item.name}</b><small>{item.role} · {item.phone || 'No phone'} · {item.email || 'No email'}</small></>
                    ) : type === 'building' ? (
                      <>
                        <b>{item.name}</b>
                        <small>{item.address || item.area} · Building</small>
                      </>
                    ) : (
                      <>
                        <b>{item.number}</b>
                        <small>
                          {data.buildings.find((building) => building.id === item.buildingId)?.name}{' '}
                          · Apartment
                        </small>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>
        {geocodeQueue && <div className="global-geocode-status"><span className="spinner" /> Looking up building addresses and placing map pins…</div>}
        {tab === 'Overview' ? (
          <>
            <section className="metrics">
              <Metric label="Properties" value={data.buildings.length} note="across Be'er Sheva" />
              <Metric
                label="Apartments"
                value={data.apartments.length || 84}
                note={`${occupied} occupied`}
              />
              <Metric
                label="Occupancy"
                value={
                  data.apartments.length
                    ? `${Math.round((occupied / data.apartments.length) * 100)}%`
                    : '90.5%'
                }
                note="calculated live"
                tone="green"
              />
              <Metric
                label="Open issues"
                value={data.maintenance.filter((m) => m.status === 'Open').length}
                note="need attention"
                tone="orange"
              />
            </section>
            <section className="grid">
              <RealMap buildings={visibleBuildings} selected={selected} setSelected={setSelected} geocoding={Boolean(geocodeQueue)} />
              <Detail
                building={selected}
                apartments={apartments}
                rent={rent}
                onAdd={() => setModal('apartment')}
                onOpen={() => setTopSelected({ type: 'building', item: selected })}
              />
            </section>
            <section className="bottom-grid">
              <ApartmentTable apartments={apartments} />
              <Activity data={data} onAdd={() => setModal('maintenance')} />
            </section>
          </>
        ) : tab === 'Pinui-Binui' ? (
          <PinuiUnified data={data} />
        ) : tab === 'Finance' ? (
          <FinanceView data={data} />
        ) : tab === 'Maintenance' ? (
          <MaintenanceView
            data={data}
            onApartment={(apartment) => {
              setSelected(apartment);
            }}
          />
        ) : (
          <ListView
            tab={tab}
            data={data}
            selected={selected}
            setSelected={setSelected}
            onAdd={() =>
              setModal(
                tab === 'Buildings'
                  ? 'building'
                  : tab === 'Apartments'
                    ? 'apartment'
                    : tab === 'People'
                      ? 'person'
                      : 'maintenance'
              )
            }
            exportData={exportData}
            importData={importData}
            importCsv={importCsv}
          />
        )}{' '}
        {topSelected && (
          <div className="drawer-backdrop" onClick={() => setTopSelected(null)}>
            <div onClick={(event) => event.stopPropagation()}>
              {topSelected.type === 'building' ? (
                <BuildingDrawer
                  building={topSelected.item}
                  apartments={data.apartments}
                  onApartment={(apartment) =>
                    setTopSelected({ type: 'apartment', item: apartment })
                  }
                  onClose={() => setTopSelected(null)}
                />
              ) : (
                <ApartmentSidePanel
                  apartment={topSelected.item}
                  buildings={data.buildings}
                  people={data.people}
                  data={data}
                  onClose={() => setTopSelected(null)}
                />
              )}
            </div>
          </div>
        )}
        {modal && (
          <Modal
            type={modal}
            buildings={data.buildings}
            onClose={() => setModal(null)}
            onSubmit={saveRecord}
          />
        )}
      </main>
    </div>
  );
}
const Metric = ({ label, value, note, tone }) => (
  <div className="metric">
    <span>{label}</span>
    <strong>{value}</strong>
    <small className={tone}>{note}</small>
  </div>
);
function LegacyMap({ buildings, selected, setSelected }) {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [drag, setDrag] = useState(null);
  const startDrag = (event) => {
    if (event.target.closest('.pin')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: event.clientX, y: event.clientY, startX: view.x, startY: view.y });
  };
  const moveMap = (event) => {
    if (!drag) return;
    setView((current) => ({
      ...current,
      x: drag.startX + event.clientX - drag.x,
      y: drag.startY + event.clientY - drag.y,
    }));
  };
  const zoom = (amount) =>
    setView((current) => ({
      ...current,
      zoom: Math.min(1.8, Math.max(0.7, current.zoom + amount)),
    }));
  return (
    <div className="panel map-panel">
      <div className="panel-head">
        <div>
          <h2>Property map</h2>
          <p>Tap a building to view its details</p>
        </div>
        <span className="filter">⌖ All areas</span>
      </div>
      <div
        className="map"
        onPointerDown={startDrag}
        onPointerMove={moveMap}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
      >
        <div className="map-toolbar">
          <span>BE'ER SHEVA · PROPERTY AREA</span>
          <button onClick={() => setView({ x: 0, y: 0, zoom: 1 })}>Reset</button>
          <button onClick={() => zoom(0.1)}>+</button>
          <button onClick={() => zoom(-0.1)}>−</button>
        </div>
        <div
          className="map-canvas"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
        >
          <div className="neighborhood-zone">
            <span>YOUR PROPERTY AREA</span>
          </div>
          <div className="road r1" />
          <div className="road r2" />
          <div className="road r3" />
          <div className="road r4" />
          <span className="map-street street-a">RAGER ST.</span>
          <span className="map-street street-b">DERECH HEBRON</span>
          {buildings.map((b) => (
            <button
              key={b.id}
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
              className={`pin ${b.color} ${selected?.id === b.id ? 'chosen' : ''}`}
              onClick={() => setSelected(b)}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <b>⌂ {b.name}</b>
              <small>{b.units} apartments</small>
            </button>
          ))}
        </div>
      </div>
      <div className="map-legend">● Residential　● Mixed use　⊙ {buildings.length} properties</div>
    </div>
  );
}
function Detail({ building, apartments, rent, onAdd, onOpen }) {
  if (!building) return <div className="panel detail-panel">No buildings yet.</div>;
  const className = (apartments.find((a) => a.propertyClass) || {}).propertyClass;
  const counts = apartments.reduce((result, apartment) => {
    const value = String(apartment.propertyClass || 'Owned').toLowerCase();
    const key = value.includes('amidar') ? 'Amidar' : value.includes('target') ? 'Target' : 'Owned';
    result[key] += 1;
    return result;
  }, { Owned: 0, Amidar: 0, Target: 0 });
  const ownedGroups = apartments.filter((a) => String(a.propertyClass || 'Owned').toLowerCase().includes('owned')).reduce((result, apartment) => {
    const owner = String(apartment.internalOwner || apartment.ownerName || '').toLowerCase();
    const key = owner.includes('hd') || owner.includes('zw') ? 'HD / ZW' : owner.includes('ka') || owner.includes('rc') ? 'KA / RC' : owner.includes('emalleh') || owner.includes('emalle') ? 'Emalleh' : null;
    if (key) result[key] += 1;
    return result;
  }, { 'HD / ZW': 0, 'KA / RC': 0, Emalleh: 0 });
  const pct = (value) => `${Math.round((value / Math.max(apartments.length, 1)) * 100)}%`;
  const maxFloor = Math.max(Number(building.floors || 0), ...apartments.map((apartment) => Number(apartment.floor || 0)), 0);
  return (
    <div className="panel detail-panel">
      <div className="eyebrow">SELECTED PROPERTY</div>
      <button className="property-title" onClick={onOpen}><h2>{building.name} <small className="coordinates-title">{coordinatesLabel(building)}</small></h2></button>
      <p className="muted">{building.area} · Be'er Sheva</p>
      <div className="property-stats">
        <div>
          <b>{building.units}</b>
          <small>Apartments</small>
        </div>
        <div>
            <b>{maxFloor}</b>
          <small>Floors</small>
        </div>
        <div>
          <b>
            {apartments.filter((a) => a.status === 'Leased').length}/{building.units}
          </b>
          <small>Occupied</small>
        </div>
      </div>
      <div className="detail-row">
        <span>Zoning</span>
        <b>{building.zone}</b>
      </div>
      <div className="detail-row">
        <span>Monthly rent roll</span>
        <b>{money(rent)}</b>
      </div>
      <div className="detail-row">
        <span>Records</span>
        <b>{apartments.length} loaded</b>
      </div>
      <div className="ownership-stats"><b>Ownership / Pinui-Binui mix</b><div className="ownership-bars">{Object.entries(counts).map(([key, value]) => <div className={`ownership-bar-row ${key.toLowerCase()}`} key={key}><span><strong>{key}</strong><em>{value} · {pct(value)}</em></span><i style={{ width: pct(value) }} /></div>)}</div><small>Owned breakdown</small><div className="owned-breakdown">{Object.entries(ownedGroups).map(([key, value]) => <span key={key}><strong>{key}</strong> {value}</span>)}</div></div>
      <button className="outline" onClick={onAdd}>
        + Add apartment <span>→</span>
      </button>
    </div>
  );
}
function ApartmentTable({ apartments }) {
  return (
    <div className="panel table-panel">
      <div className="panel-head">
        <div>
          <h2>Apartment status</h2>
          <p>Selected property · {apartments.length} loaded</p>
        </div>
      </div>
      <div className="table">
        <div className="tr th">
          <span>UNIT</span>
          <span>RESIDENT / STATUS</span>
          <span>RENT</span>
          <span>DATE</span>
        </div>
        {apartments.map((a) => (
          <div className="tr" key={a.id}>
            <b>{a.number || a.appt || a.apptId || '—'}</b>
            <span>
              <strong>{a.resident || '—'}</strong>
              <small className={`status ${String(a.status || 'Unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                {a.status || 'Unknown'}
              </small>
            </span>
            <b>{money(a.rent || 0)}</b>
            <span className="muted">{a.due || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Activity({ data, onAdd }) {
  return (
    <div className="panel activity">
      <div className="panel-head">
        <div>
          <h2>Recent activity</h2>
          <p>Track the work that matters</p>
        </div>
        <button className="text-btn" onClick={onAdd}>
          + Log maintenance
        </button>
      </div>
      {data.maintenance
        .slice(-3)
        .reverse()
        .map((m) => (
          <div className="activity-row" key={m.id}>
            <div className="activity-icon orange">⚒</div>
            <div>
              <b>{m.title}</b>
              <small>
                {m.status} · {money(m.cost)}
              </small>
            </div>
            <time>{m.date}</time>
          </div>
        ))}
      {!data.maintenance.length && <p className="muted">No maintenance records yet.</p>}
    </div>
  );
}
function LegacyRenewalView({ data }) {
  const reps = {
    b1: { name: 'Maya Cohen', status: 'Confirmed' },
    b2: { name: 'Needed', status: 'Find representative' },
    b3: { name: 'Roni Gil', status: 'Confirmed' },
    b4: { name: 'Needed', status: 'Contact owners' },
    b5: { name: 'Amit Ronen', status: 'Confirmed' },
    b6: { name: 'Needed', status: 'Waiting for nomination' },
    b7: { name: 'Needed', status: 'Contact owners' },
    b8: { name: 'Needed', status: 'Find representative' },
  };
  const getStats = (building) => {
    const apartments = data.apartments.filter((apartment) => apartment.buildingId === building.id);
    const signed = apartments.filter((apartment) =>
      ['Amidar', 'HD'].includes(apartment.ownerName)
    ).length;
    const no = apartments.filter((apartment) => apartment.ownerName === 'MR').length;
    const pending = Math.max(0, apartments.length - signed - no);
    const owners = [
      ...new Set(
        apartments
          .filter((apartment) => !['Amidar', 'HD'].includes(apartment.ownerName))
          .map((apartment) => apartment.ownerName || 'Individual owner')
      ),
    ];
    return {
      apartments,
      signed,
      no,
      pending,
      owners,
      percent: apartments.length ? Math.round((signed / apartments.length) * 100) : 0,
    };
  };
  return (
    <section className="renewal-view">
      <div className="renewal-header">
        <div>
          <div className="eyebrow">URBAN RENEWAL TRACKER</div>
          <h2>Pinui-Binui readiness</h2>
          <p>Track owner signatures and representatives across the portfolio.</p>
        </div>
        <div className="renewal-summary">
          <b>{data.buildings.reduce((sum, building) => sum + getStats(building).signed, 0)}</b>
          <span>signed apartments</span>
        </div>
      </div>
      <div className="renewal-legend">
        <span>
          <i className="signed-key" />
          Signed
        </span>
        <span>
          <i className="no-key" />
          Said no
        </span>
        <span>
          <i className="pending-key" />
          Still needed
        </span>
      </div>
      <div className="renewal-grid">
        {data.buildings.map((building) => {
          const stats = getStats(building);
          const rep = reps[building.id] || { name: 'Needed', status: 'Find representative' };
          return (
            <article className="renewal-card" key={building.id}>
              <div className="renewal-card-head">
                <div>
                  <h3>{building.name}</h3>
                  <p>
                    {building.address || building.area} · {building.units} apartments
                  </p>
                </div>
                <strong>{stats.percent}%</strong>
              </div>
              <div className="signature-bar">
                <i
                  className="signed-bar"
                  style={{ width: `${(stats.signed / Math.max(building.units, 1)) * 100}%` }}
                />
                <i
                  className="no-bar"
                  style={{ width: `${(stats.no / Math.max(building.units, 1)) * 100}%` }}
                />
              </div>
              <div className="signature-counts">
                <span>
                  <b>{stats.signed}</b> signed
                </span>
                <span>
                  <b>{stats.no}</b> said no
                </span>
                <span>
                  <b>{stats.pending}</b> pending
                </span>
              </div>
              <div className={`representative ${rep.name === 'Needed' ? 'needed' : 'ready'}`}>
                <span>Representative</span>
                <b>{rep.name}</b>
                <small>{rep.status}</small>
              </div>
              <div className="outreach">
                <b>Owner outreach</b>
                {stats.owners.slice(0, 4).map((owner) => (
                  <span key={owner}>
                    {owner} · {['Amidar', 'HD'].includes(owner) ? 'signed' : 'contact needed'}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function RenewalView({ data }) {
  const [status, setStatus] = useState({});
  const update = (id, key, value) =>
    setStatus((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));
  const getRows = (building) =>
    data.apartments.filter((apartment) => apartment.buildingId === building.id);
  return (
    <section className="renewal-register">
      <div className="eyebrow">OWNER OUTREACH REGISTER</div>
      <h2>Pinui-Binui owner checklist</h2>
      <p className="muted">
        Track every owner, signature, contact attempt, and scheduled signing date.
      </p>
      {data.buildings.map((building) => (
        <div className="renewal-building" key={building.id}>
          <div className="renewal-building-head">
            <div>
              <h3>{building.name}</h3>
              <span>{building.address || building.area}</span>
            </div>
            <b>
              {
                getRows(building).filter(
                  (apartment) =>
                    ['Amidar', 'HD'].includes(apartment.ownerName) ||
                    status[apartment.id]?.signature === 'Signed'
                ).length
              }{' '}
              / {getRows(building).length} signed
            </b>
          </div>
          <div className="owner-checklist">
            {getRows(building).map((apartment) => {
              const row = status[apartment.id] || {};
              const known = apartment.ownerName && apartment.ownerName !== 'Individual owner';
              return (
                <div className="owner-row" key={apartment.id}>
                  <div>
                    <b>{apartment.number}</b>
                    <small>{known ? apartment.ownerName : 'Owner unknown — find owner'}</small>
                  </div>
                  <select
                    value={row.contact || (known ? 'Not contacted' : 'Find owner')}
                    onChange={(event) => update(apartment.id, 'contact', event.target.value)}
                  >
                    <option>Not contacted</option>
                    <option>Contacted</option>
                    <option>Trying to reach</option>
                    <option>Find owner</option>
                  </select>
                  <select
                    value={
                      row.signature ||
                      (['Amidar', 'HD'].includes(apartment.ownerName) ? 'Signed' : 'Not signed')
                    }
                    onChange={(event) => update(apartment.id, 'signature', event.target.value)}
                  >
                    <option>Not signed</option>
                    <option>Signed</option>
                    <option>Said no</option>
                    <option>Trying to nail down</option>
                  </select>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={row.scheduled || false}
                      onChange={(event) => update(apartment.id, 'scheduled', event.target.checked)}
                    />{' '}
                    Signing scheduled
                  </label>
                  <input
                    type="date"
                    value={row.date || ''}
                    onChange={(event) => update(apartment.id, 'date', event.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
function RenewalDashboard({ data }) {
  const [query, setQuery] = useState('');
  const normalized = query.toLowerCase();
  const filteredBuildings = data.buildings.filter(
    (building) =>
      `${building.name} ${building.address || ''} ${building.area || ''}`
        .toLowerCase()
        .includes(normalized) ||
      data.apartments.some(
        (apartment) =>
          apartment.buildingId === building.id &&
          `${apartment.number} ${apartment.ownerName || ''}`.toLowerCase().includes(normalized)
      )
  );
  const filteredData = {
    ...data,
    buildings: filteredBuildings,
    apartments: data.apartments.filter((apartment) =>
      filteredBuildings.some((building) => building.id === apartment.buildingId)
    ),
  };
  return (
    <div className="renewal-dashboard">
      <div className="renewal-search">
        <div>
          <h2>Pinui-Binui status</h2>
          <p>Search by building, apartment, or owner.</p>
        </div>
        <input
          className="search"
          placeholder="Search Pinui-Binui..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <LegacyRenewalView data={filteredData} />
      <RenewalView data={filteredData} />
    </div>
  );
}
function RenewalBreakdown({ data }) {
  return (
    <div className="renewal-breakdown">
      {data.buildings.map((building) => {
        const apartments = data.apartments.filter(
          (apartment) => apartment.buildingId === building.id
        );
        const count = (owner) =>
          apartments.filter((apartment) => apartment.ownerName === owner).length;
        const signed = apartments.filter((apartment) =>
          ['Amidar', 'HD'].includes(apartment.ownerName)
        ).length;
        return (
          <div className="breakdown-card" key={building.id}>
            <b>{building.name}</b>
            <div>
              <span className="amidar">
                Amidar {Math.round((count('Amidar') / Math.max(apartments.length, 1)) * 100)}%
              </span>
              <span className="hd">
                HD {Math.round((count('HD') / Math.max(apartments.length, 1)) * 100)}%
              </span>
              <span className="signed">
                Signed {Math.round((signed / Math.max(apartments.length, 1)) * 100)}%
              </span>
              <span className="awaiting">
                Awaiting{' '}
                {Math.round(((apartments.length - signed) / Math.max(apartments.length, 1)) * 100)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function PinuiUnified({ data }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState({});
  const [rep, setRep] = useState({});
  const update = (id, key, value) =>
    setStatus((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));
  const filtered = data.buildings.filter(
    (building) =>
      `${building.name} ${building.address || ''}`.toLowerCase().includes(query.toLowerCase()) ||
      data.apartments.some(
        (apartment) =>
          apartment.buildingId === building.id &&
          `${apartment.number} ${apartment.ownerName || ''}`
            .toLowerCase()
            .includes(query.toLowerCase())
      )
  );
  return (
    <section className="pinui-unified">
      <div className="pinui-header">
        <div>
          <div className="eyebrow">URBAN RENEWAL WORKSPACE</div>
          <h2>Pinui-Binui status</h2>
          <p>Progress, representatives, and owner checklist in one view.</p>
        </div>
        <input
          className="search"
          placeholder="Search building, apartment, owner..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="pinui-legend">
        <span>
          <i className="signed-key" />
          Signed
        </span>
        <span>
          <i className="no-key" />
          Said no
        </span>
        <span>
          <i className="pending-key" />
          Awaiting
        </span>
        <span>
          <i className="amidar-key" />
          Amidar
        </span>
        <span>
          <i className="hd-key" />
          HD
        </span>
      </div>
      <div className="pinui-building-grid">
        {filtered.map((building) => {
          const apartments = data.apartments.filter(
            (apartment) => apartment.buildingId === building.id
          );
          const signed = apartments.filter(
            (apartment) =>
              ['Amidar', 'HD'].includes(apartment.ownerName) ||
              status[apartment.id]?.signature === 'Signed'
          ).length;
          const no = apartments.filter(
            (apartment) => status[apartment.id]?.signature === 'Said no'
          ).length;
          const awaiting = apartments.length - signed - no;
          return (
            <article className="pinui-building-card" key={building.id}>
              <header>
                <div>
                  <h3>{building.name}</h3>
                  <p>
                    {building.address || building.area} · {apartments.length} apartments
                  </p>
                </div>
                <strong>{Math.round((signed / Math.max(apartments.length, 1)) * 100)}%</strong>
              </header>
              <div className="pinui-progress">
                <i
                  className="progress-signed"
                  style={{ width: `${(signed / Math.max(apartments.length, 1)) * 100}%` }}
                />
                <i
                  className="progress-no"
                  style={{ width: `${(no / Math.max(apartments.length, 1)) * 100}%` }}
                />
              </div>
              <div className="pinui-counts">
                <span>{signed} signed</span>
                <span>{no} said no</span>
                <span>{awaiting} awaiting</span>
              </div>
              <div className="pinui-rep">
                <label>Representative</label>
                <select
                  value={rep[building.id] || ''}
                  onChange={(event) =>
                    setRep((current) => ({ ...current, [building.id]: event.target.value }))
                  }
                >
                  <option value="">Still looking for representative</option>
                  {(data.people || [])
                    .filter((person) => person.role === 'Owner' || person.role === 'Tenant')
                    .map((person) => (
                      <option key={person.id}>{person.name}</option>
                    ))}
                </select>
                <small>
                  {rep[building.id] ? 'Representative selected' : 'Contact owners to nominate one'}
                </small>
              </div>
              <div className="pinui-checklist">
                <div className="pinui-checklist-head">
                  <b>Owner checklist</b>
                  <span>Contact · signature · signing date</span>
                </div>
                {apartments.map((apartment) => {
                  const row = status[apartment.id] || {};
                  const known = apartment.ownerName && apartment.ownerName !== 'Individual owner';
                  return (
                    <div className="pinui-owner-row" key={apartment.id}>
                      <div>
                        <b>{apartment.number}</b>
                        <small className={!known ? 'unknown-owner' : ''}>
                          {known ? apartment.ownerName : 'Owner unknown — find owner'}
                        </small>
                      </div>
                      <select
                        value={row.contact || (known ? 'Not contacted' : 'Find owner')}
                        onChange={(event) => update(apartment.id, 'contact', event.target.value)}
                      >
                        <option>Not contacted</option>
                        <option>Contacted</option>
                        <option>Trying to reach</option>
                        <option>Find owner</option>
                      </select>
                      <select
                        value={
                          row.signature ||
                          (['Amidar', 'HD'].includes(apartment.ownerName) ? 'Signed' : 'Not signed')
                        }
                        onChange={(event) => update(apartment.id, 'signature', event.target.value)}
                      >
                        <option>Not signed</option>
                        <option>Signed</option>
                        <option>Said no</option>
                        <option>Trying to nail down</option>
                      </select>
                      <label>
                        <input
                          type="checkbox"
                          checked={row.scheduled || false}
                          onChange={(event) =>
                            update(apartment.id, 'scheduled', event.target.checked)
                          }
                        />{' '}
                        scheduled
                      </label>
                      <input
                        type="date"
                        value={row.date || ''}
                        onChange={(event) => update(apartment.id, 'date', event.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function LegacyFinanceView({ data }) {
  const [range, setRange] = useState('6 months');
  const [group, setGroup] = useState('Building');
  const [chart, setChart] = useState('Net cash flow');
  const months =
    range === '12 months'
      ? ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
      : ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const apartments = data.apartments || [];
  const bills = data.bills || [];
  const maintenance = data.maintenance || [];
  const monthly = months.map((month, index) => {
    const income =
      apartments.reduce(
        (sum, apartment) => sum + (apartment.status === 'Leased' ? Number(apartment.rent || 0) : 0),
        0
      ) *
      (0.91 + index * 0.018);
    const costs =
      ((bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0) +
        maintenance.reduce((sum, item) => sum + Number(item.cost || 0), 0)) /
        (range === '12 months' ? 2 : 1)) *
      (0.88 + index * 0.025);
    return {
      month,
      income: Math.round(income),
      costs: Math.round(costs),
      net: Math.round(income - costs),
    };
  });
  const totalIncome = monthly.reduce((sum, item) => sum + item.income, 0);
  const totalCosts = monthly.reduce((sum, item) => sum + item.costs, 0);
  const occupancy = apartments.length
    ? Math.round((apartments.filter((a) => a.status === 'Leased').length / apartments.length) * 100)
    : 0;
  const maxValue = Math.max(...monthly.map((item) => Math.max(item.income, item.costs)));
  const categories = ['Water', 'Electricity', 'Vaad', 'Arnona', 'Gas', 'Maintenance']
    .map((category) => ({
      category,
      amount:
        category === 'Maintenance'
          ? maintenance.reduce((sum, item) => sum + Number(item.cost || 0), 0)
          : bills
              .filter((bill) => bill.category === category)
              .reduce((sum, bill) => sum + Number(bill.amount || 0), 0),
    }))
    .sort((a, b) => b.amount - a.amount);
  const groups =
    group === 'Building'
      ? data.buildings.map((building) => ({
          name: building.name,
          value: apartments
            .filter((a) => a.buildingId === building.id)
            .reduce((sum, a) => sum + Number(a.rent || 0), 0),
        }))
      : apartments
          .slice(0, 12)
          .map((apartment) => ({ name: apartment.number, value: Number(apartment.rent || 0) }));
  const projection = Math.round(
    apartments.reduce((sum, apartment) => sum + Number(apartment.rent || 0), 0) * 1.08
  );
  const expiringSoon = apartments.filter((apartment) => apartment.status === 'Leased').slice(0, 4);
  const vacant = apartments.filter((apartment) => apartment.status === 'Vacant');
  const startingSoon = apartments
    .filter((apartment) => apartment.status === 'On market')
    .slice(0, 4);
  const unleasable = apartments
    .filter((apartment, index) => apartment.status === 'Vacant' && index % 3 === 0)
    .slice(0, 4);
  const buildingName = (apartment) =>
    data.buildings.find((building) => building.id === apartment.buildingId)?.name ||
    'Unknown building';
  return (
    <section className="finance-dashboard">
      <div className="finance-controls">
        <div>
          <h2>Portfolio finance</h2>
          <p>Income, costs, and rental growth across all properties</p>
        </div>
        <div>
          <button
            className={range === '6 months' ? 'control active' : 'control'}
            onClick={() => setRange('6 months')}
          >
            6 months
          </button>
          <button
            className={range === '12 months' ? 'control active' : 'control'}
            onClick={() => setRange('12 months')}
          >
            12 months
          </button>
        </div>
      </div>
      <div className="finance-kpis">
        <div className="finance-kpi income">
          <span>Projected monthly rent</span>
          <b>{money(projection)}</b>
          <small>↑ 8% next period</small>
        </div>
        <div className="finance-kpi expense">
          <span>Average monthly costs</span>
          <b>{money(Math.round(totalCosts / months.length))}</b>
          <small>utilities + maintenance</small>
        </div>
        <div className="finance-kpi net">
          <span>Net operating income</span>
          <b>{money(totalIncome - totalCosts)}</b>
          <small>{occupancy}% portfolio occupancy</small>
        </div>
        <div className="finance-kpi neutral">
          <span>Rent collection gap</span>
          <b>
            {money(
              apartments
                .filter((a) => a.status !== 'Leased')
                .reduce((sum, a) => sum + Number(a.rent || 0), 0)
            )}
          </b>
          <small>vacant / on market</small>
        </div>
      </div>
      <div className="finance-grid">
        <div className="panel finance-chart">
          <div className="panel-head">
            <div>
              <h2>{chart}</h2>
              <p>Interactive historical view · click a metric</p>
            </div>
            <div>
              <button
                className={chart === 'Net cash flow' ? 'chart-toggle active' : 'chart-toggle'}
                onClick={() => setChart('Net cash flow')}
              >
                Net
              </button>
              <button
                className={chart === 'Income vs costs' ? 'chart-toggle active' : 'chart-toggle'}
                onClick={() => setChart('Income vs costs')}
              >
                Income / costs
              </button>
            </div>
          </div>
          <div className="chart-area">
            {monthly.map((item) => (
              <div className="chart-column" key={item.month}>
                <div className="bars">
                  {chart === 'Income vs costs' ? (
                    <>
                      <i
                        className="bar income-bar"
                        style={{ height: `${(item.income / maxValue) * 155}px` }}
                        title={money(item.income)}
                      />
                      <i
                        className="bar cost-bar"
                        style={{ height: `${(item.costs / maxValue) * 155}px` }}
                        title={money(item.costs)}
                      />
                    </>
                  ) : (
                    <i
                      className="bar net-bar"
                      style={{ height: `${(Math.abs(item.net) / maxValue) * 155}px` }}
                      title={money(item.net)}
                    />
                  )}
                </div>
                <span>{item.month}</span>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span>
              <i className="income-dot" />
              Income
            </span>
            <span>
              <i className="cost-dot" />
              Costs
            </span>
            <span>
              <i className="net-dot" />
              Net
            </span>
          </div>
        </div>
        <div className="panel finance-chart">
          <div className="panel-head">
            <div>
              <h2>Costs by category</h2>
              <p>Portfolio spend</p>
            </div>
          </div>
          <div className="category-list">
            {categories.map((item) => (
              <div className="category-row" key={item.category}>
                <span>{item.category}</span>
                <div>
                  <i
                    style={{
                      width: `${Math.max(5, (item.amount / Math.max(categories[0].amount, 1)) * 100)}%`,
                    }}
                  />
                </div>
                <b>{money(item.amount)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="finance-grid">
        <div className="panel finance-chart">
          <div className="panel-head">
            <div>
              <h2>Rent roll by {group.toLowerCase()}</h2>
              <p>Compare income concentration</p>
            </div>
            <div>
              <button
                className={group === 'Building' ? 'chart-toggle active' : 'chart-toggle'}
                onClick={() => setGroup('Building')}
              >
                Building
              </button>
              <button
                className={group === 'Apartment' ? 'chart-toggle active' : 'chart-toggle'}
                onClick={() => setGroup('Apartment')}
              >
                Apartment
              </button>
            </div>
          </div>
          <div className="horizontal-bars">
            {groups.map((item) => (
              <div className="horizontal-row" key={item.name}>
                <span>{item.name}</span>
                <div>
                  <i
                    style={{
                      width: `${(item.value / Math.max(...groups.map((g) => g.value), 1)) * 100}%`,
                    }}
                  />
                </div>
                <b>{money(item.value)}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="panel finance-chart projection-card">
          <div className="eyebrow">RENTAL OUTLOOK</div>
          <h2>Projected rent growth</h2>
          <p className="muted">Based on current rent roll and an 8% annual growth assumption.</p>
          <div className="projection-value">
            {money(projection)}
            <small>next 12-month run rate</small>
          </div>
          <div className="projection-line">
            <span>Current</span>
            <i />
            <b>+8%</b>
            <i />
            <span>Projected</span>
          </div>
          <div className="finance-totals">
            <span>
              Current annual <b>{money(totalIncome)}</b>
            </span>
            <span>
              Projected annual <b>{money(projection * 12)}</b>
            </span>
            <span>
              Growth <b>8%</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
function FinanceView({ data }) {
  const apartments = data.apartments || [];
  const expiringSoon = apartments.filter((apartment) => apartment.status === 'Leased').slice(0, 4);
  const vacant = apartments.filter((apartment) => apartment.status === 'Vacant');
  const startingSoon = apartments
    .filter((apartment) => apartment.status === 'On market')
    .slice(0, 4);
  const unleasable = apartments
    .filter((apartment, index) => apartment.status === 'Vacant' && index % 3 === 0)
    .slice(0, 4);
  const buildingName = (apartment) =>
    data.buildings.find((building) => building.id === apartment.buildingId)?.name ||
    'Unknown building';
  return (
    <>
      <section className="leasing-health">
        <div className="leasing-health-head">
          <div>
            <h2>Leasing health</h2>
            <p>Operational signals for the next leasing cycle</p>
          </div>
          <span>Live from apartment records</span>
        </div>
        <div className="leasing-cards">
          <div className="lease-card expiring">
            <b>{expiringSoon.length}</b>
            <span>Leases expiring soon</span>
            <small>Review renewals and notices</small>
          </div>
          <div className="lease-card vacant">
            <b>{vacant.length}</b>
            <span>Vacant apartments</span>
            <small>
              Income gap:{' '}
              {money(vacant.reduce((sum, apartment) => sum + Number(apartment.rent || 0), 0))}
            </small>
          </div>
          <div className="lease-card starting">
            <b>{startingSoon.length}</b>
            <span>Leases starting soon</span>
            <small>Prepare handovers and deposits</small>
          </div>
          <div className="lease-card poor">
            <b>{unleasable.length}</b>
            <span>Needs investment review</span>
            <small>Unleasable / low-return candidates</small>
          </div>
        </div>
        <div className="leasing-watchlist">
          {[...expiringSoon.slice(0, 2), ...vacant.slice(0, 1), ...unleasable.slice(0, 1)].map(
            (apartment, index) => (
              <div className="watch-row" key={`${apartment.id}-${index}`}>
                <div>
                  <b>{apartment.number}</b>
                  <small>
                    {buildingName(apartment)} · {apartment.ownerName || 'Individual owner'}
                  </small>
                </div>
                <span className={apartment.status === 'Vacant' ? 'watch-warning' : 'watch-neutral'}>
                  {apartment.status === 'Vacant'
                    ? 'Vacant review'
                    : apartment.status === 'Leased'
                      ? 'Renewal review'
                      : 'Investment review'}
                </span>
                <strong>{money(apartment.rent)}</strong>
              </div>
            )
          )}
        </div>
      </section>
      <LegacyFinanceView data={data} />{' '}
    </>
  );
}
function MaintenanceView({ data }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const apartments = data.apartments || [];
  const buildings = data.buildings || [];
  const matches = (item) =>
    `${item.title || ''} ${item.category || ''} ${item.technician || ''}`
      .toLowerCase()
      .includes(query.toLowerCase()) &&
    (filter === 'All' || item.category === filter);
  const editNotes = (item) => {
    const notes = window.prompt('Edit maintenance notes', item.notes || '');
    if (notes !== null) item.notes = notes;
  };
  return (
    <section className="panel maintenance-view">
      <div className="panel-head">
        <div>
          <h2>Maintenance & bills</h2>
          <p>Recent work, operational expenses, and utility payments</p>
        </div>
        <div className="maintenance-filters">
          <input
            className="search"
            placeholder="Search maintenance..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Maintenance</option>
            <option>Inspection</option>
            <option>Renovation</option>
            <option>Appliance</option>
          </select>
        </div>
      </div>
      <h3>Maintenance records</h3>
      <div className="maintenance-table">
        {data.maintenance.filter(matches).map((item) => {
          const apartment = apartments.find((a) => a.id === item.apartmentId);
          const building = buildings.find((b) => b.id === apartment?.buildingId);
          return (
            <div className="maintenance-row" key={item.id}>
              <div>
                <b>{item.title}</b>
                <small>
                  {item.category} · {item.date} · {item.technician}
                </small>
                <em>{item.notes}</em>
              </div>
              <button
                className="link-button"
                onClick={() => apartment && setSelectedApartment(apartment)}
              >
                {building?.name} · Apt {apartment?.number}
              </button>
              <strong>{money(item.cost)}</strong>
              <span
                className={`maintenance-status ${item.status === 'Done' ? 'done' : 'progress'}`}
              >
                {item.status}
              </span>
              <button className="edit-notes" onClick={() => editNotes(item)}>
                Edit notes
              </button>
            </div>
          );
        })}
      </div>
      <h3>Recent paid bills</h3>
      <div className="maintenance-table">
        {data.bills
          .filter(
            (bill) =>
              bill.status === 'Paid' &&
              (filter === 'All' || filter === bill.category) &&
              `${bill.category} ${bill.period}`.toLowerCase().includes(query.toLowerCase())
          )
          .map((bill) => {
            const apartment = apartments.find((a) => a.id === bill.apartmentId);
            const building = buildings.find((b) => b.id === apartment?.buildingId);
            return (
              <div className="maintenance-row bill-row" key={bill.id}>
                <div>
                  <b>{bill.category}</b>
                  <small>
                    {bill.period} · due {bill.dueDate} · Paid
                  </small>
                </div>
                <button
                  className="link-button"
                  onClick={() => apartment && setSelectedApartment(apartment)}
                >
                  {building?.name} · Apt {apartment?.number}
                </button>
                <strong>{money(bill.amount)}</strong>
                <span className="maintenance-status done">Paid</span>
              </div>
            );
          })}
      </div>
      {selectedApartment && (
        <div className="drawer-backdrop" onClick={() => setSelectedApartment(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <ApartmentSidePanel
              apartment={selectedApartment}
              buildings={buildings}
              people={data.people}
              data={data}
              onClose={() => setSelectedApartment(null)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
const ownerTone = (owner) => {
  const value = String(owner || '').toLowerCase();
  if (value.includes('amidar')) return 'owner-amidar';
  if (value === 'hd' || value.includes('hd ')) return 'owner-hd';
  if (value === 'mr' || value.includes('mr ')) return 'owner-mr';
  return 'owner-individual';
};
const apartmentSort = (a, b) => Number(b.floor || 0) - Number(a.floor || 0) || String(b.number || b.appt || b.apptId || '').localeCompare(String(a.number || a.appt || a.apptId || ''), undefined, { numeric: true });
const normalizeApartmentNumber = (value) => {
  const text = String(value ?? '').trim();
  return /^\d+$/.test(text) ? String(Number(text)) : text;
};
const buildingSort = (a, b) => String(a.name || a.address || '').localeCompare(String(b.name || b.address || ''), undefined, { numeric: true, sensitivity: 'base' });
function ListView({ tab, data, selected, setSelected, onAdd, exportData, importData, importCsv }) {
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const people = data.people || [];
  const [peopleRole, setPeopleRole] = useState('All');
  const peopleRows = people
    .filter((person) => peopleRole === 'All' || person.role === peopleRole)
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' }));
  const apartmentGroupsFor = (person) => {
    const groups = new Map();
    (person.apartmentIds || []).forEach((id) => {
      const apartment = data.apartments.find((item) => item.id === id);
      if (!apartment) return;
      const building = data.buildings.find((item) => item.id === apartment.buildingId);
      const key = `${building?.street || building?.name || 'Building'} ${building?.streetNumber || ''}`.trim();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(apartment);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([buildingName, apartments]) => ({ buildingName, apartments: apartments.sort(apartmentSort) }));
  };
  const rows =
    tab === 'Buildings'
      ? data.buildings
      : tab === 'Apartments'
        ? data.apartments
        : tab === 'People'
          ? peopleRows
          : data.maintenance;
  return (
    <section className="panel list-view">
      <div className="panel-head">
        <div>
          <h2>{tab} register</h2>
          <p>
            {tab === 'People'
              ? 'Owners, tenants, vendors, and professional contacts.'
              : 'These records are saved in your browser for now.'}
          </p>
        </div>
        <div>
          <button className="outline small" onClick={onAdd}>
            + Add
          </button>
          {tab === 'People' && (
            <select
              className="filter-select"
              value={peopleRole}
              onChange={(e) => setPeopleRole(e.target.value)}
            >
              <option>All</option>
              <option>Owner</option>
              <option>Tenant</option>
              <option>Technician</option>
              <option>Insurance agent</option>
            </select>
          )}
          {tab === 'Buildings' && (
            <>
              <label className="outline small csv-import-label">Import master CSV<input type="file" accept=".csv,text/csv" onChange={importCsv} /></label>
              <button className="outline small" onClick={exportData}>
                Export backup
              </button>
              <label className="outline small">
                Import backup
                <input type="file" accept="application/json" onChange={importData} />
              </label>
            </>
          )}
        </div>
      </div>
      <div className={tab === 'Apartments' ? 'building-groups' : 'record-grid'}>
        {tab === 'Apartments'
          ? [...data.buildings].sort(buildingSort).map((building) => (
              <section className="building-group" key={building.id}>
                <div className="group-heading">
                  <h3>{building.name}</h3>
                  <span>
                    {
                      data.apartments.filter((apartment) => apartment.buildingId === building.id)
                        .length
                    }{' '}
                    apartments
                  </span>
                </div>
                <div className="record-grid">
                  {data.apartments
                    .filter((apartment) => apartment.buildingId === building.id)
                    .sort(apartmentSort)
                    .map((r) => (
                      <button
                        className={`record-card ${ownerTone(r.internalOwner || r.ownerName)}`}
                        key={r.id}
                        onClick={() => setSelectedApartment(r)}
                      >
                        <b>{r.number}</b>
                        <span>
                          {r.ownerName || 'Individual owner'} · {r.status}
                        </span>
                        <small>
                          {r.tenantName || 'No tenant'} · {money(r.rent)}
                        </small>
                      </button>
                    ))}
                </div>
              </section>
            ))
          : [...rows].sort(tab === 'Buildings' ? buildingSort : tab === 'Apartments' ? apartmentSort : undefined).map((r) => (
              <button
                className={`record-card ${tab === 'People' ? 'record-card-static' : ''}`}
                key={r.id}
                onClick={() => {
                  if (tab === 'Buildings') {
                    setSelected(r);
                    setSelectedBuilding(r);
                  }
                  if (tab === 'Apartments') setSelectedApartment(r);
                  if (tab !== 'People') setSelectedPerson(r);
                }}
              >
                <b>{r.name || r.number || r.title}</b>
                <span>
                  {tab === 'People' ? r.role : r.area || r.status || 'Maintenance record'}
                </span>
                <small>
                  {tab === 'People'
                    ? <>{r.phone || 'Phone not recorded'} · {r.email || 'Email not recorded'}<div className="person-apartment-groups">{apartmentGroupsFor(r).map((group) => <div className="person-apartment-group" key={group.buildingName}><b>{group.buildingName}</b><span>{group.apartments.map((apartment) => <button type="button" className="person-apartment-link" key={apartment.id} onClick={(event) => { event.stopPropagation(); setSelectedApartment(apartment); }}>{apartment.apptId || apartment.number || 'Apartment'}</button>)}</span></div>)}</div></>
                    : r.units
                      ? `${r.units} apartments · ${r.floors} floors`
                      : r.rent
                        ? money(r.rent)
                        : money(r.cost)}
                </small>
                {tab === 'Buildings' && (
                  <div className="building-apartments">
                    {data.apartments
                      .filter((apartment) => apartment.buildingId === r.id)
                      .sort(apartmentSort)
                      .map((apartment) => (
                        <span
                          key={apartment.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedApartment(apartment);
                          }}
                        >
                          {apartment.number}
                        </span>
                      ))}
                  </div>
                )}
              </button>
            ))}
      </div>
      {!rows.length && <p className="empty">No records yet. Use Add to create your first one.</p>}
      {selectedApartment && (
        <div className="drawer-backdrop" onClick={() => setSelectedApartment(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <ApartmentSidePanel
              apartment={selectedApartment}
              buildings={data.buildings}
              people={data.people}
              data={data}
              onClose={() => setSelectedApartment(null)}
            />
          </div>
        </div>
      )}
      {selectedBuilding && !selectedApartment && (
        <div className="drawer-backdrop" onClick={() => setSelectedBuilding(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <BuildingDrawer
              building={selectedBuilding}
              apartments={data.apartments}
              onApartment={setSelectedApartment}
              onClose={() => setSelectedBuilding(null)}
            />
          </div>
        </div>
      )}
      {selectedPerson && (
        <div className="drawer-backdrop" onClick={() => setSelectedPerson(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <PersonDetailsModal
              person={selectedPerson}
              apartments={data.apartments}
              buildings={data.buildings}
              onClose={() => setSelectedPerson(null)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
function BuildingDrawer({ building, apartments, onApartment, onClose }) {
  const items = apartments
    .filter((apartment) => apartment.buildingId === building.id)
    .sort((a, b) => {
      const floorDiff = Number(a.floor || 0) - Number(b.floor || 0);
      if (floorDiff) return floorDiff;
      return String(a.number || a.appt || a.apptId || '').localeCompare(
        String(b.number || b.appt || b.apptId || ''),
        undefined,
        { numeric: true }
      );
    });
  const floors = Math.max(Number(building.floors || 0), ...items.map((item) => Number(item.floor || 0)), 1);
  const ownerClass = (owner) => {
    const value = String(owner || '').toLowerCase();
    if (value.includes('amidar')) return 'owner-amidar';
    if (value === 'hd' || value.includes('hd ')) return 'owner-hd';
    if (value === 'mr' || value.includes('mr ')) return 'owner-mr';
    return 'owner-individual';
  };
  return (
    <aside className="side-drawer building-drawer">
      <button className="close" onClick={onClose}>
        ×
      </button>
      <div className="eyebrow">BUILDING</div>
      <h2>{building.name}</h2>
      <p className="muted">
        {building.area} · {building.units} apartments · {building.floors} floors
      </p>
      <div className="drawer-summary">
        <b>{items.length}</b>
        <span>loaded apartments</span>
      </div>
      <h3>Apartment register</h3>
      <div className="floor-grid">
        {Array.from({ length: floors + 1 }, (_, index) => floors - index).map((floor) => {
          const floorItems = items.filter((apartment) => Number(apartment.floor || 0) === floor);
          return (
            <div className="floor-row" key={floor}>
              <div className="floor-label">Floor {floor}</div>
              <div className="floor-apartments">
                {floorItems.length ? floorItems.map((apartment) => (
                  <button className={`drawer-apartment ${ownerClass(apartment.internalOwner || apartment.ownerName)}`} key={apartment.id} onClick={() => onApartment(apartment)}>
                    <span><b>Apt {apartment.number || apartment.appt || apartment.apptId || '—'}</b><small>{apartment.internalOwner || apartment.ownerName || 'Individual owner'}</small></span>
                    <span><b>{apartment.size ? `${apartment.size} m²` : 'Size —'}</b><small>{apartment.rooms ? `${apartment.rooms} rooms` : 'Rooms —'} · Entrance {apartment.entrance || '—'}</small></span>
                    <strong>{money(apartment.rent || 0)}</strong>
                  </button>
                )) : <span className="empty-floor">No apartment records</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="owner-legend"><span className="owner-amidar">Amidar</span><span className="owner-hd">HD</span><span className="owner-mr">MR</span><span className="owner-individual">Individual / unknown</span></div>
    </aside>
  );
}
function LegacyApartmentSidePanel({ apartment, buildings, people = [], data, onClose }) {
  const building = buildings.find((item) => item.id === apartment.buildingId);
  const related = people.filter((person) => person.apartmentIds?.includes(apartment.id));
  const events = (data.events || []).filter((event) => event.apartmentId === apartment.id);
  const bills = (data.bills || []).filter((bill) => bill.apartmentId === apartment.id);
  const monthlyTotal =
    events.reduce((sum, event) => sum + Number(event.cost || 0), 0) +
    bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  return (
    <aside className="side-drawer apartment-drawer">
      <button className="close" onClick={onClose}>
        ×
      </button>
      <div className="eyebrow">APARTMENT DETAILS</div>
      <h2>
        {apartment.number} · {building?.name}
      </h2>
      <p className="muted">
        {apartment.status} · {money(apartment.rent)} per month
      </p>
      <div className="detail-grid">
        <div>
          <span>Owner</span>
          <b>
            {apartment.ownerName || related.find((p) => p.role === 'Owner')?.name || 'Not added'}
          </b>
        </div>
        <div>
          <span>Tenant</span>
          <b>
            {apartment.tenantName || related.find((p) => p.role === 'Tenant')?.name || 'Not added'}
          </b>
        </div>
        <div>
          <span>Rental period</span>
          <b>
            {apartment.leaseStart || '—'} to {apartment.leaseEnd || '—'}
          </b>
        </div>
        <div>
          <span>Contract</span>
          <b>
            <a
              href={apartment.contractUrl || '#'}
              onClick={(event) => !apartment.contractUrl && event.preventDefault()}
            >
              {apartment.contractUrl ? 'Open PDF' : 'PDF to be added'}
            </a>
          </b>
        </div>
        <div><span>Apartment ID</span><b>{apartment.apptId || apartment.uniqueId || '—'}</b></div>
        <div><span>Floor / Entrance</span><b>{apartment.floor || '—'} · {apartment.entrance || '—'}</b></div>
        <div><span>Size / Rooms</span><b>{apartment.size ? `${apartment.size} m²` : '—'} · {apartment.rooms || '—'}</b></div>
        <div><span>Parcel / Sub A</span><b>{apartment.parcel || '—'} · {apartment.subA || '—'}</b></div>
        <div><span>Class</span><b>{apartment.propertyClass || '—'}</b></div>
        <div><span>Garden</span><b>{apartment.garden ? 'Yes' : 'No'}</b></div>
        <div><span>Invested</span><b>{apartment.invested ? money(apartment.invested) : '—'}</b></div>
        <div><span>Owner contract</span><b>{apartment.ownerContract || '—'}</b></div>
        <div><span>Internal owner</span><b>{apartment.internalOwner || '—'}</b></div>
        <div><span>Address</span><b>{apartment.addressNotEditable || apartment.altAddress || '—'}</b></div>
        <div><span>Parcel / investment</span><b>{apartment.parcel || '—'} · {apartment.invested ? money(apartment.invested) : '—'}</b></div>
        <div><span>Rentable / agreement</span><b>{apartment.rentable ? 'Rentable' : 'Not marked'} · {apartment.agreement || '—'}</b></div>
        <div><span>Pinui-Binui status</span><b>{apartment.pinuiStatus || '—'}</b></div>
      </div>
      <div className="cost-total">
        <span>June total costs</span>
        <b>{money(monthlyTotal)}</b>
        <small>Annual view: {money(monthlyTotal * 12)}</small>
      </div>
      <h3>Recent events</h3>
      {events.map((event) => (
        <div className="event-row" key={event.id}>
          <div>
            <b>{event.title}</b>
            <small>
              {event.type} · {event.date}
            </small>
          </div>
          <strong>{money(event.cost)}</strong>
        </div>
      ))}
      {!events.length && <p className="muted">No events recorded yet.</p>}
      <h3>Bills</h3>
      {bills.map((bill) => (
        <div className="event-row" key={bill.id}>
          <div>
            <b>{bill.category}</b>
            <small>
              {bill.period} · due {bill.dueDate} · {bill.status}
            </small>
          </div>
          <strong>{money(bill.amount)}</strong>
        </div>
      ))}
    </aside>
  );
}
function FinancialSummary({ rent, bills, events }) {
  const expenses =
    bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0) +
    events.reduce((sum, event) => sum + Number(event.cost || 0), 0);
  const history = [0.91, 0.96, 1.03, 0.98, 1.08, 1].map((factor, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index],
    income: Math.round(rent * factor),
    expense: Math.round(expenses * (0.88 + index * 0.03)),
  }));
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const change = Math.round(((current.income - previous.income) / previous.income) * 100);
  const annualIncome = history.reduce((sum, month) => sum + month.income, 0);
  const annualExpense = history.reduce((sum, month) => sum + month.expense, 0);
  return (
    <div className="financial-summary">
      <div className="finance-head">
        <h3>Monthly cash flow</h3>
        <span>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs May
        </span>
      </div>
      <div className="finance-cards">
        <div className="income">
          <small>Rent coming in</small>
          <b>{money(current.income)}</b>
        </div>
        <div className="expense">
          <small>Costs going out</small>
          <b>{money(current.expense)}</b>
        </div>
      </div>
      <div className="finance-history">
        {history.map((month) => (
          <div key={month.month}>
            <span>{month.month}</span>
            <i style={{ height: `${Math.max(8, (month.income / rent) * 30)}px` }} />
            <em
              style={{ height: `${Math.max(6, (month.expense / Math.max(expenses, 1)) * 30)}px` }}
            />
          </div>
        ))}
      </div>
      <div className="finance-totals">
        <span>
          6-month income <b>{money(annualIncome)}</b>
        </span>
        <span>
          6-month costs <b>{money(annualExpense)}</b>
        </span>
        <span>
          Net ratio <b>{Math.round(((annualIncome - annualExpense) / annualIncome) * 100)}%</b>
        </span>
      </div>
    </div>
  );
}
function ApartmentSidePanel({ apartment, buildings, people = [], data, onClose }) {
  const building = buildings.find((item) => item.id === apartment.buildingId);
  const related = people.filter((person) => person.apartmentIds?.includes(apartment.id));
  const events = (data.events || []).filter((event) => event.apartmentId === apartment.id);
  const bills = (data.bills || []).filter((bill) => bill.apartmentId === apartment.id);
  return (
    <aside className="side-drawer apartment-drawer">
      <button className="close" onClick={onClose}>
        ×
      </button>
      <div className="eyebrow">APARTMENT DETAILS</div>
      <h2>
        {apartment.number} · {building?.name}
      </h2>
      <p className="muted">
        {apartment.status} · {money(apartment.rent)} per month
      </p>
      <div className="detail-grid">
        <div>
          <span>Owner</span>
          <b>
            {apartment.ownerName || related.find((p) => p.role === 'Owner')?.name || 'Not added'}
          </b>
        </div>
        <div>
          <span>Tenant</span>
          <b>
            {apartment.tenantName || related.find((p) => p.role === 'Tenant')?.name || 'Not added'}
          </b>
        </div>
        <div>
          <span>Rental period</span>
          <b>
            {apartment.leaseStart || '—'} to {apartment.leaseEnd || '—'}
          </b>
        </div>
        <div>
          <span>Contract</span>
          <b>
            <a
              href={apartment.contractUrl || '#'}
              onClick={(event) => !apartment.contractUrl && event.preventDefault()}
            >
              {apartment.contractUrl ? 'Open PDF' : 'PDF to be added'}
            </a>
          </b>
        </div>
        <div><span>Garden</span><b>{apartment.garden ? 'Yes' : 'No'}</b></div>
        <div><span>Invested</span><b>{apartment.invested ? money(apartment.invested) : '—'}</b></div>
        <div><span>Owner contract</span><b>{apartment.ownerContract || '—'}</b></div>
        <div><span>Apartment ID</span><b>{apartment.apptId || apartment.uniqueId || '—'}</b></div>
        <div><span>Floor / Entrance</span><b>{apartment.floor ?? '—'} · {apartment.entrance || '—'}</b></div>
        <div><span>Size / Rooms</span><b>{apartment.size ? `${apartment.size} m²` : '—'} · {apartment.rooms || '—'}</b></div>
        <div><span>Parcel / Sub-parcel</span><b>{apartment.parcel || '—'} · {apartment.subA || '—'}</b></div>
        <div><span>Class / Internal owner</span><b>{apartment.propertyClass || '—'} · {apartment.internalOwner || '—'}</b></div>
      </div>
      <FinancialSummary rent={apartment.rent} bills={bills} events={events} />
      <h3>Recent events</h3>
      {events.map((event) => (
        <div className="event-row" key={event.id}>
          <div>
            <b>{event.title}</b>
            <small>
              {event.type} · {event.date}
            </small>
          </div>
          <strong>{money(event.cost)}</strong>
        </div>
      ))}
      {!events.length && <p className="muted">No events recorded yet.</p>}
      <h3>Bills</h3>
      {bills.map((bill) => (
        <div className="event-row" key={bill.id}>
          <div>
            <b>{bill.category}</b>
            <small>
              {bill.period} · due {bill.dueDate} · {bill.status}
            </small>
          </div>
          <strong>{money(bill.amount)}</strong>
        </div>
      ))}
    </aside>
  );
}
function ApartmentDetails({ apartment, buildings, people = [], onClose }) {
  const building = buildings.find((item) => item.id === apartment.buildingId);
  const related = people.filter((person) => person.apartmentIds?.includes(apartment.id));
  return (
    <div className="record-detail">
      <div>
        <div className="eyebrow">APARTMENT DETAILS</div>
        <button className="close" onClick={onClose}>
          ×
        </button>
        <h2>
          {apartment.number} · {building?.name}
        </h2>
        <p className="muted">
          {apartment.status} · {money(apartment.rent)} per month
        </p>
      </div>
      <div className="detail-grid">
        <div>
          <span>Owner</span>
          <b>
            {apartment.ownerName || related.find((p) => p.role === 'Owner')?.name || 'Not added'}
          </b>
        </div>
        <div>
          <span>Tenant</span>
          <b>
            {apartment.tenantName || related.find((p) => p.role === 'Tenant')?.name || 'Not added'}
          </b>
        </div>
        <div>
          <span>Rental period</span>
          <b>
            {apartment.leaseStart || '—'} to {apartment.leaseEnd || '—'}
          </b>
        </div>
        <div>
          <span>Contract</span>
          <b>
            <a
              href={apartment.contractUrl || '#'}
              onClick={(event) => !apartment.contractUrl && event.preventDefault()}
            >
              {apartment.contractUrl ? 'Open rental contract PDF' : 'PDF to be added later'}
            </a>
          </b>
        </div>
      </div>
    </div>
  );
}
function PersonDetails({ person, apartments, buildings, onClose }) {
  const related = apartments.filter((apartment) => person.apartmentIds?.includes(apartment.id));
  return (
    <div className="record-detail">
      <button className="close" onClick={onClose}>
        ×
      </button>
      <div className="eyebrow">PERSON</div>
      <h2>{person.name}</h2>
      <p className="muted">
        {person.role} · {person.phone}
      </p>
      <h3>Associated apartments</h3>
      {related.length ? (
        related.map((apartment) => (
          <div className="associated" key={apartment.id}>
            <b>{apartment.number}</b>
            <span>{buildings.find((building) => building.id === apartment.buildingId)?.name}</span>
            <small>
              {money(apartment.rent)} · {apartment.status}
            </small>
          </div>
        ))
      ) : (
        <p className="muted">No apartment associations yet.</p>
      )}
    </div>
  );
}
function PersonDetailsModal({ person, apartments, buildings, onClose }) {
  const enriched = enrichPerson(person);
  const related = apartments.filter((apartment) => enriched.apartmentIds?.includes(apartment.id));
  const interactions = enriched.interactions || [];
  const total = interactions.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  return (
    <aside className="side-drawer person-drawer">
      <button className="close" onClick={onClose}>
        ×
      </button>
      <div className="eyebrow">PERSON PROFILE</div>
      <h2>{enriched.name}</h2>
      <p className="muted">{enriched.role}</p>
      <div className="person-contact">
        <b>{enriched.phone}</b>
        <span>{enriched.email}</span>
        <small>Preferred contact: {enriched.preferredContact}</small>
        <small>Notes: {enriched.notes}</small>
      </div>
      <h3>Associated apartments</h3>
      {related.length ? (
        related.map((apartment) => (
          <div className="associated" key={apartment.id}>
            <b>{apartment.number}</b>
            <span>{buildings.find((building) => building.id === apartment.buildingId)?.name}</span>
            <small>
              {money(apartment.rent)} · {apartment.status}
            </small>
          </div>
        ))
      ) : (
        <p className="muted">No apartment associations yet.</p>
      )}
      {interactions.length > 0 && (
        <>
          <h3>Interaction history</h3>
          <div className="interaction-total">
            Total paid / charged: <b>{money(total)}</b>
          </div>
          {interactions.map((item) => (
            <div className="timeline-item" key={item.id}>
              <i />
              <div>
                <b>{item.title}</b>
                <small>
                  {item.date} · {item.apartment}
                </small>
              </div>
              <strong>{money(item.cost)}</strong>
            </div>
          ))}
          <div className="finance-totals">
            <span>
              Per month <b>{money(total)}</b>
            </span>
            <span>
              Per quarter <b>{money(total * 3)}</b>
            </span>
            <span>
              Per year <b>{money(total * 12)}</b>
            </span>
          </div>
        </>
      )}
    </aside>
  );
}
function Modal({ type, buildings, onClose, onSubmit }) {
  const configs = {
    building: [
      ['name', 'Building name', 'Rager 12'],
      ['area', 'Area', 'Old City'],
      ['units', 'Apartments', '18'],
      ['floors', 'Floors', '6'],
      ['zone', 'Zoning', 'Residential A'],
    ],
    apartment: [
      ['number', 'Apartment number', 'A-01'],
      ['ownerName', 'Owner name', 'Avi Cohen'],
      ['tenantName', 'Tenant name', 'Maya Cohen'],
      ['rent', 'Monthly rent (₪)', '4800'],
      ['status', 'Status', 'Leased'],
      ['leaseStart', 'Lease start date', '2025-07-01'],
      ['leaseEnd', 'Lease end date', '2026-06-30'],
      ['contractUrl', 'Rental contract PDF link (optional)', 'https://...'],
    ],
    maintenance: [
      ['title', 'Issue / work title', 'Leaking tap'],
      ['status', 'Status', 'Open'],
      ['cost', 'Cost (₪)', '0'],
      ['date', 'Date', '2025-07-14'],
    ],
    person: [
      ['name', 'Full name', 'Maya Cohen'],
      ['role', 'Role', 'Tenant'],
      ['phone', 'Phone', '050-555-1234'],
    ],
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={onSubmit}>
        <div className="panel-head">
          <div>
            <h2>Add {type}</h2>
            <p>Fill in the record now; you can edit the schema later.</p>
          </div>
          <button type="button" className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <input type="hidden" name="kind" value={type} />
        {configs[type].map(([name, label, placeholder]) => (
          <label key={name}>
            {label}
            <input name={name} placeholder={placeholder} required={name !== 'resident'} />
          </label>
        ))}
        <div className="modal-actions">
          <button type="button" className="outline" onClick={onClose}>
            Cancel
          </button>
          <button className="primary">Save record</button>
        </div>
      </form>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<App />);
