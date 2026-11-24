
(function () {
'use strict';
var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

var PICK_BOX = {"bunny": {"x": 46.25, "y": 23.75, "w": 7.344, "h": 19.861, "cx": 49.98, "cy": 34.258}, "bear": {"x": 69.844, "y": 57.083, "w": 18.125, "h": 37.083, "cx": 79.087, "cy": 75.917}, "laptop": {"x": 25.078, "y": 39.722, "w": 21.641, "h": 27.361, "cx": 33.807, "cy": 53.618}};
var PICK_HIT = {w: 160, h: 90, rle: "0:3437,1:1,0:5,1:1,0:152,1:3,0:3,1:3,0:150,1:5,0:1,1:5,0:149,1:11,0:150,1:10,0:150,1:9,0:152,1:7,0:153,1:7,0:152,1:8,0:153,1:7,0:152,1:8,0:151,1:9,0:151,1:10,0:149,1:12,0:148,1:12,0:123,3:12,0:13,1:11,0:116,3:21,0:13,1:9,0:116,3:22,0:14,1:7,0:117,3:22,0:138,3:22,0:138,3:23,0:137,3:23,0:138,3:22,0:138,3:22,0:138,3:22,0:138,3:23,0:138,3:22,0:138,3:22,0:138,3:22,0:138,3:24,0:136,3:27,0:51,2:4,0:78,3:30,0:47,2:12,0:72,3:30,0:45,2:17,0:68,3:31,0:44,2:18,0:67,3:31,0:44,2:19,0:67,3:29,0:45,2:20,0:68,3:22,0:50,2:20,0:70,3:15,0:56,2:19,0:72,3:9,0:60,2:18,0:75,3:2,0:65,2:17,0:144,2:16,0:143,2:16,0:142,2:17,0:142,2:19,0:140,2:21,0:138,2:23,0:136,2:25,0:134,2:27,0:133,2:27,0:133,2:28,0:133,2:27,0:133,2:28,0:131,2:29,0:131,2:29,0:131,2:28,0:132,2:27,0:133,2:25,0:136,2:10,0:1,2:14,0:136,2:8,0:4,2:12,0:137,2:7,0:4,2:12,0:139,2:4,0:6,2:11,0:149,2:10,0:151,2:8,0:155,2:4,0:825"};
var NAMES = ['bunny', 'bear', 'laptop'];

var SIM_MS = { bunny: 2.49, bear: 3.51, laptop: 1.75 };
var LABEL = { bunny: 'Bunny', bear: 'Teddy bear', laptop: 'Laptop' };

var hitMap = (function () {
  var a = new Uint8Array(PICK_HIT.w * PICK_HIT.h), k = 0;
  PICK_HIT.rle.split(',').forEach(function (p) { var s = p.split(':'), v = +s[0], n = +s[1]; for (var i = 0; i < n; i++) a[k++] = v; });
  return a;
})();
function hitAt(fx, fy) {
  var x = Math.floor(fx * PICK_HIT.w), y = Math.floor(fy * PICK_HIT.h);
  if (x < 0 || y < 0 || x >= PICK_HIT.w || y >= PICK_HIT.h) return null;
  var v = hitMap[y * PICK_HIT.w + x];
  return v ? NAMES[v - 1] : null;
}

var $ = function (id) { return document.getElementById(id); };
var stage = $('pkStage'), sec = $('pick');
if (!stage || !sec) return;
var cuts = {};
stage.querySelectorAll('.pk-cut').forEach(function (im) {
  var k = im.getAttribute('data-k'), b = PICK_BOX[k];
  im.style.left = b.x + '%'; im.style.top = b.y + '%'; im.style.width = b.w + '%'; im.style.height = b.h + '%';
  cuts[k] = im;
});
var vid = stage.querySelector('.pk-vid');
var hover = null, picked = null;

function light(k) {
  NAMES.forEach(function (n) { cuts[n].classList.toggle('on', n === k); });
  stage.classList.toggle('hl', !!k);
  stage.classList.toggle('hov', !!k);
}
stage.addEventListener('pointermove', function (e) {
  if (stage.classList.contains('playing') || stage.classList.contains('intro')) return;
  var r = stage.getBoundingClientRect();
  var k = hitAt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  if (k !== hover) { hover = k; light(k || picked); }
});
stage.addEventListener('pointerleave', function () { hover = null; light(stage.classList.contains('playing') ? null : picked); });
stage.addEventListener('click', function (e) {
  if (stage.classList.contains('intro')) { endIntro(); return; }
  if (stage.classList.contains('playing')) { closeClip(); return; }
  var r = stage.getBoundingClientRect();
  var k = hitAt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  if (k) pick(k);
});
document.querySelectorAll('[data-pk]').forEach(function (b) {
  b.addEventListener('click', function () { pick(b.getAttribute('data-pk')); });
});

var introDone = false;
var userPicked = false, stageSeen = false;
function endIntro() {
  if (introDone) return; introDone = true;
  if (USE3D && !REDUCED) setTimeout(function () { if (!userPicked && !picked && stageSeen) pick('bunny', true); }, 2600);
  stage.classList.remove('intro');
  $('pkTag').textContent = 'Generated world';
  setTimeout(function () { if (!stage.classList.contains('playing')) $('pkHint').textContent = 'Click an object'; }, REDUCED ? 0 : 1500);
}
if (REDUCED || !('IntersectionObserver' in window)) endIntro();
if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { stageSeen = e.isIntersecting; }); }, { threshold: 0.4 }).observe(stage);
if (!(REDUCED || !('IntersectionObserver' in window))) new IntersectionObserver(function (es, ob) {
  es.forEach(function (e) { if (e.isIntersecting) { ob.disconnect(); setTimeout(endIntro, 1100); } });
}, { threshold: 0.5 }).observe(stage);

