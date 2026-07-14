import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './enhancements.css';
import './people.css';
import RealMap from './RealMap';

const seed = {
  buildings: [
    {
      id: 'b1',
      name: 'Gimel 4',
      area: 'Shechuna Gimel',
      units: 18,
      floors: 6,
      zone: 'Residential A',
      color: 'coral',
      x: 27,
      y: 26,
    },
    {
      id: 'b2',
      name: 'Gimel 15',
      area: 'Shechuna Gimel',
      units: 24,
      floors: 8,
      zone: 'Mixed use',
      color: 'blue',
      x: 55,
      y: 37,
    },
    {
      id: 'b3',
      name: 'HaKaf Gimel 4',
      area: 'Shechuna Gimel',
      units: 12,
      floors: 4,
      zone: 'Residential B',
      color: 'mint',
      x: 71,
      y: 19,
    },
    {
      id: 'b4',
      name: 'Gimel 22',
      area: 'Shechuna Gimel',
      units: 30,
      floors: 10,
      zone: 'Residential A',
      color: 'gold',
      x: 38,
      y: 67,
    },
  ],
  apartments: [
    {
      id: 'a1',
      buildingId: 'b1',
      number: 'A-01',
      resident: 'Maya Cohen', ownerName: 'Avi Cohen', tenantName: 'Maya Cohen', leaseStart: '2024-07-01', leaseEnd: '2026-06-30', contractUrl: '',
      status: 'Leased',
      rent: 4850,
      due: '2024-07-01',
    },
    {
      id: 'a2',
      buildingId: 'b1',
      number: 'A-02',
      resident: 'Noam Levi', ownerName: 'Ruth Levi', tenantName: 'Noam Levi', leaseStart: '2023-10-15', leaseEnd: '2025-10-14', contractUrl: '',
      status: 'Leased',
      rent: 5200,
      due: '2023-10-15',
    },
    {
      id: 'a3',
      buildingId: 'b1',
      number: 'A-03',
      resident: '', ownerName: 'Miriam Azulay', tenantName: '', leaseStart: '', leaseEnd: '', contractUrl: '',
      status: 'Vacant',
      rent: 4600,
      due: '2025-06-03',
    },
    {
      id: 'a4',
      buildingId: 'b1',
      number: 'A-04',
      resident: 'Dana Shalev', ownerName: 'Oren Shalev', tenantName: 'Dana Shalev', leaseStart: '2025-07-01', leaseEnd: '2026-06-30', contractUrl: '',
      status: 'On market',
      rent: 5100,
      due: '2025-06-27',
    },
  ],
  maintenance: [
    {
      id: 'm1',
      buildingId: 'b1',
      title: 'Leaking kitchen tap',
      status: 'Open',
      cost: 420,
      date: '2025-06-28',
    },
  ],
  bills: [],
  payments: [],
  activity: [],
  people: [
    { id: 'p1', name: 'Avi Cohen', role: 'Owner', phone: '050-555-1040', apartmentIds: ['a1'] },
    { id: 'p2', name: 'Maya Cohen', role: 'Tenant', phone: '052-555-2091', apartmentIds: ['a1'] },
    { id: 'p3', name: 'Ruth Levi', role: 'Owner', phone: '050-555-3082', apartmentIds: ['a2'] },
    { id: 'p4', name: 'Noam Levi', role: 'Tenant', phone: '054-555-4102', apartmentIds: ['a2'] },
    { id: 'p5', name: 'Yossi Electric', role: 'Technician', phone: '050-555-9012', apartmentIds: [] },
    { id: 'p6', name: 'Neta Barak', role: 'Insurance agent', phone: '052-555-8801', apartmentIds: [] },
  ],
};
const money = (n) => `₪${Number(n || 0).toLocaleString('en-US')}`;
const mockExpansion = {
  buildings: [
    { id: 'b5', name: 'Gimel 28', area: 'Shechuna Gimel', units: 16, floors: 5, zone: 'Residential A', color: 'coral', x: 18, y: 45 },
    { id: 'b6', name: 'Gimel 33', area: 'Shechuna Gimel', units: 20, floors: 7, zone: 'Residential B', color: 'blue', x: 63, y: 60 },
    { id: 'b7', name: 'Gimel 41', area: 'Shechuna Gimel', units: 14, floors: 4, zone: 'Residential A', color: 'mint', x: 82, y: 42 },
  ],
  apartments: [
    { id: 'a5', buildingId: 'b1', number: 'A-05', ownerName: 'Shira Ben-David', tenantName: 'Lior Katz', resident: 'Lior Katz', status: 'Leased', rent: 4950, leaseStart: '2025-02-01', leaseEnd: '2026-01-31', contractUrl: '' },
    { id: 'a6', buildingId: 'b2', number: 'B-01', ownerName: 'Eli Mizrahi', tenantName: 'Yael Peretz', resident: 'Yael Peretz', status: 'Leased', rent: 5600, leaseStart: '2024-09-01', leaseEnd: '2026-08-31', contractUrl: '' },
    { id: 'a7', buildingId: 'b2', number: 'B-02', ownerName: 'Eli Mizrahi', tenantName: '', resident: '', status: 'Vacant', rent: 5400, leaseStart: '', leaseEnd: '', contractUrl: '' },
    { id: 'a8', buildingId: 'b3', number: '2', ownerName: 'Tal Shachar', tenantName: 'Roni Gil', resident: 'Roni Gil', status: 'Leased', rent: 6100, leaseStart: '2025-04-15', leaseEnd: '2026-04-14', contractUrl: '' },
    { id: 'a9', buildingId: 'b3', number: '3', ownerName: 'Tal Shachar', tenantName: '', resident: '', status: 'On market', rent: 6250, leaseStart: '', leaseEnd: '', contractUrl: '' },
    { id: 'a10', buildingId: 'b4', number: '1', ownerName: 'Nir Avital', tenantName: 'Ofir Cohen', resident: 'Ofir Cohen', status: 'Leased', rent: 4700, leaseStart: '2024-12-01', leaseEnd: '2025-11-30', contractUrl: '' },
    { id: 'a11', buildingId: 'b4', number: '2', ownerName: 'Nir Avital', tenantName: '', resident: '', status: 'Vacant', rent: 4650, leaseStart: '', leaseEnd: '', contractUrl: '' },
    { id: 'a12', buildingId: 'b5', number: '1', ownerName: 'Michal Azulay', tenantName: 'Amit Ronen', resident: 'Amit Ronen', status: 'Leased', rent: 4550, leaseStart: '2025-01-15', leaseEnd: '2026-01-14', contractUrl: '' },
    { id: 'a13', buildingId: 'b5', number: '2', ownerName: 'Michal Azulay', tenantName: '', resident: '', status: 'Vacant', rent: 4500, leaseStart: '', leaseEnd: '', contractUrl: '' },
    { id: 'a14', buildingId: 'b6', number: '1', ownerName: 'Gadi Fried', tenantName: 'Hila Naveh', resident: 'Hila Naveh', status: 'Leased', rent: 5750, leaseStart: '2025-06-01', leaseEnd: '2026-05-31', contractUrl: '' },
    { id: 'a15', buildingId: 'b6', number: '2', ownerName: 'Gadi Fried', tenantName: 'Matan Bar', resident: 'Matan Bar', status: 'Leased', rent: 5800, leaseStart: '2024-11-01', leaseEnd: '2025-10-31', contractUrl: '' },
    { id: 'a16', buildingId: 'b6', number: '3', ownerName: 'Gadi Fried', tenantName: '', resident: '', status: 'On market', rent: 5900, leaseStart: '', leaseEnd: '', contractUrl: '' },
    { id: 'a17', buildingId: 'b7', number: '1', ownerName: 'Anat Levi', tenantName: 'Shani Dahan', resident: 'Shani Dahan', status: 'Leased', rent: 5100, leaseStart: '2025-03-01', leaseEnd: '2026-02-28', contractUrl: '' },
    { id: 'a18', buildingId: 'b7', number: '2', ownerName: 'Anat Levi', tenantName: '', resident: '', status: 'Vacant', rent: 5000, leaseStart: '', leaseEnd: '', contractUrl: '' },
    { id: 'a19', buildingId: 'b7', number: '3', ownerName: 'Anat Levi', tenantName: 'Yarden Shalev', resident: 'Yarden Shalev', status: 'Leased', rent: 5150, leaseStart: '2024-08-01', leaseEnd: '2025-07-31', contractUrl: '' },
  ],
  people: [
    { id: 'p7', name: 'Shira Ben-David', role: 'Owner', phone: '050-555-6111', apartmentIds: ['a5'] }, { id: 'p8', name: 'Lior Katz', role: 'Tenant', phone: '052-555-6222', apartmentIds: ['a5'] },
    { id: 'p9', name: 'Eli Mizrahi', role: 'Owner', phone: '050-555-6333', apartmentIds: ['a6', 'a7'] }, { id: 'p10', name: 'Yael Peretz', role: 'Tenant', phone: '054-555-6444', apartmentIds: ['a6'] },
    { id: 'p11', name: 'Tal Shachar', role: 'Owner', phone: '052-555-6555', apartmentIds: ['a8', 'a9'] }, { id: 'p12', name: 'Roni Gil', role: 'Tenant', phone: '050-555-6666', apartmentIds: ['a8'] },
    { id: 'p13', name: 'Nir Avital', role: 'Owner', phone: '054-555-6777', apartmentIds: ['a10', 'a11'] }, { id: 'p14', name: 'Ofir Cohen', role: 'Tenant', phone: '052-555-6888', apartmentIds: ['a10'] },
    { id: 'p15', name: 'Michal Azulay', role: 'Owner', phone: '050-555-6999', apartmentIds: ['a12', 'a13'] }, { id: 'p16', name: 'Amit Ronen', role: 'Tenant', phone: '054-555-7000', apartmentIds: ['a12'] },
    { id: 'p17', name: 'Gadi Fried', role: 'Owner', phone: '052-555-7111', apartmentIds: ['a14', 'a15', 'a16'] }, { id: 'p18', name: 'Hila Naveh', role: 'Tenant', phone: '050-555-7222', apartmentIds: ['a14'] },
    { id: 'p19', name: 'Matan Bar', role: 'Tenant', phone: '054-555-7333', apartmentIds: ['a15'] }, { id: 'p20', name: 'Anat Levi', role: 'Owner', phone: '052-555-7444', apartmentIds: ['a17', 'a18', 'a19'] },
    { id: 'p21', name: 'Shani Dahan', role: 'Tenant', phone: '050-555-7555', apartmentIds: ['a17'] }, { id: 'p22', name: 'Yarden Shalev', role: 'Tenant', phone: '054-555-7666', apartmentIds: ['a19'] },
  ],
};
const hydrateData = () => {
  const saved = JSON.parse(localStorage.getItem('blockwise-data') || 'null');
  if (!saved) return { ...seed, buildings: [...seed.buildings, ...mockExpansion.buildings], apartments: [...seed.apartments, ...mockExpansion.apartments], people: [...seed.people, ...mockExpansion.people] };
  return { ...saved, buildings: [...(saved.buildings || []), ...mockExpansion.buildings.filter((b) => !(saved.buildings || []).some((item) => item.id === b.id))], apartments: [...(saved.apartments || []), ...mockExpansion.apartments.filter((a) => !(saved.apartments || []).some((item) => item.id === a.id))], people: [...(saved.people || []), ...mockExpansion.people.filter((p) => !(saved.people || []).some((item) => item.id === p.id))] };
};
function App() {
  const [data, setData] = useState(hydrateData);
  const [tab, setTab] = useState('Overview');
  const [selected, setSelected] = useState(data.buildings[0]);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  useEffect(() => localStorage.setItem('blockwise-data', JSON.stringify(data)), [data]);
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
  const visibleBuildings = data.buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.area.toLowerCase().includes(search.toLowerCase())
  );
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
          <div className="actions">
            <input
              className="search"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="primary" onClick={() => setModal('record')}>
              + Add record
            </button>
          </div>
        </header>
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
              <RealMap buildings={visibleBuildings} selected={selected} setSelected={setSelected} />
              <Detail
                building={selected}
                apartments={apartments}
                rent={rent}
                onAdd={() => setModal('apartment')}
              />
            </section>
            <section className="bottom-grid">
              <ApartmentTable apartments={apartments} />
              <Activity data={data} onAdd={() => setModal('maintenance')} />
            </section>
          </>
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
          />
        )}{' '}
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
function Map({ buildings, selected, setSelected }) {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [drag, setDrag] = useState(null);
  const startDrag = (event) => {
    if (event.target.closest('.pin')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: event.clientX, y: event.clientY, startX: view.x, startY: view.y });
  };
  const moveMap = (event) => {
    if (!drag) return;
    setView((current) => ({ ...current, x: drag.startX + event.clientX - drag.x, y: drag.startY + event.clientY - drag.y }));
  };
  const zoom = (amount) => setView((current) => ({ ...current, zoom: Math.min(1.8, Math.max(0.7, current.zoom + amount)) }));
  return (
    <div className="panel map-panel">
      <div className="panel-head">
        <div>
          <h2>Property map</h2>
          <p>Tap a building to view its details</p>
        </div>
        <span className="filter">⌖ All areas</span>
      </div>
      <div className="map" onPointerDown={startDrag} onPointerMove={moveMap} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
        <div className="map-toolbar"><span>BE'ER SHEVA · PROPERTY AREA</span><button onClick={() => setView({ x: 0, y: 0, zoom: 1 })}>Reset</button><button onClick={() => zoom(0.1)}>+</button><button onClick={() => zoom(-0.1)}>−</button></div>
        <div className="map-canvas" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
          <div className="neighborhood-zone"><span>YOUR PROPERTY AREA</span></div>
        <div className="road r1" />
        <div className="road r2" />
        <div className="road r3" />
        <div className="road r4" />
        <span className="map-street street-a">RAGER ST.</span><span className="map-street street-b">DERECH HEBRON</span>
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
function Detail({ building, apartments, rent, onAdd }) {
  if (!building) return <div className="panel detail-panel">No buildings yet.</div>;
  return (
    <div className="panel detail-panel">
      <div className="eyebrow">SELECTED PROPERTY</div>
      <h2>{building.name}</h2>
      <p className="muted">{building.area} · Be'er Sheva</p>
      <div className="property-stats">
        <div>
          <b>{building.units}</b>
          <small>Apartments</small>
        </div>
        <div>
          <b>{building.floors}</b>
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
            <b>{a.number}</b>
            <span>
              <strong>{a.resident || '—'}</strong>
              <small className={`status ${a.status.toLowerCase().replace(' ', '-')}`}>
                {a.status}
              </small>
            </span>
            <b>{money(a.rent)}</b>
            <span className="muted">{a.due}</span>
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
function ListView({ tab, data, selected, setSelected, onAdd, exportData, importData }) {
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const people = data.people || [];
  const [peopleRole, setPeopleRole] = useState('All');
  const rows =
    tab === 'Buildings'
      ? data.buildings
      : tab === 'Apartments'
        ? data.apartments
        : tab === 'People'
          ? people.filter((person) => peopleRole === 'All' || person.role === peopleRole)
          : data.maintenance;
  return (
    <section className="panel list-view">
      <div className="panel-head">
        <div>
          <h2>{tab} register</h2>
          <p>{tab === 'People' ? 'Owners, tenants, vendors, and professional contacts.' : 'These records are saved in your browser for now.'}</p>
        </div>
        <div>
          <button className="outline small" onClick={onAdd}>
            + Add
          </button>
          {tab === 'People' && <select className="filter-select" value={peopleRole} onChange={(e) => setPeopleRole(e.target.value)}><option>All</option><option>Owner</option><option>Tenant</option><option>Technician</option><option>Insurance agent</option></select>}
          {tab === 'Buildings' && (
            <>
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
      <div className="record-grid">
        {rows.map((r) => (
          <button
            className="record-card"
            key={r.id}
            onClick={() => { if (tab === 'Buildings') setSelected(r); if (tab === 'Apartments') setSelectedApartment(r); if (tab === 'People') setSelectedPerson(r); }}
          >
            <b>{r.name || r.number || r.title}</b>
            <span>{tab === 'People' ? r.role : r.area || r.status || 'Maintenance record'}</span>
            <small>
              {tab === 'People' ? r.phone : r.units
                ? `${r.units} apartments · ${r.floors} floors`
                : r.rent
                  ? money(r.rent)
                  : money(r.cost)}
            </small>
            {tab === 'Buildings' && <div className="building-apartments">{data.apartments.filter((apartment) => apartment.buildingId === r.id).map((apartment) => <span key={apartment.id} onClick={(event) => { event.stopPropagation(); setSelectedApartment(apartment); }}>{apartment.number}</span>)}</div>}
          </button>
        ))}
      </div>
      {!rows.length && <p className="empty">No records yet. Use Add to create your first one.</p>}
      {selectedApartment && <ApartmentDetails apartment={selectedApartment} buildings={data.buildings} people={data.people} onClose={() => setSelectedApartment(null)} />}
      {selectedPerson && <PersonDetails person={selectedPerson} apartments={data.apartments} buildings={data.buildings} onClose={() => setSelectedPerson(null)} />}
    </section>
  );
}
function ApartmentDetails({ apartment, buildings, people = [], onClose }) {
  const building = buildings.find((item) => item.id === apartment.buildingId);
  const related = people.filter((person) => person.apartmentIds?.includes(apartment.id));
  return <div className="record-detail"><div><div className="eyebrow">APARTMENT DETAILS</div><button className="close" onClick={onClose}>×</button><h2>{apartment.number} · {building?.name}</h2><p className="muted">{apartment.status} · {money(apartment.rent)} per month</p></div><div className="detail-grid"><div><span>Owner</span><b>{apartment.ownerName || related.find((p) => p.role === 'Owner')?.name || 'Not added'}</b></div><div><span>Tenant</span><b>{apartment.tenantName || related.find((p) => p.role === 'Tenant')?.name || 'Not added'}</b></div><div><span>Rental period</span><b>{apartment.leaseStart || '—'} to {apartment.leaseEnd || '—'}</b></div><div><span>Contract</span><b><a href={apartment.contractUrl || '#'} onClick={(event) => !apartment.contractUrl && event.preventDefault()}>{apartment.contractUrl ? 'Open rental contract PDF' : 'PDF to be added later'}</a></b></div></div></div>;
}
function PersonDetails({ person, apartments, buildings, onClose }) { const related = apartments.filter((apartment) => person.apartmentIds?.includes(apartment.id)); return <div className="record-detail"><button className="close" onClick={onClose}>×</button><div className="eyebrow">PERSON</div><h2>{person.name}</h2><p className="muted">{person.role} · {person.phone}</p><h3>Associated apartments</h3>{related.length ? related.map((apartment) => <div className="associated" key={apartment.id}><b>{apartment.number}</b><span>{buildings.find((building) => building.id === apartment.buildingId)?.name}</span><small>{money(apartment.rent)} · {apartment.status}</small></div>) : <p className="muted">No apartment associations yet.</p>}</div>; }
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
    <div className="modal-backdrop">
      <form className="modal" onSubmit={onSubmit}>
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
