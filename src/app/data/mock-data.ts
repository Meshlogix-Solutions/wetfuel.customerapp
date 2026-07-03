export interface CustomerLocation { id: string; name: string; address: string; distance?: string; primary?: boolean; }
export interface Equipment { id: string; name: string; type: string; fuel: string; capacity: number; current: number; location: string; status: string; }
export interface CustomerOrder { id: string; status: string; date: string; time: string; gallons: number; fuel: string; location: string; equipment: string; eta?: string; total?: number; }
export interface Invoice { id: string; orderId: string; date: string; due: string; amount: number; status: string; }

export const LOCATIONS: CustomerLocation[] = [
  { id: 'LOC-101', name: 'Main Warehouse', address: '1840 Commerce Street, Dallas, TX 75201', distance: '6.2 mi', primary: true },
  { id: 'LOC-102', name: 'North Yard', address: '9210 Preston Road, Plano, TX 75024', distance: '18.4 mi' }
];

export const EQUIPMENT: Equipment[] = [
  { id: 'EQ-2048', name: 'Backup Generator Tank', type: 'Generator tank', fuel: 'Ultra-Low Sulfur Diesel', capacity: 1000, current: 32, location: 'Main Warehouse', status: 'Needs fuel' },
  { id: 'EQ-2054', name: 'Forklift Fuel Tank', type: 'Storage tank', fuel: 'Off-road Diesel', capacity: 500, current: 74, location: 'Main Warehouse', status: 'Healthy' },
  { id: 'EQ-2102', name: 'North Yard Generator', type: 'Generator tank', fuel: 'Ultra-Low Sulfur Diesel', capacity: 750, current: 48, location: 'North Yard', status: 'Monitor' }
];

export const ORDERS: CustomerOrder[] = [
  { id: 'WF-78312', status: 'Driver en route', date: 'Jul 3, 2026', time: '10:30 AM–12:00 PM', gallons: 500, fuel: 'Ultra-Low Sulfur Diesel', location: 'Main Warehouse', equipment: 'Backup Generator Tank', eta: '24 min', total: 1948.25 },
  { id: 'WF-78196', status: 'Scheduled', date: 'Jul 8, 2026', time: '8:00 AM–10:00 AM', gallons: 300, fuel: 'Off-road Diesel', location: 'Main Warehouse', equipment: 'Forklift Fuel Tank', total: 1097.40 },
  { id: 'WF-77842', status: 'Completed', date: 'Jun 24, 2026', time: '11:42 AM', gallons: 420, fuel: 'Ultra-Low Sulfur Diesel', location: 'North Yard', equipment: 'North Yard Generator', total: 1610.70 }
];

export const INVOICES: Invoice[] = [
  { id: 'INV-10482', orderId: 'WF-77842', date: 'Jun 24, 2026', due: 'Jul 24, 2026', amount: 1610.70, status: 'Open' },
  { id: 'INV-10351', orderId: 'WF-76510', date: 'May 29, 2026', due: 'Jun 28, 2026', amount: 2198.15, status: 'Paid' },
  { id: 'INV-10194', orderId: 'WF-74931', date: 'Apr 15, 2026', due: 'May 15, 2026', amount: 894.50, status: 'Paid' }
];