function openClip(k) {
  vid.src = 'assets/world/' + k + '.mp4';
  vid.poster = 'assets/world/' + k + '.jpg';
  vid.controls = true;
  stage.classList.add('playing'); light(null);
  $('pkTag').textContent = LABEL[k] + ', rendered close-up';
  if (!REDUCED) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
}
function closeClip() {
  vid.pause(); stage.classList.remove('playing');
  $('pkTag').textContent = 'Generated world';
  $('pkHint').textContent = 'Click an object';
  light(picked);
}
vid.addEventListener('click', function (e) { e.stopPropagation(); });

function hasWebGL() {
  try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}
var USE3D = !REDUCED && hasWebGL();
if (!USE3D) sec.classList.add('pk-flat');
var loading = null;
function loadScripts(list, done) {
  var i = 0;
  (function next() {
    if (i >= list.length) { done(); return; }
    var s = document.createElement('script'); s.src = list[i++];
    s.onload = next; s.onerror = function () { sec.classList.add('pk-flat'); USE3D = false; };
    document.body.appendChild(s);
  })();
}
function ensure3D(cb) {
  if (window.THREE && window.THREE.OrbitControls && window.PRIO3D && window.PRIO3D.laptop) { cb(); return; }
  if (loading) { loading.push(cb); return; }
  loading = [cb];
  loadScripts(['assets/lib/three.js', 'assets/lib/three-orbit-controls.js',
               'assets/world/points_bunny.js', 'assets/world/points_bear.js', 'assets/world/points_laptop.js'], function () {
    var l = loading; loading = []; l.forEach(function (f) { f(); });
  });
}
if (USE3D && 'IntersectionObserver' in window) {
  new IntersectionObserver(function (es, ob) {
    es.forEach(function (e) { if (e.isIntersecting) { ensure3D(function () { initLab(); }); ob.disconnect(); } });
  }, { rootMargin: '600px 0px' }).observe(sec);
}

function bytes(b64) { var s = atob(b64), n = s.length, a = new Uint8Array(n); for (var i = 0; i < n; i++) a[i] = s.charCodeAt(i); return a; }
function f32(b64) { return new Float32Array(bytes(b64).buffer); }
function u8(b64) { return bytes(b64); }
function f16(b64) {
  var h = new Uint16Array(bytes(b64).buffer), out = new Float32Array(h.length);
  for (var i = 0; i < h.length; i++) {
    var x = h[i], s = x & 0x8000 ? -1 : 1, e = (x >> 10) & 31, m = x & 1023;
    out[i] = e === 0 ? s * m * 5.960464477539063e-8 : e === 31 ? (m ? NaN : s * Infinity) : s * Math.pow(2, e - 15) * (1 + m / 1024);
  }
  return out;
}
function srgbToLin(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }

