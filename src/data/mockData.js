/**
 * Verbatim port of assets/js/data.js → JS module exports.
 * No field names, no values, no entities changed. (AUDIT_REPORT.md §4.)
 */

export const products = [
  { sku: 'BK-0142', name: 'ABC Beginner Book', category: 'Books', warehouse: 'WH-01 Central', cost: 2.1, price: 3.5, qty: 1240, status: 'In Stock', supplier: 'Kakata Paper Mills', reorder: 200, reserved: 180, updated: '2 min ago' },
  { sku: 'BK-0148', name: 'My First Mathematics Book', category: 'Books', warehouse: 'WH-01 Central', cost: 2.4, price: 4.0, qty: 860, status: 'In Stock', supplier: 'Kakata Paper Mills', reorder: 200, reserved: 120, updated: '18 min ago' },
  { sku: 'BK-0151', name: 'Early Reading Level 1', category: 'Books', warehouse: 'WH-02 Paynesville', cost: 2.2, price: 3.75, qty: 640, status: 'In Stock', supplier: 'Atlantic Educational Supply', reorder: 150, reserved: 60, updated: '1 hr ago' },
  { sku: 'BK-0156', name: 'Science Discovery Book', category: 'Books', warehouse: 'WH-02 Paynesville', cost: 2.8, price: 4.6, qty: 112, status: 'Low Stock', supplier: 'Atlantic Educational Supply', reorder: 160, reserved: 40, updated: '1 hr ago' },
  { sku: 'PZ-0088', name: 'Animal Puzzle', category: 'Puzzles', warehouse: 'WH-01 Central', cost: 3.4, price: 5.75, qty: 86, status: 'Low Stock', supplier: 'Kakata Paper Mills', reorder: 120, reserved: 24, updated: '3 hrs ago' },
  { sku: 'PZ-0091', name: 'Numbers Puzzle', category: 'Puzzles', warehouse: 'WH-03 Gbarnga', cost: 3.2, price: 5.4, qty: 42, status: 'Low Stock', supplier: 'Kakata Paper Mills', reorder: 100, reserved: 0, updated: '4 hrs ago' },
  { sku: 'AC-0031', name: 'English Alphabet Flashcards', category: 'Alphabet Cards', warehouse: 'WH-01 Central', cost: 1.6, price: 2.9, qty: 0, status: 'Out of Stock', supplier: 'Monrovia Print Works', reorder: 150, reserved: 0, updated: '5 hrs ago' },
  { sku: 'AC-0037', name: 'Phonics Learning Cards', category: 'Alphabet Cards', warehouse: 'WH-02 Paynesville', cost: 1.8, price: 3.1, qty: 68, status: 'Low Stock', supplier: 'Monrovia Print Works', reorder: 120, reserved: 0, updated: '7 hrs ago' },
  { sku: 'GC-0057', name: 'Memory Matching Cards', category: 'Game Cards', warehouse: 'WH-02 Paynesville', cost: 2.0, price: 3.4, qty: 312, status: 'In Stock', supplier: 'Monrovia Print Works', reorder: 140, reserved: 40, updated: 'Today' },
  { sku: 'CB-0104', name: 'Handwriting Copybook', category: 'Copybooks', warehouse: 'WH-01 Central', cost: 0.9, price: 1.6, qty: 940, status: 'In Stock', supplier: 'Gbarnga Stationers', reorder: 250, reserved: 210, updated: 'Yesterday' },
];

export const suppliers = [
  { code: 'SUP-007', name: 'Kakata Paper Mills', location: 'Kakata, Margibi', contact: 'James Doe', terms: 'Net 30', products: 12, purchases: 18420, outstanding: 2140, rating: 4.6, status: 'Active' },
  { code: 'SUP-003', name: 'Monrovia Print Works', location: 'Monrovia, Montserrado', contact: 'Alice Johnson', terms: 'Net 15', products: 9, purchases: 14860, outstanding: 0, rating: 4.8, status: 'Active' },
  { code: 'SUP-011', name: 'Gbarnga Stationers', location: 'Gbarnga, Bong', contact: 'Rebecca Flomo', terms: 'Net 30', products: 7, purchases: 9240, outstanding: 1180, rating: 4.1, status: 'Active' },
  { code: 'SUP-015', name: 'Atlantic Educational Supply', location: 'Monrovia, Montserrado', contact: 'Samuel Cooper', terms: 'Net 45', products: 5, purchases: 7650, outstanding: 3420, rating: 3.6, status: 'Under Review' },
  { code: 'SUP-019', name: 'Buchanan Craft Supplies', location: 'Buchanan, Grand Bassa', contact: 'Martha Toe', terms: 'Prepaid', products: 4, purchases: 3980, outstanding: 0, rating: 4.4, status: 'Active' },
  { code: 'SUP-022', name: 'Voinjama Trading Co.', location: 'Voinjama, Lofa', contact: 'Joseph Kamara', terms: 'Net 30', products: 3, purchases: 2410, outstanding: 640, rating: 3.9, status: 'Inactive' },
];

