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
import RealMap from './RealMap';

const seed = {
  buildings: [
    {
      id: 'b1',
      name: 'Gimel 4',
      street: 'חנה סנש', address: 'חנה סנש 4, שכונה ג׳, באר שבע', lat: 31.26410, lng: 34.79860,
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
      street: 'השלום', address: 'השלום 15, שכונה ג׳, באר שבע', lat: 31.26455, lng: 34.79940,
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
      street: 'גוש עציון', address: 'גוש עציון 4, שכונה ג׳, באר שבע', lat: 31.26345, lng: 34.80020,
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
      street: 'רוטנברג', address: 'רוטנברג 22, שכונה ג׳, באר שבע', lat: 31.26290, lng: 34.79910,
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
    { id: 'b5', name: 'Gimel 28', street: 'נילי', address: 'נילי 28, שכונה ג׳, באר שבע', lat: 31.26375, lng: 34.80110, area: 'Shechuna Gimel', units: 16, floors: 5, zone: 'Residential A', color: 'coral', x: 18, y: 45 },
    { id: 'b6', name: 'Gimel 33', street: 'וינגייט', address: 'וינגייט 33, שכונה ג׳, באר שבע', lat: 31.26260, lng: 34.80055, area: 'Shechuna Gimel', units: 20, floors: 7, zone: 'Residential B', color: 'blue', x: 63, y: 60 },
    { id: 'b7', name: 'Gimel 41', street: 'בן גוריון', address: 'בן גוריון 41, שכונה ג׳, באר שבע', lat: 31.26485, lng: 34.80125, area: 'Shechuna Gimel', units: 14, floors: 4, zone: 'Residential A', color: 'mint', x: 82, y: 42 },
    { id: 'b8', name: 'Gimel 48', street: 'רזיאל', address: 'רזיאל 48, שכונה ג׳, באר שבע', lat: 31.26320, lng: 34.80185, area: 'Shechuna Gimel', units: 12, floors: 4, zone: 'Residential A', color: 'gold', x: 76, y: 72 },
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
const bulkApartments = Array.from({ length: 8 }, (_, index) => ({
  id: `bulk-${index}`,
  buildingId: `b${index + 1}`,
  number: `G-${index + 1}`,
  ownerName: ['Amidar', 'Amidar', 'Amidar', 'HD', 'HD', 'MR', 'Individual owner', 'Amidar'][index],
  tenantName: index % 3 === 1 ? '' : `Sample tenant ${index + 1}`,
  resident: index % 3 === 1 ? '' : `Sample tenant ${index + 1}`,
  status: index % 3 === 1 ? 'Vacant' : index === 5 ? 'On market' : 'Leased',
  rent: 4300 + index * 175,
  leaseStart: index % 3 === 1 ? '' : `2025-0${(index % 8) + 1}-01`,
  leaseEnd: index % 3 === 1 ? '' : `2026-0${(index % 8) + 1}-01`,
  contractUrl: '',
}));
const bulkEvents = bulkApartments.flatMap((apartment, index) => [
  { id: `event-${index}-1`, apartmentId: apartment.id, type: 'Maintenance', title: index % 2 ? 'Furniture replacement' : 'Kitchen leak repair', date: '2025-06-12', cost: 180 + index * 35, notes: 'Mock maintenance record' },
  { id: `event-${index}-2`, apartmentId: apartment.id, type: 'Inspection', title: 'Annual apartment inspection', date: '2025-05-04', cost: 0, notes: 'Routine visit completed' },
]);
const bulkBills = bulkApartments.flatMap((apartment, index) => ['Water', 'Electricity', 'Vaad', 'Arnona', 'Gas'].map((category, billIndex) => ({
  id: `bill-${index}-${billIndex}`, apartmentId: apartment.id, category, amount: 90 + index * 17 + billIndex * 23, period: '2025-06-01 to 2025-06-30', dueDate: '2025-07-15', status: billIndex === 2 && index % 2 === 0 ? 'Unpaid' : 'Paid',
})));
const insuranceProviders = [
  { name: 'Phoenix', agent: 'Dana Shavit', phone: '03-555-1200', email: 'dana.shavit@example.com' },
  { name: 'Migdal', agent: 'Omer Katz', phone: '03-555-2300', email: 'omer.katz@example.com' },
  { name: 'Menora', agent: 'Ravit Azulay', phone: '03-555-3400', email: 'ravit.azulay@example.com' },
];
const maintenanceTypes = [
  ['Leak repair', 'Maintenance', 'Yossi Electric'], ['Annual inspection', 'Inspection', 'Maya Services'],
  ['Paint job', 'Renovation', 'Color Team'], ['Appliance replacement', 'Appliance', 'HomeTech Beersheba'],
];
const buildApartmentOperations = (apartments) => ({
  apartments: apartments.map((apartment, index) => { const insurance = insuranceProviders[index % insuranceProviders.length]; return { ...apartment, insuranceProvider: insurance.name, policyNumber: `POL-${100000 + index}`, policyStart: '2025-01-01', policyEnd: '2025-12-31', insuranceAgent: insurance.agent, insuranceAgentPhone: insurance.phone, insuranceAgentEmail: insurance.email }; }),
  maintenance: apartments.flatMap((apartment, index) => maintenanceTypes.map((item, typeIndex) => ({ id: `maint-${apartment.id}-${typeIndex}`, apartmentId: apartment.id, buildingId: apartment.buildingId, title: item[0], category: item[1], technician: item[2], insuranceAgent: index % 3 === 0 ? insuranceProviders[index % 3].agent : '', date: `2025-0${(typeIndex % 6) + 1}-${String((index % 20) + 1).padStart(2, '0')}`, cost: 180 + index * 22 + typeIndex * 95, status: typeIndex === 1 ? 'Done' : index % 4 === 0 ? 'In progress' : 'Done', notes: 'Mock operational record — edit me' }))),
});
const hydrateData = () => {
  const saved = JSON.parse(localStorage.getItem('blockwise-data') || 'null');
  const base = saved || { ...seed, buildings: [...seed.buildings, ...mockExpansion.buildings], apartments: [...seed.apartments, ...mockExpansion.apartments], people: [...seed.people, ...mockExpansion.people] };
  const apartments = [...(base.apartments || []), ...mockExpansion.apartments.filter((a) => !(base.apartments || []).some((item) => item.id === a.id)), ...bulkApartments.filter((a) => !(base.apartments || []).some((item) => item.id === a.id))];
  const operations = buildApartmentOperations(apartments);
  return { ...base, buildings: [...(base.buildings || []), ...mockExpansion.buildings.filter((b) => !(base.buildings || []).some((item) => item.id === b.id))], apartments: operations.apartments, people: [...(base.people || []), ...mockExpansion.people.filter((p) => !(base.people || []).some((item) => item.id === p.id))], events: [...(base.events || []), ...bulkEvents.filter((event) => !(base.events || []).some((item) => item.id === event.id))], bills: [...(base.bills || []), ...bulkBills.filter((bill) => !(base.bills || []).some((item) => item.id === bill.id))], maintenance: [...(base.maintenance || []), ...operations.maintenance.filter((item) => !(base.maintenance || []).some((existing) => existing.id === item.id))] };
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
        ) : tab === 'Pinui-Binui' ? (
          <RenewalView data={data} />
        ) : tab === 'Finance' ? (
          <FinanceView data={data} />
        ) : tab === 'Maintenance' ? (
          <MaintenanceView data={data} onApartment={(apartment) => { setSelected(apartment); }} />
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
function RenewalView({ data }) {
  const reps = { b1: { name: 'Maya Cohen', status: 'Confirmed' }, b2: { name: 'Needed', status: 'Find representative' }, b3: { name: 'Roni Gil', status: 'Confirmed' }, b4: { name: 'Needed', status: 'Contact owners' }, b5: { name: 'Amit Ronen', status: 'Confirmed' }, b6: { name: 'Needed', status: 'Waiting for nomination' }, b7: { name: 'Needed', status: 'Contact owners' }, b8: { name: 'Needed', status: 'Find representative' } };
  const getStats = (building) => { const apartments = data.apartments.filter((apartment) => apartment.buildingId === building.id); const signed = apartments.filter((apartment) => ['Amidar', 'HD'].includes(apartment.ownerName)).length; const no = apartments.filter((apartment) => apartment.ownerName === 'MR').length; const pending = Math.max(0, apartments.length - signed - no); const owners = [...new Set(apartments.filter((apartment) => !['Amidar', 'HD'].includes(apartment.ownerName)).map((apartment) => apartment.ownerName || 'Individual owner'))]; return { apartments, signed, no, pending, owners, percent: apartments.length ? Math.round(signed / apartments.length * 100) : 0 }; };
  return <section className="renewal-view"><div className="renewal-header"><div><div className="eyebrow">URBAN RENEWAL TRACKER</div><h2>Pinui-Binui readiness</h2><p>Track owner signatures and representatives across the portfolio.</p></div><div className="renewal-summary"><b>{data.buildings.reduce((sum, building) => sum + getStats(building).signed, 0)}</b><span>signed apartments</span></div></div><div className="renewal-legend"><span><i className="signed-key" />Signed</span><span><i className="no-key" />Said no</span><span><i className="pending-key" />Still needed</span></div><div className="renewal-grid">{data.buildings.map((building) => { const stats = getStats(building); const rep = reps[building.id] || { name: 'Needed', status: 'Find representative' }; return <article className="renewal-card" key={building.id}><div className="renewal-card-head"><div><h3>{building.name}</h3><p>{building.address || building.area} · {building.units} apartments</p></div><strong>{stats.percent}%</strong></div><div className="signature-bar"><i className="signed-bar" style={{ width: `${stats.signed / Math.max(building.units, 1) * 100}%` }} /><i className="no-bar" style={{ width: `${stats.no / Math.max(building.units, 1) * 100}%` }} /></div><div className="signature-counts"><span><b>{stats.signed}</b> signed</span><span><b>{stats.no}</b> said no</span><span><b>{stats.pending}</b> pending</span></div><div className={`representative ${rep.name === 'Needed' ? 'needed' : 'ready'}`}><span>Representative</span><b>{rep.name}</b><small>{rep.status}</small></div><div className="outreach"><b>Owner outreach</b>{stats.owners.slice(0, 4).map((owner) => <span key={owner}>{owner} · {['Amidar', 'HD'].includes(owner) ? 'signed' : 'contact needed'}</span>)}</div></article>; })}</div></section>;
}
function LegacyFinanceView({ data }) {
  const [range, setRange] = useState('6 months'); const [group, setGroup] = useState('Building'); const [chart, setChart] = useState('Net cash flow');
  const months = range === '12 months' ? ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] : ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const apartments = data.apartments || []; const bills = data.bills || []; const maintenance = data.maintenance || [];
  const monthly = months.map((month, index) => { const income = apartments.reduce((sum, apartment) => sum + (apartment.status === 'Leased' ? Number(apartment.rent || 0) : 0), 0) * (0.91 + index * 0.018); const costs = (bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0) + maintenance.reduce((sum, item) => sum + Number(item.cost || 0), 0)) / (range === '12 months' ? 2 : 1) * (0.88 + index * 0.025); return { month, income: Math.round(income), costs: Math.round(costs), net: Math.round(income - costs) }; });
  const totalIncome = monthly.reduce((sum, item) => sum + item.income, 0); const totalCosts = monthly.reduce((sum, item) => sum + item.costs, 0); const occupancy = apartments.length ? Math.round(apartments.filter((a) => a.status === 'Leased').length / apartments.length * 100) : 0; const maxValue = Math.max(...monthly.map((item) => Math.max(item.income, item.costs)));
  const categories = ['Water', 'Electricity', 'Vaad', 'Arnona', 'Gas', 'Maintenance'].map((category) => ({ category, amount: category === 'Maintenance' ? maintenance.reduce((sum, item) => sum + Number(item.cost || 0), 0) : bills.filter((bill) => bill.category === category).reduce((sum, bill) => sum + Number(bill.amount || 0), 0) })).sort((a, b) => b.amount - a.amount);
  const groups = group === 'Building' ? data.buildings.map((building) => ({ name: building.name, value: apartments.filter((a) => a.buildingId === building.id).reduce((sum, a) => sum + Number(a.rent || 0), 0) })) : apartments.slice(0, 12).map((apartment) => ({ name: apartment.number, value: Number(apartment.rent || 0) }));
  const projection = Math.round((apartments.reduce((sum, apartment) => sum + Number(apartment.rent || 0), 0)) * 1.08);
  const expiringSoon = apartments.filter((apartment) => apartment.status === 'Leased').slice(0, 4); const vacant = apartments.filter((apartment) => apartment.status === 'Vacant'); const startingSoon = apartments.filter((apartment) => apartment.status === 'On market').slice(0, 4); const unleasable = apartments.filter((apartment, index) => apartment.status === 'Vacant' && index % 3 === 0).slice(0, 4); const buildingName = (apartment) => data.buildings.find((building) => building.id === apartment.buildingId)?.name || 'Unknown building';
  return <section className="finance-dashboard"><div className="finance-controls"><div><h2>Portfolio finance</h2><p>Income, costs, and rental growth across all properties</p></div><div><button className={range === '6 months' ? 'control active' : 'control'} onClick={() => setRange('6 months')}>6 months</button><button className={range === '12 months' ? 'control active' : 'control'} onClick={() => setRange('12 months')}>12 months</button></div></div><div className="finance-kpis"><div className="finance-kpi income"><span>Projected monthly rent</span><b>{money(projection)}</b><small>↑ 8% next period</small></div><div className="finance-kpi expense"><span>Average monthly costs</span><b>{money(Math.round(totalCosts / months.length))}</b><small>utilities + maintenance</small></div><div className="finance-kpi net"><span>Net operating income</span><b>{money(totalIncome - totalCosts)}</b><small>{occupancy}% portfolio occupancy</small></div><div className="finance-kpi neutral"><span>Rent collection gap</span><b>{money(apartments.filter((a) => a.status !== 'Leased').reduce((sum, a) => sum + Number(a.rent || 0), 0))}</b><small>vacant / on market</small></div></div><div className="finance-grid"><div className="panel finance-chart"><div className="panel-head"><div><h2>{chart}</h2><p>Interactive historical view · click a metric</p></div><div><button className={chart === 'Net cash flow' ? 'chart-toggle active' : 'chart-toggle'} onClick={() => setChart('Net cash flow')}>Net</button><button className={chart === 'Income vs costs' ? 'chart-toggle active' : 'chart-toggle'} onClick={() => setChart('Income vs costs')}>Income / costs</button></div></div><div className="chart-area">{monthly.map((item) => <div className="chart-column" key={item.month}><div className="bars">{chart === 'Income vs costs' ? <><i className="bar income-bar" style={{ height: `${item.income / maxValue * 155}px` }} title={money(item.income)} /><i className="bar cost-bar" style={{ height: `${item.costs / maxValue * 155}px` }} title={money(item.costs)} /></> : <i className="bar net-bar" style={{ height: `${Math.abs(item.net) / maxValue * 155}px` }} title={money(item.net)} />}</div><span>{item.month}</span></div>)}</div><div className="chart-legend"><span><i className="income-dot" />Income</span><span><i className="cost-dot" />Costs</span><span><i className="net-dot" />Net</span></div></div><div className="panel finance-chart"><div className="panel-head"><div><h2>Costs by category</h2><p>Portfolio spend</p></div></div><div className="category-list">{categories.map((item) => <div className="category-row" key={item.category}><span>{item.category}</span><div><i style={{ width: `${Math.max(5, item.amount / Math.max(categories[0].amount, 1) * 100)}%` }} /></div><b>{money(item.amount)}</b></div>)}</div></div></div><div className="finance-grid"><div className="panel finance-chart"><div className="panel-head"><div><h2>Rent roll by {group.toLowerCase()}</h2><p>Compare income concentration</p></div><div><button className={group === 'Building' ? 'chart-toggle active' : 'chart-toggle'} onClick={() => setGroup('Building')}>Building</button><button className={group === 'Apartment' ? 'chart-toggle active' : 'chart-toggle'} onClick={() => setGroup('Apartment')}>Apartment</button></div></div><div className="horizontal-bars">{groups.map((item) => <div className="horizontal-row" key={item.name}><span>{item.name}</span><div><i style={{ width: `${item.value / Math.max(...groups.map((g) => g.value), 1) * 100}%` }} /></div><b>{money(item.value)}</b></div>)}</div></div><div className="panel finance-chart projection-card"><div className="eyebrow">RENTAL OUTLOOK</div><h2>Projected rent growth</h2><p className="muted">Based on current rent roll and an 8% annual growth assumption.</p><div className="projection-value">{money(projection)}<small>next 12-month run rate</small></div><div className="projection-line"><span>Current</span><i /><b>+8%</b><i /><span>Projected</span></div><div className="finance-totals"><span>Current annual <b>{money(totalIncome)}</b></span><span>Projected annual <b>{money(projection * 12)}</b></span><span>Growth <b>8%</b></span></div></div></div></section>;
}
function FinanceView({ data }) {
  const apartments = data.apartments || []; const expiringSoon = apartments.filter((apartment) => apartment.status === 'Leased').slice(0, 4); const vacant = apartments.filter((apartment) => apartment.status === 'Vacant'); const startingSoon = apartments.filter((apartment) => apartment.status === 'On market').slice(0, 4); const unleasable = apartments.filter((apartment, index) => apartment.status === 'Vacant' && index % 3 === 0).slice(0, 4); const buildingName = (apartment) => data.buildings.find((building) => building.id === apartment.buildingId)?.name || 'Unknown building';
  return <><section className="leasing-health"><div className="leasing-health-head"><div><h2>Leasing health</h2><p>Operational signals for the next leasing cycle</p></div><span>Live from apartment records</span></div><div className="leasing-cards"><div className="lease-card expiring"><b>{expiringSoon.length}</b><span>Leases expiring soon</span><small>Review renewals and notices</small></div><div className="lease-card vacant"><b>{vacant.length}</b><span>Vacant apartments</span><small>Income gap: {money(vacant.reduce((sum, apartment) => sum + Number(apartment.rent || 0), 0))}</small></div><div className="lease-card starting"><b>{startingSoon.length}</b><span>Leases starting soon</span><small>Prepare handovers and deposits</small></div><div className="lease-card poor"><b>{unleasable.length}</b><span>Needs investment review</span><small>Unleasable / low-return candidates</small></div></div><div className="leasing-watchlist">{[...expiringSoon.slice(0, 2), ...vacant.slice(0, 1), ...unleasable.slice(0, 1)].map((apartment, index) => <div className="watch-row" key={`${apartment.id}-${index}`}><div><b>{apartment.number}</b><small>{buildingName(apartment)} · {apartment.ownerName || 'Individual owner'}</small></div><span className={apartment.status === 'Vacant' ? 'watch-warning' : 'watch-neutral'}>{apartment.status === 'Vacant' ? 'Vacant review' : apartment.status === 'Leased' ? 'Renewal review' : 'Investment review'}</span><strong>{money(apartment.rent)}</strong></div>)}</div></section><LegacyFinanceView data={data} /> </>;
}
function MaintenanceView({ data }) {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All'); const [selectedApartment, setSelectedApartment] = useState(null);
  const apartments = data.apartments || []; const buildings = data.buildings || [];
  const matches = (item) => `${item.title || ''} ${item.category || ''} ${item.technician || ''}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'All' || item.category === filter);
  const editNotes = (item) => { const notes = window.prompt('Edit maintenance notes', item.notes || ''); if (notes !== null) item.notes = notes; };
  return <section className="panel maintenance-view"><div className="panel-head"><div><h2>Maintenance & bills</h2><p>Recent work, operational expenses, and utility payments</p></div><div className="maintenance-filters"><input className="search" placeholder="Search maintenance..." value={query} onChange={(e) => setQuery(e.target.value)} /><select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option><option>Maintenance</option><option>Inspection</option><option>Renovation</option><option>Appliance</option></select></div></div><h3>Maintenance records</h3><div className="maintenance-table">{data.maintenance.filter(matches).map((item) => { const apartment = apartments.find((a) => a.id === item.apartmentId); const building = buildings.find((b) => b.id === apartment?.buildingId); return <div className="maintenance-row" key={item.id}><div><b>{item.title}</b><small>{item.category} · {item.date} · {item.technician}</small><em>{item.notes}</em></div><button className="link-button" onClick={() => apartment && setSelectedApartment(apartment)}>{building?.name} · Apt {apartment?.number}</button><strong>{money(item.cost)}</strong><span className={`maintenance-status ${item.status === 'Done' ? 'done' : 'progress'}`}>{item.status}</span><button className="edit-notes" onClick={() => editNotes(item)}>Edit notes</button></div>})}</div><h3>Recent paid bills</h3><div className="maintenance-table">{data.bills.filter((bill) => bill.status === 'Paid' && (filter === 'All' || filter === bill.category) && `${bill.category} ${bill.period}`.toLowerCase().includes(query.toLowerCase())).map((bill) => { const apartment = apartments.find((a) => a.id === bill.apartmentId); const building = buildings.find((b) => b.id === apartment?.buildingId); return <div className="maintenance-row bill-row" key={bill.id}><div><b>{bill.category}</b><small>{bill.period} · due {bill.dueDate} · Paid</small></div><button className="link-button" onClick={() => apartment && setSelectedApartment(apartment)}>{building?.name} · Apt {apartment?.number}</button><strong>{money(bill.amount)}</strong><span className="maintenance-status done">Paid</span></div>})}</div>{selectedApartment && <div className="drawer-backdrop" onClick={() => setSelectedApartment(null)}><div onClick={(event) => event.stopPropagation()}><ApartmentSidePanel apartment={selectedApartment} buildings={buildings} people={data.people} data={data} onClose={() => setSelectedApartment(null)} /></div></div>}</section>;
}
function ListView({ tab, data, selected, setSelected, onAdd, exportData, importData }) {
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
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
      <div className={tab === 'Apartments' ? 'building-groups' : 'record-grid'}>
        {tab === 'Apartments' ? data.buildings.map((building) => <section className="building-group" key={building.id}><div className="group-heading"><h3>{building.name}</h3><span>{data.apartments.filter((apartment) => apartment.buildingId === building.id).length} apartments</span></div><div className="record-grid">{data.apartments.filter((apartment) => apartment.buildingId === building.id).map((r) => <button className={`record-card owner-${String(r.ownerName || '').toLowerCase().replaceAll(' ', '-')}`} key={r.id} onClick={() => setSelectedApartment(r)}><b>{r.number}</b><span>{r.ownerName || 'Individual owner'} · {r.status}</span><small>{r.tenantName || 'No tenant'} · {money(r.rent)}</small></button>)}</div></section>) : rows.map((r) => (
          <button
            className="record-card"
            key={r.id}
            onClick={() => { if (tab === 'Buildings') { setSelected(r); setSelectedBuilding(r); } if (tab === 'Apartments') setSelectedApartment(r); if (tab === 'People') setSelectedPerson(r); }}
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
      {selectedApartment && <div className="drawer-backdrop" onClick={() => setSelectedApartment(null)}><div onClick={(event) => event.stopPropagation()}><ApartmentSidePanel apartment={selectedApartment} buildings={data.buildings} people={data.people} data={data} onClose={() => setSelectedApartment(null)} /></div></div>}
      {selectedBuilding && !selectedApartment && <div className="drawer-backdrop" onClick={() => setSelectedBuilding(null)}><div onClick={(event) => event.stopPropagation()}><BuildingDrawer building={selectedBuilding} apartments={data.apartments} onApartment={setSelectedApartment} onClose={() => setSelectedBuilding(null)} /></div></div>}
      {selectedPerson && <PersonDetails person={selectedPerson} apartments={data.apartments} buildings={data.buildings} onClose={() => setSelectedPerson(null)} />}
    </section>
  );
}
function BuildingDrawer({ building, apartments, onApartment, onClose }) {
  const items = apartments.filter((apartment) => apartment.buildingId === building.id);
  return <aside className="side-drawer building-drawer"><button className="close" onClick={onClose}>×</button><div className="eyebrow">BUILDING</div><h2>{building.name}</h2><p className="muted">{building.area} · {building.units} apartments · {building.floors} floors</p><div className="drawer-summary"><b>{items.length}</b><span>loaded apartments</span></div><h3>Apartment register</h3>{items.map((apartment) => <button className={`drawer-apartment owner-${String(apartment.ownerName || '').toLowerCase().replaceAll(' ', '-')}`} key={apartment.id} onClick={() => onApartment(apartment)}><span><b>{apartment.number}</b><small>{apartment.ownerName || 'Individual owner'}</small></span><span><b>{apartment.status}</b><small>{apartment.tenantName || 'No tenant'}</small></span><strong>{money(apartment.rent)}</strong></button>)}</aside>;
}
function LegacyApartmentSidePanel({ apartment, buildings, people = [], data, onClose }) {
  const building = buildings.find((item) => item.id === apartment.buildingId);
  const related = people.filter((person) => person.apartmentIds?.includes(apartment.id));
  const events = (data.events || []).filter((event) => event.apartmentId === apartment.id);
  const bills = (data.bills || []).filter((bill) => bill.apartmentId === apartment.id);
  const monthlyTotal = events.reduce((sum, event) => sum + Number(event.cost || 0), 0) + bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  return <aside className="side-drawer apartment-drawer"><button className="close" onClick={onClose}>×</button><div className="eyebrow">APARTMENT DETAILS</div><h2>{apartment.number} · {building?.name}</h2><p className="muted">{apartment.status} · {money(apartment.rent)} per month</p><div className="detail-grid"><div><span>Owner</span><b>{apartment.ownerName || related.find((p) => p.role === 'Owner')?.name || 'Not added'}</b></div><div><span>Tenant</span><b>{apartment.tenantName || related.find((p) => p.role === 'Tenant')?.name || 'Not added'}</b></div><div><span>Rental period</span><b>{apartment.leaseStart || '—'} to {apartment.leaseEnd || '—'}</b></div><div><span>Contract</span><b><a href={apartment.contractUrl || '#'} onClick={(event) => !apartment.contractUrl && event.preventDefault()}>{apartment.contractUrl ? 'Open PDF' : 'PDF to be added'}</a></b></div></div><div className="cost-total"><span>June total costs</span><b>{money(monthlyTotal)}</b><small>Annual view: {money(monthlyTotal * 12)}</small></div><h3>Recent events</h3>{events.map((event) => <div className="event-row" key={event.id}><div><b>{event.title}</b><small>{event.type} · {event.date}</small></div><strong>{money(event.cost)}</strong></div>)}{!events.length && <p className="muted">No events recorded yet.</p>}<h3>Bills</h3>{bills.map((bill) => <div className="event-row" key={bill.id}><div><b>{bill.category}</b><small>{bill.period} · due {bill.dueDate} · {bill.status}</small></div><strong>{money(bill.amount)}</strong></div>)}</aside>;
}
function FinancialSummary({ rent, bills, events }) {
  const expenses = bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0) + events.reduce((sum, event) => sum + Number(event.cost || 0), 0);
  const history = [0.91, 0.96, 1.03, 0.98, 1.08, 1].map((factor, index) => ({ month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index], income: Math.round(rent * factor), expense: Math.round(expenses * (0.88 + index * 0.03)) }));
  const current = history[history.length - 1]; const previous = history[history.length - 2]; const change = Math.round(((current.income - previous.income) / previous.income) * 100); const annualIncome = history.reduce((sum, month) => sum + month.income, 0); const annualExpense = history.reduce((sum, month) => sum + month.expense, 0);
  return <div className="financial-summary"><div className="finance-head"><h3>Monthly cash flow</h3><span>{change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs May</span></div><div className="finance-cards"><div className="income"><small>Rent coming in</small><b>{money(current.income)}</b></div><div className="expense"><small>Costs going out</small><b>{money(current.expense)}</b></div></div><div className="finance-history">{history.map((month) => <div key={month.month}><span>{month.month}</span><i style={{ height: `${Math.max(8, month.income / rent * 30)}px` }} /><em style={{ height: `${Math.max(6, month.expense / Math.max(expenses, 1) * 30)}px` }} /></div>)}</div><div className="finance-totals"><span>6-month income <b>{money(annualIncome)}</b></span><span>6-month costs <b>{money(annualExpense)}</b></span><span>Net ratio <b>{Math.round(((annualIncome - annualExpense) / annualIncome) * 100)}%</b></span></div></div>;
}
function ApartmentSidePanel({ apartment, buildings, people = [], data, onClose }) {
  const building = buildings.find((item) => item.id === apartment.buildingId); const related = people.filter((person) => person.apartmentIds?.includes(apartment.id)); const events = (data.events || []).filter((event) => event.apartmentId === apartment.id); const bills = (data.bills || []).filter((bill) => bill.apartmentId === apartment.id);
  return <aside className="side-drawer apartment-drawer"><button className="close" onClick={onClose}>×</button><div className="eyebrow">APARTMENT DETAILS</div><h2>{apartment.number} · {building?.name}</h2><p className="muted">{apartment.status} · {money(apartment.rent)} per month</p><div className="detail-grid"><div><span>Owner</span><b>{apartment.ownerName || related.find((p) => p.role === 'Owner')?.name || 'Not added'}</b></div><div><span>Tenant</span><b>{apartment.tenantName || related.find((p) => p.role === 'Tenant')?.name || 'Not added'}</b></div><div><span>Rental period</span><b>{apartment.leaseStart || '—'} to {apartment.leaseEnd || '—'}</b></div><div><span>Contract</span><b><a href={apartment.contractUrl || '#'} onClick={(event) => !apartment.contractUrl && event.preventDefault()}>{apartment.contractUrl ? 'Open PDF' : 'PDF to be added'}</a></b></div></div><FinancialSummary rent={apartment.rent} bills={bills} events={events} /><h3>Recent events</h3>{events.map((event) => <div className="event-row" key={event.id}><div><b>{event.title}</b><small>{event.type} · {event.date}</small></div><strong>{money(event.cost)}</strong></div>)}{!events.length && <p className="muted">No events recorded yet.</p>}<h3>Bills</h3>{bills.map((bill) => <div className="event-row" key={bill.id}><div><b>{bill.category}</b><small>{bill.period} · due {bill.dueDate} · {bill.status}</small></div><strong>{money(bill.amount)}</strong></div>)}</aside>;
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