var models = {};
function buildModel(name) {
  if (models[name]) return models[name];
  var D = window.PRIO3D[name], m = D.meta, b = D.b64, n = m.n, M = { name: name, meta: m, n: n };
  var col = u8(b.col); M.col = new Float32Array(3 * n);
  for (var i = 0; i < 3 * n; i++) M.col[i] = srgbToLin(col[i] / 255);
  M.frames = m.frames; M.fps = m.fps;
  if (m.kind === 'deform') {
    M.rest = f32(b.pos); M.coef = f32(b.coef); M.modes = f16(b.modes); M.r = M.coef.length / m.frames;
    M.s = m.frame.s; M.fields = f32(b.fields); M.curve = f32(b.curve); M.rig = f32(b.rig);
    M.position = function (t, out) {
      var f0 = Math.max(0, Math.min(M.frames - 1, Math.floor(t))), f1 = Math.min(M.frames - 1, f0 + 1), a = t - f0, r = M.r, N3 = 3 * n;
      out.set(M.rest);
      for (var j = 0; j < r; j++) {
        var c = M.s * ((1 - a) * M.coef[f0 * r + j] + a * M.coef[f1 * r + j]);
        if (c === 0) continue;
        var mo = M.modes, base = j * N3;
        for (var i = 0; i < N3; i++) out[i] += c * mo[base + i];
      }
    };

    M.config = function (a, b, out, f) {
      var F = M.fields, N3 = 3 * n, sc = M.s, g = M.rig, o = 12 * Math.max(0, Math.min(M.frames - 1, f | 0));
      for (var i = 0; i < N3; i += 3) {
        var x = M.rest[i] + sc * (F[i] + a * F[N3 + i] + b * F[2 * N3 + i]);
        var y = M.rest[i + 1] + sc * (F[i + 1] + a * F[N3 + i + 1] + b * F[2 * N3 + i + 1]);
        var z = M.rest[i + 2] + sc * (F[i + 2] + a * F[N3 + i + 2] + b * F[2 * N3 + i + 2]);
        out[i] = g[o] * x + g[o + 1] * y + g[o + 2] * z + g[o + 9];
        out[i + 1] = g[o + 3] * x + g[o + 4] * y + g[o + 5] * z + g[o + 10];
        out[i + 2] = g[o + 6] * x + g[o + 7] * y + g[o + 8] * z + g[o + 11];
      }
    };
  } else {
    var X = f32(b.X), w = f32(b.w), q = f32(b.q), qmean = f32(b.qmean), dirs = f32(b.dirs), B = m.parts, c0 = m.frame.c, s = m.frame.s, K = m.K;
    M.rest = new Float32Array(3 * n);
    for (i = 0; i < n; i++) for (var d = 0; d < 3; d++) M.rest[3 * i + d] = (X[3 * i + d] - c0[d]) * s;
    var lid = 0, best = -1;
    for (var bb = 0; bb < B; bb++) { var cnt = 0; for (i = 0; i < n; i++) if (w[i * B + bb] < 0.5) cnt++; if (cnt > best) { best = cnt; lid = bb; } }
    var u0 = new Float32Array(3 * n);
    function u(qk, out) {
      for (var i = 0; i < n; i++) {
        var x = X[3 * i], y = X[3 * i + 1], z = X[3 * i + 2], ux = 0, uy = 0, uz = 0;
        for (var b2 = 0; b2 < B; b2++) {
          var wb = w[i * B + b2], o = b2 * 12;
          if (wb === 0) continue;
          ux += wb * (qk[o] + qk[o + 3] * x + qk[o + 4] * y + qk[o + 5] * z);
          uy += wb * (qk[o + 1] + qk[o + 6] * x + qk[o + 7] * y + qk[o + 8] * z);
          uz += wb * (qk[o + 2] + qk[o + 9] * x + qk[o + 10] * y + qk[o + 11] * z);
        }
        out[3 * i] = ux; out[3 * i + 1] = uy; out[3 * i + 2] = uz;
      }
    }
    u(q.subarray(0, K), u0);
    var qt = new Float32Array(K), tmp = new Float32Array(3 * n);
    M.position = function (t, out) {
      var f0 = Math.max(0, Math.min(M.frames - 1, Math.floor(t))), f1 = Math.min(M.frames - 1, f0 + 1), a = t - f0;
      for (var k = 0; k < K; k++) qt[k] = (1 - a) * q[f0 * K + k] + a * q[f1 * K + k];
      u(qt, tmp);
      for (var i = 0; i < 3 * n; i++) out[i] = M.rest[i] + s * (tmp[i] - u0[i]);
    };
    M.curve = f32(b.curve);
    var qc = new Float32Array(K);
    M.config = function (a, b2, out) {
      for (var k = 0; k < K; k++) qc[k] = qmean[k] + a * dirs[k] + b2 * dirs[K + k];
      u(qc, tmp);
      for (var i = 0; i < 3 * n; i++) out[i] = M.rest[i] + s * (tmp[i] - u0[i]);
    };
  }

  var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (i = 0; i < n; i++) for (d = 0; d < 3; d++) { var v = M.rest[3 * i + d]; if (v < lo[d]) lo[d] = v; if (v > hi[d]) hi[d] = v; }
  M.lo = lo; M.hi = hi;
  models[name] = M;
  return M;
}
function sub(k) { var s = String(k), o = ''; for (var i = 0; i < s.length; i++) o += String.fromCharCode(0x2080 + (+s[i])); return o; }