export const warehouses = [
  { code: 'WH-01', name: 'Central Warehouse Monrovia', location: 'Bushrod Island, Monrovia, Montserrado', manager: 'Sarah Weah', units: 8940, capacity: 12000, value: 20140, status: 'Operational' },
  { code: 'WH-02', name: 'Paynesville Distribution Center', location: 'Paynesville, Montserrado', manager: 'Peter Sirleaf', units: 5720, capacity: 9000, value: 13120, status: 'Operational' },
  { code: 'WH-03', name: 'Gbarnga Regional Store', location: 'Gbarnga, Bong', manager: 'Martha Kollie', units: 3790, capacity: 5000, value: 9590, status: 'Operational' },
];

export const purchaseOrders = [
  { po: 'PO-2026-0119', supplier: 'Monrovia Print Works', raised: '7 Jan 2026', expected: '19 Jan 2026', items: 3, units: 800, value: 1440, received: 0, status: 'Pending Approval' },
  { po: 'PO-2026-0118', supplier: 'Gbarnga Stationers', raised: '6 Jan 2026', expected: '20 Jan 2026', items: 2, units: 660, value: 1254, received: 0, status: 'Pending Approval' },
  { po: 'PO-2026-0117', supplier: 'Kakata Paper Mills', raised: '5 Jan 2026', expected: '17 Jan 2026', items: 4, units: 1200, value: 3180, received: 740, status: 'Partially Received' },
  { po: 'PO-2026-0116', supplier: 'Atlantic Educational', raised: '4 Jan 2026', expected: '18 Feb 2026', items: 1, units: 320, value: 896, received: 0, status: 'Approved' },
  { po: 'PO-2026-0115', supplier: 'Buchanan Craft Supplies', raised: '3 Jan 2026', expected: '15 Jan 2026', items: 2, units: 240, value: 612, received: 0, status: 'Approved' },
  { po: 'PO-2026-0114', supplier: 'Monrovia Print Works', raised: '2 Jan 2026', expected: '14 Jan 2026', items: 3, units: 900, value: 1620, received: 0, status: 'Approved' },
  { po: 'PO-2026-0113', supplier: 'Kakata Paper Mills', raised: '2 Jan 2026', expected: '12 Jan 2026', items: 1, units: 180, value: 378, received: 0, status: 'Pending Approval' },
  { po: 'PO-2025-0112', supplier: 'Voinjama Trading Co.', raised: '30 Dec 2025', expected: '13 Jan 2026', items: 2, units: 140, value: 364, received: 0, status: 'Cancelled' },
  { po: 'PO-2025-0109', supplier: 'Kakata Paper Mills', raised: '27 Dec 2025', expected: '8 Jan 2026', items: 3, units: 800, value: 1680, received: 800, status: 'Received' },
  { po: 'PO-2025-0106', supplier: 'Gbarnga Stationers', raised: '22 Dec 2025', expected: '5 Jan 2026', items: 2, units: 520, value: 988, received: 520, status: 'Received' },
  { po: 'PO-2025-0101', supplier: 'Kakata Paper Mills', raised: '8 Dec 2025', expected: '20 Dec 2025', items: 2, units: 640, value: 1344, received: 640, status: 'Received' },
];

