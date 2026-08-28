/**
 * Canvas chart drawing — verbatim port of LPCharts from assets/js/charts.js.
 * Kept pixel-exact so visual parity with the static-HTML prototype holds.
 *
 * Brand colors come from src/lib/brand.js so the chart palette stays in
 * lock-step with the CSS token system.
 */
import { brand } from './brand.js';

function setup(canvas) {
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 600;
  const h = 250;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

export function line(canvas, values, labels) {
  const s = setup(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  const p = { l: 42, r: 18, t: 18, b: 34 };
  const max = Math.max(...values) * 1.12;
  ctx.strokeStyle = '#e3e6eb';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = p.t + ((h - p.t - p.b) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(p.l, y);
    ctx.lineTo(w - p.r, y);
    ctx.stroke();
  }
  ctx.strokeStyle = brand.secondary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  values.forEach((v, i) => {
    const xx = p.l + ((w - p.l - p.r) * i) / (values.length - 1);
    const yy = h - p.b - ((h - p.t - p.b) * v) / max;
    if (i) ctx.lineTo(xx, yy);
    else ctx.moveTo(xx, yy);
  });
  ctx.stroke();
  ctx.fillStyle = brand.secondary;
  values.forEach((v, i) => {
    const xx = p.l + ((w - p.l - p.r) * i) / (values.length - 1);
    const yy = h - p.b - ((h - p.t - p.b) * v) / max;
    ctx.beginPath();
    ctx.arc(xx, yy, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#5b6572';
  ctx.font = '11px Arial';
  labels.forEach((l, i) => {
    const xx = p.l + ((w - p.l - p.r) * i) / (labels.length - 1);
    ctx.fillText(l, xx - 8, h - 10);
  });
}

export function bars(canvas, values, labels) {
  const s = setup(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  const p = { l: 35, r: 12, t: 18, b: 42 };
  const max = Math.max(...values) * 1.15;
  const bw = ((w - p.l - p.r) / values.length) * 0.55;
  ctx.strokeStyle = '#e3e6eb';
  for (let i = 0; i < 5; i++) {
    const y = p.t + ((h - p.t - p.b) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(p.l, y);
    ctx.lineTo(w - p.r, y);
    ctx.stroke();
  }
  values.forEach((v, i) => {
    const slot = (w - p.l - p.r) / values.length;
    const xx = p.l + slot * i + (slot - bw) / 2;
    const hh = ((h - p.t - p.b) * v) / max;
    const yy = h - p.b - hh;
    ctx.fillStyle = i === 0 ? brand.secondary : brand.accentTeal;
    ctx.fillRect(xx, yy, bw, hh);
    ctx.fillStyle = '#10141a';
    ctx.font = 'bold 11px Arial';
    ctx.fillText(v.toLocaleString(), xx, yy - 5);
    ctx.fillStyle = '#5b6572';
    ctx.font = '10px Arial';
    ctx.fillText(labels[i].slice(0, 12), xx, h - 12);
  });
}

export function donut(canvas, values, labels) {
  const s = setup(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  const total = values.reduce((a, b) => a + b, 0);
  const cx = w * 0.38;
  const cy = h * 0.47;
  const r = 72;
  const cols = [
    brand.secondary,
    brand.accentTeal,
    brand.accentTealLight,
    brand.warning,
    brand.danger,
  ];
  let a = -Math.PI / 2;
  values.forEach((v, i) => {
    const b = a + (v / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, a, b);
    ctx.arc(cx, cy, r * 0.55, b, a, true);
    ctx.closePath();
    ctx.fillStyle = cols[i % cols.length];
    ctx.fill();
    a = b;
  });
  ctx.font = '11px Arial';
  labels.forEach((l, i) => {
    ctx.fillStyle = cols[i % cols.length];
    ctx.fillRect(w * 0.72, 45 + i * 26, 10, 10);
    ctx.fillStyle = '#5b6572';
    ctx.fillText(l, w * 0.72 + 16, 54 + i * 26);
  });
}