var L = null;
function initLab() {
  if (L || !USE3D) return;
  var T = window.THREE;
  var wrap = $('pkLab'), canvas = $('pkCanvas');
  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
  catch (e) { sec.classList.add('pk-flat'); USE3D = false; return; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(32, 1, 0.01, 100);
  var controls = new T.OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 1.2; controls.maxDistance = 8;

  var sc = document.createElement('canvas'); sc.width = sc.height = 64;
  var g = sc.getContext('2d'); g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
  var sprite = new T.CanvasTexture(sc);
  var mat = new T.PointsMaterial({ size: 0.016, vertexColors: true, map: sprite, alphaTest: 0.5, transparent: false, sizeAttenuation: true });
  var geo = new T.BufferGeometry(), pts = new T.Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);

  var BLK = new T.Vector3(1.35, 0, 0), BS = 0.6;
  var blk = new T.Group(); blk.position.copy(BLK);
  var fill = new T.Mesh(new T.BoxGeometry(BS, BS, BS), new T.MeshBasicMaterial({ color: 0x245A81, transparent: true, opacity: 0.05, depthWrite: false }));
  var edges = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(BS, BS, BS)), new T.LineBasicMaterial({ color: 0x245A81, transparent: true, opacity: 0.9 }));
  blk.add(fill); blk.add(edges); scene.add(blk);

  L = { T: T, renderer: renderer, scene: scene, camera: camera, controls: controls, geo: geo, pts: pts, mat: mat, blk: blk, fill: fill, edges: edges,
        wrap: wrap, canvas: canvas, M: null, phase: 'idle', t0: 0, playT: 0, playing: false, rate: 1, col: 0, last: performance.now(), visible: true };
  function resize() {
    var w = wrap.clientWidth, h = canvas.clientHeight || Math.round(w * 0.62);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  L.resize = resize; resize();
  window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { L.visible = e.isIntersecting; }); }).observe(wrap);
  canvas.addEventListener('pointerdown', function () { L.userOrbit = true; });
  buildUI();
  requestAnimationFrame(loop);
  if (picked) start(picked);
}

function buildUI() {
  $('pkReplay').addEventListener('click', function () { if (picked) start(picked); });
  var x = $('pkClose');
  if (x) x.addEventListener('click', function () { userPicked = true; $('pkLabWrap').classList.remove('on'); picked = null; light(null);
    document.querySelectorAll('[data-pk]').forEach(function (b) { b.classList.remove('on'); }); });
}

