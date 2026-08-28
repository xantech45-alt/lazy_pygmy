/**
 * Verbatim port of LPStore from assets/js/storage.js.
 * Same key prefix `lp_`, same fallback-to-seed behavior.
 */
import { mockData } from '../data/mockData.js';

function key(k) {
  return 'lp_' + k;
}

export const localStorageStore = {
  get(keyName, fallback) {
    try {
      const v = localStorage.getItem(key(keyName));
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(keyName, value) {
    localStorage.setItem(key(keyName), JSON.stringify(value));
  },
  remove(keyName) {
    localStorage.removeItem(key(keyName));
  },
  getProducts() {
    return this.get('products', mockData.products);
  },
  saveProducts(v) {
    this.set('products', v);
  },
  getSuppliers() {
    return this.get('suppliers', mockData.suppliers);
  },
  saveSuppliers(v) {
    this.set('suppliers', v);
  },
  getWarehouses() {
    return this.get('warehouses', mockData.warehouses);
  },
  saveWarehouses(v) {
    this.set('warehouses', v);
  },
  getSchools() {
    return this.get('schools', mockData.schools);
  },
  saveSchools(v) {
    this.set('schools', v);
  },
  getOrders() {
    return this.get('orders', mockData.orders);
  },
  saveOrders(v) {
    this.set('orders', v);
  },
  getEmployees() {
    return this.get('employees', mockData.employees);
  },
  saveEmployees(v) {
    this.set('employees', v);
  },
  getRoles() {
    return this.get('roles', mockData.roles);
  },
  saveRoles(v) {
    this.set('roles', v);
  },
  getPurchaseOrders() {
    return this.get('purchaseOrders', mockData.purchaseOrders);
  },
  savePurchaseOrders(v) {
    this.set('purchaseOrders', v);
  },
  getReturnNotes() {
    return this.get('returnNotes', mockData.returnNotes || []);
  },
  saveReturnNotes(v) {
    this.set('returnNotes', v);
  },
  getTransfers() {
    return this.get('transfers', mockData.transfers || []);
  },
  saveTransfers(v) {
    this.set('transfers', v);
  },
  getAdjustments() {
    return this.get('adjustments', mockData.adjustments || []);
  },
  saveAdjustments(v) {
    this.set('adjustments', v);
  },
  getReceipts() {
    return this.get('receipts', mockData.receipts || []);
  },
  saveReceipts(v) {
    this.set('receipts', v);
  },
  getNotifications() {
    return this.get('notifications', mockData.notifications || []);
  },
  saveNotifications(v) {
    this.set('notifications', v);
  },
  /**
   * Notification preferences are stored as individual boolean flags at
   * `lp_notif_pref_<key>`. Keys are stable per the existing HTML prototype.
   */
  getNotifPref(key) {
    return this.get(`notif_pref_${key}`, null);
  },
  setNotifPref(key, value) {
    this.set(`notif_pref_${key}`, !!value);
  },
  getNotifPrefs(defaults) {
    const out = {};
    Object.keys(defaults).forEach((k) => {
      const v = this.getNotifPref(k);
      out[k] = v === null ? defaults[k] : v;
    });
    return out;
  },
  saveNotifPrefs(values) {
    Object.entries(values).forEach(([k, v]) => this.setNotifPref(k, v));
  },
};