export const receipts = [
  {
    id: 'GRN-2025-0109',
    po: 'PO-2025-0109',
    supplier: 'Kakata Paper Mills',
    date: '8 Jan 2026',
    warehouse: 'WH-01 Central',
    receivedBy: 'Sarah Weah',
    deliveryNote: 'DN-KPM-7821',
    lines: [
      { sku: 'BK-0142', name: 'ABC Beginner Book', qtyOrdered: 800, qtyReceived: 800, unitCost: 2.1 },
      { sku: 'CB-0104', name: 'Handwriting Copybook', qtyOrdered: 600, qtyReceived: 600, unitCost: 0.9 },
    ],
  },
  {
    id: 'GRN-2025-0106',
    po: 'PO-2025-0106',
    supplier: 'Gbarnga Stationers',
    date: '5 Jan 2026',
    warehouse: 'WH-02 Paynesville',
    receivedBy: 'Peter Sirleaf',
    deliveryNote: 'DN-GBS-4453',
    lines: [
      { sku: 'CB-0104', name: 'Handwriting Copybook', qtyOrdered: 520, qtyReceived: 520, unitCost: 0.95 },
      { sku: 'AC-0037', name: 'Phonics Learning Cards', qtyOrdered: 200, qtyReceived: 200, unitCost: 1.8 },
    ],
  },
  {
    id: 'GRN-2025-0101',
    po: 'PO-2025-0101',
    supplier: 'Kakata Paper Mills',
    date: '20 Dec 2025',
    warehouse: 'WH-01 Central',
    receivedBy: 'Sarah Weah',
    deliveryNote: 'DN-KPM-7710',
    lines: [
      { sku: 'BK-0148', name: 'My First Mathematics Book', qtyOrdered: 640, qtyReceived: 640, unitCost: 2.4 },
    ],
  },
];

export const notifications = [
  { type: 'Stock', level: 'danger', title: 'Out of stock', text: 'English Alphabet Flashcards (AC-0031) reached 0 units at WH-01 Central Warehouse.', time: '8 min ago', unread: true },
  { type: 'Stock', level: 'warning', title: 'Low stock', text: 'Animal Puzzle (PZ-0088) is at 86 units, below its reorder level of 120.', time: '24 min ago', unread: true },
  { type: 'Orders', level: 'info', title: 'Order dispatched', text: 'ORD-2026-0083 left WH-02 for Bong Mission Kindergarten.', time: '1 hr ago', unread: true },
  { type: 'System', level: 'warning', title: 'Purchase order partially received', text: 'PO-2026-0117 — 740 of 1,200 units booked into WH-01.', time: '3 hrs ago', unread: true },
  { type: 'Orders', level: 'success', title: 'Payment recorded', text: '$1,284.00 received from St. Teresa Primary for ORD-2026-0084.', time: 'Yesterday', unread: true },
  { type: 'Stock', level: 'success', title: 'Stock transfer completed', text: 'TRF-2026-0042 moved 620 units from WH-01 to WH-02.', time: 'Yesterday', unread: false },
];

// Expanded screens from Lazy Pygmy UX specification v1.0
export const schools = [
  { code: 'SCH-052', name: 'St. Teresa Primary School', type: 'Primary', category: 'Public', county: 'Montserrado', contact: 'Sister Mary Toe', pupils: 640, orders: 12, spend: 4280, outstanding: 0, status: 'Active' },
  { code: 'SCH-061', name: 'Nimba Community School', type: 'Primary', category: 'Public', county: 'Nimba', contact: 'Grace Gonkerwon', pupils: 880, orders: 15, spend: 6120, outstanding: 2110, status: 'Active' },
  { code: 'SCH-074', name: 'Zwedru Model School', type: 'Secondary', category: 'Public', county: 'Grand Gedeh', contact: 'Emmanuel Saye', pupils: 1240, orders: 9, spend: 5640, outstanding: 0, status: 'Active' },
  { code: 'SCH-038', name: 'Buchanan Junior High', type: 'Secondary', category: 'Public', county: 'Grand Bassa', contact: 'Martha Nyanquoi', pupils: 760, orders: 7, spend: 3410, outstanding: 0, status: 'Active' },
  { code: 'SCH-045', name: 'Bong Mission Kindergarten', type: 'Kindergarten', category: 'Private', county: 'Bong', contact: 'Rev. John Kollie', pupils: 210, orders: 8, spend: 1840, outstanding: 742.5, status: 'Active' },
  { code: 'SCH-069', name: 'Voinjama Central School', type: 'Primary', category: 'Public', county: 'Lofa', contact: 'Joseph Kamara', pupils: 520, orders: 5, spend: 2180, outstanding: 640, status: 'Active' },
  { code: 'SCH-057', name: 'Kakata Nursery Academy', type: 'Nursery', category: 'Private', county: 'Margibi', contact: 'Patience Weah', pupils: 145, orders: 6, spend: 980, outstanding: 386.75, status: 'Overdue' },
];