var P = { lift: 0.8, flow: 1.1, pass: 0.6, emit: 0.9 };
function start(name) {
  if (!L) return;
  var M = buildModel(name), T = L.T, n = M.n;
  L.M = M;
  L.pos = new Float32Array(3 * n); L.colBuf = new Float32Array(3 * n);
  L.delay = new Float32Array(n); L.jit = new Float32Array(3 * n);
  var seed = 1; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  for (var i = 0; i < n; i++) { L.delay[i] = rnd(); for (var d = 0; d < 3; d++) L.jit[3 * i + d] = (rnd() - 0.5) * BSj(); }
  L.geo.setAttribute('position', new T.BufferAttribute(L.pos, 3).setUsage(T.DynamicDrawUsage));
  L.geo.setAttribute('color', new T.BufferAttribute(L.colBuf, 3).setUsage(T.DynamicDrawUsage));
  L.motionPos = new Float32Array(3 * n);
  L.mat.size = name === 'laptop' ? 0.012 : 0.016;

  var cy = 0.5 * (M.lo[1] + M.hi[1]);
  L.objOff = new T.Vector3(-0.15, -cy, 0);
  L.blk.position.set(1.35, 0, 0);
  setCam(new T.Vector3(0.6, 0.35, 3.4), new T.Vector3(0.6, 0, 0), true);
  L.phase = 'intro'; L.t0 = performance.now() / 1000; L.playT = 0; L.playing = false; L.col = 0; L.userOrbit = false; L.lastSeg = 0;
  writeColors(); setStatus(''); padShow(false); padSetup(M);
  $('pkSimMs').textContent = 'sim ' + SIM_MS[name].toFixed(1) + ' ms / step'; $('pkUpd').textContent = ''; L.updMs = null;
  flyCut(name);
}
function BSj() { return 0.42; }
function setCam(pos, target, snap) {
  L.camTo = { p: pos.clone(), t: target.clone() };
  if (snap) { L.camera.position.copy(pos); L.controls.target.copy(target); }
}
function setStatus(t) { $('pkStatus').textContent = t; }
function toMotion() {
  if (!L || !L.M || L.phase === 'motion') return;
  L.phase = 'motion'; L.playing = true;
  setStatus('idle'); padShow(true);
  L.blk.scale.setScalar(1); L.fill.material.opacity = 0.03; L.edges.material.opacity = 0.35;
  setCam(new L.T.Vector3(-0.15, 0.3, 2.6), new L.T.Vector3(-0.15, 0, 0), false);
  writeColors();
}
function writeColors() {
  L.colBuf.set(L.M.col);
  L.geo.attributes.color.needsUpdate = true;
}
function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

