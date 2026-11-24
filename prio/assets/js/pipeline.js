
(function () {
'use strict';
var box = document.getElementById('pipe');
if (!box) return;
var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var CLIP = { ball: 0.60, glow: 1.067, press: 1.10, end: 4.533, dur: 4.80 };

var REVEAL = 4100, TAIL = 1200, MIN_PERIOD = 10000;
var REPS = [
  { k: 'mesh', name: 'Mesh', rest: 'assets/pipeline/mesh_rest.jpg', restFb: 'assets/pipeline/mesh_still.jpg', press: 'assets/pipeline/mesh_press.mp4' },
  { k: 'points', name: 'Points', rest: 'assets/pipeline/points_rest.jpg', restFb: 'assets/pipeline/points_still.jpg', press: 'assets/pipeline/points_press.mp4' },
  { k: 'gauss', name: 'Gaussians', rest: 'assets/pipeline/gaussians_rest.jpg', restFb: 'assets/pipeline/gaussians_still.jpg', press: 'assets/pipeline/gaussians_press.mp4' }
];
var PRESS_FB = 'assets/pipeline/press.mp4', PRESS_FB_POSTER = 'assets/pipeline/press.jpg';

var $ = function (s) { return box.querySelector(s); };
var inImg = $('#pipeIn'), inLbl = $('#pipeInLbl'), outLbl = $('#pipeOutLbl'), vid = $('.pvid video'), svg = $('.pslab');
var pills = box.querySelectorAll('[data-rep]');
var cur = 0, auto = true, timers = [], running = false, manual = false, dragging = false, raf = 0;

var VB = { w: 400, h: 190 };
var O = [100, 18], E1 = [288, 0], E2 = [-94, 150], THK = 7;
function P(u, v) { return [O[0] + u * E1[0] + v * E2[0], O[1] + u * E1[1] + v * E2[1]]; }
function pts(list) { return list.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
function rounded(r) {
  var o = [], n = 8, cs = [[1 - r, r, -90], [1 - r, 1 - r, 0], [r, 1 - r, 90], [r, r, 180]];
  cs.forEach(function (c) { for (var i = 0; i <= n; i++) { var a = (c[2] + 90 * i / n) * Math.PI / 180; o.push(P(c[0] + r * Math.cos(a), c[1] + r * Math.sin(a))); } });
  return o;
}
function bez(t) {
  var p0 = [0.22, 0.70], p1 = [0.38, 0.06], p2 = [0.62, 1.04], p3 = [0.92, 0.26], s = 1 - t;
  return [s * s * s * p0[0] + 3 * s * s * t * p1[0] + 3 * s * t * t * p2[0] + t * t * t * p3[0],
          s * s * s * p0[1] + 3 * s * s * t * p1[1] + 3 * s * t * t * p2[1] + t * t * t * p3[1]];
}
function ln(c, p, q, extra) { return '<line class="' + c + '" x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"' + (extra || '') + '/>'; }
var N = 120, TR = [];
for (var i = 0; i <= N; i++) { var b = bez(i / N); TR.push(P(b[0], b[1])); }
(function slab() {
  var top = rounded(0.045), side = top.map(function (p) { return [p[0], p[1] + THK]; }), h = '';
  var a = P(0, 0), z = P(1, 1), s0 = TR[0], s1 = TR[N];
  h += '<defs><linearGradient id="slabG" gradientUnits="userSpaceOnUse" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + z[0] + '" y2="' + z[1] + '">' +
       '<stop offset="0" stop-color="#F4F1F8"/><stop offset=".55" stop-color="#E9EEF6"/><stop offset="1" stop-color="#DDE7F2"/></linearGradient>' +
       '<linearGradient id="trajG" gradientUnits="userSpaceOnUse" x1="' + s0[0] + '" y1="' + s0[1] + '" x2="' + s1[0] + '" y2="' + s1[1] + '">' +
       '<stop offset="0" stop-color="#E27D96"/><stop offset=".5" stop-color="#9B7CC4"/><stop offset="1" stop-color="#245A81"/></linearGradient>' +
       '<marker id="axH" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 z" fill="#245A81"/></marker></defs>';
  h += '<polygon class="sl-side" points="' + pts(side) + '"/>';
  h += '<polygon class="sl-top" points="' + pts(top) + '" fill="url(#slabG)"/>';
  for (var k = 1; k < 10; k++) {
    var u = k / 10;
    h += ln('sl-grid', P(u, 0.03), P(u, 0.97));
    h += ln('sl-grid', P(0.03, u), P(0.97, u));
  }
  var o = P(0.06, 0.9);
  h += ln('sl-ax', o, P(0.31, 0.9), ' marker-end="url(#axH)"');
  h += ln('sl-ax', o, P(0.06, 0.42), ' marker-end="url(#axH)"');
  h += '<circle class="sl-o" cx="' + o[0].toFixed(1) + '" cy="' + o[1].toFixed(1) + '" r="2.6"/>';
  h += '<polygon class="sl-glow" points="' + pts(top) + '"/>';
  h += '<polyline class="sl-traj" points="' + pts(TR) + '" stroke="url(#trajG)"/>';
  [[0, '#E27D96'], [0.34, '#B57AAE'], [0.67, '#8C7CC4'], [1, '#245A81']].forEach(function (w) {
    var p = TR[Math.round(w[0] * N)];
    h += '<circle class="sl-way" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.4" fill="' + w[1] + '"/>';
  });
  var L = P(0.43, 0.93), kx = E2[0] / E1[0], ky = E2[1] / E1[0];
  h += '<text class="sl-lbl" transform="matrix(1,0,' + kx.toFixed(3) + ',' + (ky * 1.25).toFixed(3) + ',' + L[0].toFixed(1) + ',' + L[1].toFixed(1) + ')">Lagrangian dynamics</text>';
  h += '<circle class="sl-halo" r="15" cx="0" cy="0"/><circle class="sl-hit" r="22" cx="0" cy="0"/><circle class="sl-dot" r="7.5" cx="0" cy="0"/>';
  svg.innerHTML = h;
})();
var dotEl = svg.querySelector('.sl-dot'), hitEl = svg.querySelector('.sl-hit'), haloEl = svg.querySelector('.sl-halo');
function setDot(s) {
  s = Math.max(0, Math.min(1, s));
  var f = s * N, i0 = Math.floor(f), i1 = Math.min(N, i0 + 1), t = f - i0;
  var x = TR[i0][0] + (TR[i1][0] - TR[i0][0]) * t, y = TR[i0][1] + (TR[i1][1] - TR[i0][1]) * t;
  dotEl.setAttribute('cx', x.toFixed(1)); dotEl.setAttribute('cy', y.toFixed(1));
  hitEl.setAttribute('cx', x.toFixed(1)); hitEl.setAttribute('cy', y.toFixed(1));
  haloEl.setAttribute('cx', x.toFixed(1)); haloEl.setAttribute('cy', y.toFixed(1));
}
function clipEnd() { var d = isFinite(vid.duration) && vid.duration > 0 ? vid.duration : CLIP.dur; return Math.min(CLIP.end, d); }
function clipS() {
  return (vid.currentTime - CLIP.press) / Math.max(0.1, clipEnd() - CLIP.press);
}
function follow() { raf = requestAnimationFrame(follow); if (!dragging) setDot(clipS()); }

function nearestS(e) {
  var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * VB.w / r.width, y = (e.clientY - r.top) * VB.h / r.height, best = 0, bd = 1e9;
  for (var i = 0; i <= N; i++) { var dx = TR[i][0] - x, dy = TR[i][1] - y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
  return { s: best / N, d: Math.sqrt(bd) };
}
function scrub(s) {
  s = Math.max(0, Math.min(1, s));
  try { vid.currentTime = CLIP.press + s * (clipEnd() - CLIP.press); } catch (err) {}
  setDot(s);
}
svg.addEventListener('pointerdown', function (e) {
  var n = nearestS(e);
  if (n.d > 34) return;
  e.preventDefault();
  dragging = true; manual = true; clear(); vid.pause();
  box.classList.add('run', 'dyn', 'grab', 'man'); box.classList.remove('cue');
  try { svg.setPointerCapture(e.pointerId); } catch (err) {}
  scrub(n.s);
});
svg.addEventListener('pointermove', function (e) { if (dragging) scrub(nearestS(e).s); });
function release() {
  if (!dragging) return;
  dragging = false; box.classList.remove('grab');
  if (!REDUCED) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
}
svg.addEventListener('pointerup', release); svg.addEventListener('pointercancel', release);
vid.addEventListener('ended', function () { if (manual && running) { manual = false; later(900, function () { cycle(false); }); } });

var flow = $('.pflow'), seed = 3;
function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
for (var j = 0; j < 18; j++) {
  var dd = document.createElement('i');
  dd.style.setProperty('--dx', ((rnd() - 0.5) * 70).toFixed(0) + 'px');
  dd.style.setProperty('--dy', ((rnd() - 0.5) * 90).toFixed(0) + 'px');
  dd.style.animationDelay = (rnd() * 0.7).toFixed(2) + 's';
  flow.appendChild(dd);
}
function placeFlow() {
  var b = box.getBoundingClientRect(), a = inImg.getBoundingClientRect(), p = svg.querySelector('.sl-top').getBoundingClientRect();
  if (!b.width) return;
  box.style.setProperty('--fx0', (a.left + a.width / 2 - b.left) + 'px');
  box.style.setProperty('--fy0', (a.top + a.height / 2 - b.top) + 'px');
  box.style.setProperty('--fx1', (p.left + p.width / 2 - b.left) + 'px');
  box.style.setProperty('--fy1', (p.top + p.height / 2 - b.top) + 'px');
}
window.addEventListener('resize', placeFlow);

function setRep(k) {
  var R = REPS[k];
  cur = k;
  pills.forEach(function (b, n) { b.classList.toggle('on', n === k); b.setAttribute('aria-selected', n === k); });
  inLbl.textContent = R.name; outLbl.textContent = R.name;
  inImg.onerror = function () { if (inImg.getAttribute('src') !== R.restFb) inImg.src = R.restFb; };
  inImg.src = R.resolvedRest || R.rest;
  inImg.onload = function () { R.resolvedRest = inImg.getAttribute('src'); placeFlow(); };
  vid.onerror = function () { if (vid.getAttribute('src') !== PRESS_FB) { vid.src = PRESS_FB; vid.poster = PRESS_FB_POSTER; } };
  vid.poster = R.resolvedRest || R.rest;
  vid.src = R.resolvedPress || R.press;
  vid.onloadeddata = function () { R.resolvedPress = vid.getAttribute('src'); };
}
function period() {
  var d = isFinite(vid.duration) && vid.duration > 0 ? vid.duration : CLIP.dur;
  return Math.max(MIN_PERIOD, REVEAL + d * 1000 + TAIL);
}
function clear() { timers.forEach(clearTimeout); timers = []; }
function later(ms, f) { timers.push(setTimeout(f, ms)); }
function cycle(first) {
  manual = false;
  if (!first && auto) setRep((cur + 1) % REPS.length);
  vid.pause(); try { vid.currentTime = 0; } catch (e) {}
  box.classList.remove('run', 'cue', 'dyn', 'man'); void box.offsetWidth; box.classList.add('run');
  placeFlow(); setDot(0);
  later(REVEAL, function () { var p = vid.play(); if (p && p.catch) p.catch(function () {}); });
  later(REVEAL + CLIP.ball * 1000, function () { box.classList.add('cue'); });
  later(REVEAL + CLIP.glow * 1000, function () { box.classList.remove('cue'); });
  later(REVEAL + CLIP.press * 1000, function () { box.classList.add('dyn'); });
  later(period(), function () { cycle(false); });
}
function start() { if (running) return; running = true; clear(); cycle(true); cancelAnimationFrame(raf); follow(); }
function stop() { running = false; clear(); cancelAnimationFrame(raf); box.classList.remove('run', 'cue', 'dyn', 'man'); vid.pause(); }
pills.forEach(function (b, n) {
  b.addEventListener('click', function () {
    auto = false; setRep(n);
    if (REDUCED) return;
    running = false; start();
  });
});
setRep(0); setDot(0);
vid.loop = false; vid.muted = true;
if (REDUCED) { box.classList.add('static'); vid.controls = true; cancelAnimationFrame(raf); follow(); return; }
if ('IntersectionObserver' in window) {
  new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); }); }, { threshold: 0.3 }).observe(box);
} else start();
window.PRIO_pipeState = function () { return { rep: REPS[cur].k, cls: box.className, period: period(), dot: [dotEl.getAttribute('cx'), dotEl.getAttribute('cy')] }; };
})();