export const orders = [
  { order: 'ORD-2026-0086', school: 'Nimba Community School', date: '7 Jan 2026', items: 5, units: 316, total: 948, payment: 'Unpaid', status: 'Processing', officer: 'Grace Doe' },
  { order: 'ORD-2026-0085', school: 'St. Teresa Primary School', date: '7 Jan 2026', items: 3, units: 180, total: 486, payment: 'Paid', status: 'Packed', officer: 'Grace Doe' },
  { order: 'ORD-2026-0084', school: 'St. Teresa Primary School', date: '6 Jan 2026', items: 6, units: 420, total: 1284, payment: 'Paid', status: 'Delivered', officer: 'Grace Doe' },
  { order: 'ORD-2026-0083', school: 'Bong Mission Kindergarten', date: '6 Jan 2026', items: 4, units: 210, total: 742.5, payment: 'Part. Paid', status: 'Dispatched', officer: 'Peter Sirleaf' },
  { order: 'ORD-2026-0082', school: 'Nimba Community School', date: '5 Jan 2026', items: 7, units: 640, total: 2110, payment: 'Unpaid', status: 'Processing', officer: 'Grace Doe' },
  { order: 'ORD-2026-0081', school: 'Kakata Nursery Academy', date: '4 Jan 2026', items: 2, units: 120, total: 386.75, payment: 'Overdue', status: 'Delivered', officer: 'Peter Sirleaf' },
];

export const employees = [
  { number: 'EMP-001', name: 'Moses Kollie', role: 'Administrator', department: 'Management', location: 'Head Office', phone: '+231 77 100 401', employed: 'Feb 2019', status: 'Active' },
  { number: 'EMP-003', name: 'Grace Kollie', role: 'Inventory Manager', department: 'Operations', location: 'Head Office', phone: '+231 77 214 880', employed: 'Aug 2019', status: 'Active' },
  { number: 'EMP-006', name: 'Sarah Weah', role: 'Warehouse Manager', department: 'Warehousing', location: 'WH-01 Central', phone: '+231 77 118 204', employed: 'Mar 2020', status: 'Active' },
  { number: 'EMP-008', name: 'Martha Cooper', role: 'Accountant', department: 'Finance', location: 'Head Office', phone: '+231 88 330 712', employed: 'Jun 2020', status: 'Active' },
  { number: 'EMP-009', name: 'Peter Sirleaf', role: 'Delivery Officer', department: 'Logistics', location: 'WH-02 Paynesville', phone: '+231 88 405 119', employed: 'Jan 2021', status: 'Active' },
  { number: 'EMP-011', name: 'James Kollie', role: 'Procurement Officer', department: 'Procurement', location: 'Head Office', phone: '+231 77 662 304', employed: 'Sep 2021', status: 'Active' },
  { number: 'EMP-014', name: 'Grace Doe', role: 'Sales Officer', department: 'Sales', location: 'Head Office', phone: '+231 88 517 226', employed: 'Apr 2022', status: 'Active' },
  { number: 'EMP-017', name: 'Emmanuel Toe', role: 'Warehouse Manager', department: 'Warehousing', location: 'WH-03 Gbarnga', phone: '+231 77 890 145', employed: 'Nov 2023', status: 'Active' },
  { number: 'EMP-019', name: 'Joseph Nyan', role: 'Storekeeper', department: 'Warehousing', location: 'WH-01 Central', phone: '+231 88 204 663', employed: 'Feb 2024', status: 'Suspended' },
];

export const roles = [
  { name: 'Administrator', count: 15, locked: true },
  { name: 'Inventory Manager', count: 10, locked: false },
  { name: 'Warehouse Manager', count: 6, locked: false },
  { name: 'Sales Officer', count: 5, locked: false },
  { name: 'Procurement Officer', count: 7, locked: false },
  { name: 'Accountant', count: 6, locked: false },
  { name: 'Storekeeper', count: 3, locked: false },
  { name: 'Delivery Officer', count: 3, locked: false },
  { name: 'Viewer', count: 3, locked: false },
];

export const mockData = {
  products,
  suppliers,
  warehouses,
  purchaseOrders,
  receipts,
  notifications,
  schools,
  orders,
  employees,
  roles,
};