function loop(now) {
  requestAnimationFrame(loop);
  if (!L) return;
  var dt = Math.min(0.1, (now - L.last) / 1000); L.last = now;
  if (L.camTo && !L.userOrbit) {
    L.camera.position.lerp(L.camTo.p, 0.06); L.controls.target.lerp(L.camTo.t, 0.06);
  }
  L.controls.update();
  if (!L.visible) return;
  var M = L.M;
  if (M) {
    var n = M.n, pos = L.pos, R = M.rest, o = L.objOff, B = L.blk.position;
    if (L.phase === 'intro') {
      var t = now / 1000 - L.t0, T1 = P.lift, T2 = T1 + P.flow, T3 = T2 + P.pass, T4 = T3 + P.emit;
      if (t < T1) {
        if (L.lastSeg !== 1) { L.lastSeg = 1; writeColors(); }
        var e = ease(t / T1);
        for (var i = 0; i < n; i++) { pos[3 * i] = R[3 * i] + o.x; pos[3 * i + 1] = R[3 * i + 1] + o.y; pos[3 * i + 2] = (0.04 + 0.96 * e) * R[3 * i + 2]; }
      } else if (t < T2) {
        if (L.lastSeg !== 2) { L.lastSeg = 2; }
        var tt = (t - T1) / P.flow;
        for (i = 0; i < n; i++) {
          var a = ease((tt - 0.45 * L.delay[i]) / 0.55);
          for (var d = 0; d < 3; d++) {
            var from = R[3 * i + d] + (d === 0 ? o.x : d === 1 ? o.y : 0), to = B.getComponent(d) + L.jit[3 * i + d] * 0.8;
            pos[3 * i + d] = from + (to - from) * a;
          }
        }
      } else if (t < T3) {
        if (L.lastSeg !== 3) { L.lastSeg = 3; setStatus(''); }
        var pp = (t - T2) / P.pass;
        L.fill.material.opacity = 0.05 + 0.18 * Math.sin(Math.PI * pp);
        for (i = 0; i < n; i++) for (d = 0; d < 3; d++) {
          var j = L.jit[3 * i + d] * 0.8, sw = Math.sin(6.28 * pp + 9 * L.delay[i]) * 0.03;
          pos[3 * i + d] = B.getComponent(d) + j + sw;
        }
      } else if (t < T4) {
        if (L.lastSeg !== 4) {
          L.lastSeg = 4; setStatus(''); L.fill.material.opacity = 0.05;
          padShow(true);
        }
        tt = (t - T3) / P.emit;
        for (i = 0; i < n; i++) {
          a = ease((tt - 0.4 * L.delay[i]) / 0.6);
          for (d = 0; d < 3; d++) {
            from = B.getComponent(d) + L.jit[3 * i + d] * 0.8; to = R[3 * i + d] + (d === 0 ? o.x : d === 1 ? o.y : 0);
            pos[3 * i + d] = from + (to - from) * a;
          }
        }
        setCam(new L.T.Vector3(0.2, 0.3, 3.0), new L.T.Vector3(0.2, 0, 0), false);
      } else {
        toMotion();
      }
      L.geo.attributes.position.needsUpdate = true;
    }
    if (L.phase === 'motion') {
      if (L.playing && !L.drag) {
        L.playT += dt * M.fps * L.rate;
        if (L.playT > M.frames - 1) L.playT = 0;
      }
      if (L.drag) {
        var tu = performance.now();
        M.config(L.drag.a, L.drag.b, L.motionPos, Math.round(L.playT));
        tu = performance.now() - tu;
        L.updMs = L.updMs === null ? tu : 0.85 * L.updMs + 0.15 * tu;
        if (!L.updShown || now - L.updShown > 150) { L.updShown = now; $('pkUpd').textContent = 'browser ' + L.updMs.toFixed(1) + ' ms / update'; }
      }
      else M.position(L.playT, L.motionPos);
      for (i = 0; i < 3 * n; i += 3) { pos[i] = L.motionPos[i] + o.x; pos[i + 1] = L.motionPos[i + 1] + o.y; pos[i + 2] = L.motionPos[i + 2]; }
      L.geo.attributes.position.needsUpdate = true;
      padDraw();
    }
  }
  L.renderer.render(L.scene, L.camera);
  placeLabel();
}
function placeLabel() {
  var v = L.blk.position.clone(); v.y += 0.42; v.project(L.camera);
  var lab = $('pkBlockLbl'), w = L.canvas.clientWidth, h = L.canvas.clientHeight;
  lab.style.left = ((v.x + 1) / 2 * w) + 'px'; lab.style.top = ((1 - v.y) / 2 * h) + 'px';
}

