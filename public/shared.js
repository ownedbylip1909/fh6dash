'use strict';
const VW = 1600, VH = 900, TAU = Math.PI * 2;
const G_START = 150 * Math.PI / 180, G_SWEEP = 240 * Math.PI / 180;

let canvas, ctx;
let data = null, carDB = {};
let blinkOn = true;
setInterval(function() { blinkOn = !blinkOn; }, 90);

function resize() {
  const s = Math.min(window.innerWidth / VW, window.innerHeight / VH);
  canvas.width = VW; canvas.height = VH;
  canvas.style.width = (VW * s) + 'px';
  canvas.style.height = (VH * s) + 'px';
}

function valAngle(v, mn, mx) {
  return G_START + Math.max(0, Math.min(1, (v - mn) / (mx - mn))) * G_SWEEP;
}

function bezel(cx, cy, r, bw) {
  bw = bw || 11;
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, '#6a6a7a'); g.addColorStop(.25, '#ccccdd');
  g.addColorStop(.5, '#eeeeee'); g.addColorStop(.75, '#aaaabc'); g.addColorStop(1, '#444455');
  ctx.beginPath(); ctx.arc(cx, cy, r + bw, 0, TAU); ctx.fillStyle = g; ctx.fill();
}

function needle(cx, cy, r, angle, color, tipR, baseR) {
  color = color || '#ff1a00'; tipR = tipR || .83; baseR = baseR || .16;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle + Math.PI / 2);
  ctx.shadowColor = color; ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(0, r * baseR); ctx.lineTo(-3, r * .05); ctx.lineTo(-2, -r * tipR * .91);
  ctx.lineTo(0, -r * tipR); ctx.lineTo(2, -r * tipR * .91); ctx.lineTo(3, r * .05);
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.arc(0, 0, r * .062, 0, TAU);
  const h = ctx.createRadialGradient(0, -r * .015, 0, 0, 0, r * .062);
  h.addColorStop(0, '#ccc'); h.addColorStop(1, '#2a2a2a');
  ctx.fillStyle = h; ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

function neonNeedle(cx, cy, r, angle, color) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle + Math.PI / 2);
  ctx.shadowColor = color; ctx.shadowBlur = 22;
  ctx.beginPath(); ctx.moveTo(0, r * .14); ctx.lineTo(0, -r * .82);
  ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .045, 0, TAU);
  ctx.fillStyle = color; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
  ctx.restore();
}

function rrect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function txt(x, y, s, sz, col, align, weight, font) {
  align = align || 'center'; weight = weight || '400'; font = font || 'Arial';
  ctx.fillStyle = col;
  ctx.font = weight + ' ' + sz + 'px "' + font + '",sans-serif';
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(String(s), x, y);
}

function fmtLap(s) {
  if (!s || s <= 0) return '--:--.---';
  const m = Math.floor(s / 60), sc = Math.floor(s % 60), ms = Math.round((s % 1) * 1000);
  return m + ':' + String(sc).padStart(2, '0') + '.' + String(ms).padStart(3, '0');
}

const SL_N = 15, SL_Y = 46, SL_W = 28, SL_SX = VW / 2 - ((SL_N - 1) * SL_W) / 2;

function drawShiftLights(rpm, maxRpm) {
  const ratio = maxRpm > 0 ? rpm / maxRpm : 0, blink = ratio >= .97;
  for (let i = 0; i < SL_N; i++) {
    const x = SL_SX + i * SL_W, on = ratio >= .70 + (i / SL_N) * .30;
    let col = i < 5 ? (on ? '#33dd44' : '#0a1a0a') : i < 10 ? (on ? '#ffdd22' : '#1a1600') : (on ? '#ff3355' : '#1a0808');
    if (blink) col = blinkOn ? '#ff3355' : '#1a0808';
    ctx.beginPath(); ctx.arc(x, SL_Y, 10, 0, TAU);
    if (on || blink) { ctx.shadowColor = col; ctx.shadowBlur = 14; }
    ctx.fillStyle = col; ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke();
  }
}

function drawInfoBar(d) {
  const bh = 54, by = VH - bh;
  ctx.fillStyle = '#06080e'; ctx.fillRect(0, by, VW, bh);
  ctx.strokeStyle = '#14182a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, by); ctx.lineTo(VW, by); ctx.stroke();
  const cn = d ? (carDB[String(d.carOrdinal)] || ('#' + d.carOrdinal)) : '--';
  const cols = [
    ['FAHRZEUG', cn],
    ['LEISTUNG', d ? Math.round(d.powerHp) + ' PS' : '--'],
    ['DREHM.', d ? Math.round(d.torque) + ' Nm' : '--'],
    ['0–100', d && d.drag && d.drag.zeroToHundredTime ? d.drag.zeroToHundredTime.toFixed(2) + 's' : '--'],
    ['RUNDE', fmtLap(d && d.currentLap)]
  ];
  const cw = VW / cols.length;
  cols.forEach(function(pair, i) {
    const x = cw * i + cw / 2;
    txt(x, by + 14, pair[0], 9, '#2a3445');
    txt(x, by + 36, pair[1], 14, '#88aacc', 'center', '700', 'SF Mono');
  });
}

function connect() {
  const ws = new WebSocket('ws://' + location.host);
  ws.onopen = function() {};
  ws.onclose = function() { setTimeout(connect, 2000); };
  ws.onmessage = function(e) {
    const m = JSON.parse(e.data);
    if (m.type === 'cars') { carDB = m.cars; return; }
    data = m;
  };
}