var PAD = null;
function padSetup(M) {
  var cv = $('pkPadCanvas'), c = M.curve, F = M.frames, a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9;
  for (var f = 0; f < F; f++) { a0 = Math.min(a0, c[2 * f]); a1 = Math.max(a1, c[2 * f]); b0 = Math.min(b0, c[2 * f + 1]); b1 = Math.max(b1, c[2 * f + 1]); }
  var ra = (a1 - a0) || 1, rb = (b1 - b0) || 1;
  PAD = { cv: cv, M: M, A0: a0 - 0.25 * ra, A1: a1 + 0.25 * ra, B0: b0 - 0.25 * rb, B1: b1 + 0.25 * rb };
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(cv.clientWidth * dpr) || 300; cv.height = Math.round(cv.clientHeight * dpr) || 220;
  padDraw();
}
function padXY(a, b) {
  var P_ = PAD, w = P_.cv.width, h = P_.cv.height, m = 0.06 * Math.min(w, h);
  return [m + (a - P_.A0) / (P_.A1 - P_.A0) * (w - 2 * m), h - m - (b - P_.B0) / (P_.B1 - P_.B0) * (h - 2 * m)];
}
function padAB(px, py) {
  var P_ = PAD, w = P_.cv.width, h = P_.cv.height, m = 0.06 * Math.min(w, h);
  var a = P_.A0 + (px - m) / (w - 2 * m) * (P_.A1 - P_.A0), b = P_.B0 + (h - m - py) / (h - 2 * m) * (P_.B1 - P_.B0);
  return { a: Math.max(P_.A0, Math.min(P_.A1, a)), b: Math.max(P_.B0, Math.min(P_.B1, b)) };
}
function padDraw() {
  if (!PAD || !L || !L.M) return;
  var cv = PAD.cv, g = cv.getContext('2d'), c = PAD.M.curve, F = PAD.M.frames, dpr = cv.width / (cv.clientWidth || cv.width);
  if (!g) return;
  g.clearRect(0, 0, cv.width, cv.height);
  g.lineWidth = 1.6 * dpr; g.strokeStyle = 'rgba(11,11,15,0.28)'; g.lineJoin = 'round'; g.beginPath();
  for (var f = 0; f < F; f++) { var p = padXY(c[2 * f], c[2 * f + 1]); if (f) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }
  g.stroke();
  var a, b;
  if (L.drag) { a = L.drag.a; b = L.drag.b; }
  else {
    var t = Math.max(0, Math.min(F - 1, L.playT)), f0 = Math.floor(t), f1 = Math.min(F - 1, f0 + 1), u = t - f0;
    a = (1 - u) * c[2 * f0] + u * c[2 * f1]; b = (1 - u) * c[2 * f0 + 1] + u * c[2 * f1 + 1];
  }
  var q = padXY(a, b);
  g.fillStyle = 'rgba(11,11,15,0.12)'; g.beginPath(); g.arc(q[0], q[1], 11 * dpr, 0, 6.2832); g.fill();
  g.fillStyle = '#0B0B0F'; g.beginPath(); g.arc(q[0], q[1], 5.5 * dpr, 0, 6.2832); g.fill();
}
function padShow(on) { $('pkPad').classList.toggle('in', !!on); }
(function padEvents() {
  var cv = $('pkPadCanvas');
  if (!cv) return;
  function at(e) { var r = cv.getBoundingClientRect(), k = cv.width / (r.width || 1); return padAB((e.clientX - r.left) * k, (e.clientY - r.top) * k); }
  cv.addEventListener('pointerdown', function (e) {
    if (!L || !L.M || !PAD) return;
    e.preventDefault(); e.stopPropagation();
    if (L.phase !== 'motion') toMotion();
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    L.drag = at(e); $('pkPad').classList.add('drag');
  });
  cv.addEventListener('pointermove', function (e) { if (L && L.drag) { L.drag = at(e); } });
  function release() {
    if (!L || !L.drag) return;
    var c = L.M.curve, best = 0, bd = 1e18;
    for (var f = 0; f < L.M.frames; f++) { var da = c[2 * f] - L.drag.a, db = c[2 * f + 1] - L.drag.b, d = da * da + db * db; if (d < bd) { bd = d; best = f; } }
    L.playT = best; L.drag = null; $('pkPad').classList.remove('drag');
  }
  cv.addEventListener('pointerup', release); cv.addEventListener('pointercancel', release);
})();

function flyCut(name) {
  var im = cuts[name], r = im.getBoundingClientRect(), c = $('pkCanvas').getBoundingClientRect();
  if (!r.width || !c.width) return;
  var f = im.cloneNode(); f.className = 'pk-fly';
  f.style.left = r.left + 'px'; f.style.top = r.top + 'px'; f.style.width = r.width + 'px'; f.style.height = r.height + 'px';
  document.body.appendChild(f);
  var tx = c.left + c.width * 0.35 - (r.left + r.width / 2), ty = c.top + c.height * 0.5 - (r.top + r.height / 2);
  var sc = Math.min(2.2, (c.height * 0.45) / r.height);
  if (f.animate) {
    var an = f.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + sc + ')', opacity: 0 }],
                       { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    an.onfinish = function () { f.remove(); };
  } else f.remove();
}

function pick(k, auto) {
  if (!auto) userPicked = true;
  picked = k;
  var pkEl = document.getElementById('pk');
  if (pkEl) pkEl.classList.toggle('lab-left', PICK_BOX[k].cx > 60);
  document.querySelectorAll('[data-pk]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-pk') === k); });
  $('pkReplay').disabled = false; endIntro();
  if (stage.classList.contains('playing')) closeClip();
  light(k);
  if (!USE3D) { openClip(k); return; }
  ensure3D(function () { initLab(); if (L) { $('pkLabWrap').classList.add('on'); L.resize(); start(k); } else openClip(k); });
}
window.PRIO_pick = pick;
window.PRIO_lab = function () { return L; };
})();
