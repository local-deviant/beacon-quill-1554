// EMBER PACT — entrypoint (Node 22, standard library only).
//   node main.ts            : hand in — validasi, salin game/ + screenshots/
//                             ke $MAKEFUN_OUTPUT_DIR (atau /output), tulis dossier.json.
//   node main.ts --check    : jalankan 8 self-check saja, exit 0 bila semua PASS.
//   node main.ts --serve    : validasi dulu, lalu sajikan game/ untuk playtest lokal.
// Game-nya sendiri statis (game/index.html + modul JS), tanpa build step
// dan tanpa network request. Dossier ditulis oleh vendor/makefun-game.ts.
import { cpSync, createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const GAME_FILES = [
  'index.html',
  'src/style.css',
  'src/config.js',
  'src/random.js',
  'src/cards.js',
  'src/deck.js',
  'src/ai.js',
  'src/rules.js',
  'src/render.js',
  'src/audio.js',
  'src/shots.js',
  'src/main.js',
];

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function listFiles(dir, base = dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...listFiles(full, base));
    else if (entry.isFile()) found.push(full.slice(base.length + 1));
  }
  return found;
}

function readGameSources() {
  const texts = [];
  for (const rel of listFiles(join(here, 'game'))) {
    texts.push({ rel, text: readFileSync(join(here, 'game', rel), 'utf8') });
  }
  return texts;
}

function checkEntrypoint() {
  const main = join(here, 'main.ts');
  const ok = existsSync(main) && readFileSync(main, 'utf8').includes('buildDossier');
  return { name: 'entrypoint', ok, detail: ok ? 'main.ts ada dan memanggil buildDossier' : 'main.ts hilang atau tidak memanggil buildDossier' };
}

function checkLicense() {
  const lic = join(here, 'LICENSE');
  const ok = existsSync(lic) && readFileSync(lic, 'utf8').startsWith('SPDX-License-Identifier: MIT');
  return { name: 'license', ok, detail: ok ? 'LICENSE diawali SPDX-License-Identifier: MIT' : 'LICENSE hilang atau bukan MIT' };
}

function checkGameStatic() {
  const missing = GAME_FILES.filter((f) => !existsSync(join(here, 'game', f)));
  return { name: 'game-static', ok: missing.length === 0, detail: missing.length === 0 ? GAME_FILES.length + ' file game ada di bawah game/' : 'hilang: ' + missing.join(', ') };
}

function checkGameComplete() {
  const sources = readGameSources().map((s) => s.text).join('\n');
  const markers = [
    ['title', 'EMBER PACT'],
    ['player hand', 'player-hand'],
    ['opponent hand', 'warden-hand'],
    ['card cost', 'card-cost'],
    ['card value', 'card-value'],
    ['score', 'hud-score'],
    ['life', 'life-fill'],
    ['win screen', 'win-screen'],
    ['loss screen', 'loss-screen'],
  ];
  const missing = markers.filter(([, m]) => !sources.includes(m)).map(([label]) => label);
  return { name: 'game-complete', ok: missing.length === 0, detail: missing.length === 0 ? 'title, kedua hand, cost/value kartu, skor/life, win dan loss ada' : 'hilang: ' + missing.join(', ') };
}

function checkNoNetwork() {
  const bad = [];
  for (const { rel, text } of readGameSources()) {
    const stripped = text.replace(/data:[^'"\s)]+/g, '');
    if (/\bfetch\s*\(|XMLHttpRequest|WebSocket|https?:\/\//.test(stripped)) bad.push(rel);
  }
  return { name: 'no-network', ok: bad.length === 0, detail: bad.length === 0 ? 'tidak ada fetch/XHR/WebSocket/URL di game sources' : 'network di: ' + bad.join(', ') };
}

function checkScreenshots() {
  const dir = join(here, 'screenshots');
  if (!existsSync(dir)) return { name: 'screenshots', ok: false, detail: 'folder screenshots/ hilang' };
  const files = readdirSync(dir).filter((f) => !f.startsWith('.'));
  const bad = [];
  for (const f of files) {
    const size = statSync(join(dir, f)).size;
    if (!/\.(jpg|jpeg|png)$/i.test(f)) bad.push(f + ' (bukan jpg/png)');
    else if (size < 20000 || size > 262144) bad.push(f + ' (' + size + ' byte)');
  }
  const ok = files.length >= 3 && files.length <= 4 && bad.length === 0;
  return { name: 'screenshots', ok, detail: files.length + ' screenshot' + (bad.length ? '; masalah: ' + bad.join(', ') : ', semua 20.000–262.144 byte') };
}

function checkDeterministic() {
  const sources = readGameSources().map((s) => s.text).join('\n');
  const hasSeeded = sources.includes('mulberry32');
  const badRandom = sources.includes('Math.random');
  const badNow = sources.includes('Date.now');
  const ok = hasSeeded && !badRandom && !badNow;
  return { name: 'deterministic', ok, detail: ok ? 'RNG seeded (mulberry32), tanpa Math.random / Date.now' : 'seeded=' + hasSeeded + ' Math.random=' + badRandom + ' Date.now=' + badNow };
}

function checkDossier() {
  const tmp = mkdtempSync(join(tmpdir(), 'ember-pact-'));
  try {
    cpSync(join(here, 'game'), join(tmp, 'game'), { recursive: true });
    mkdirSync(join(tmp, 'screenshots'), { recursive: true });
    if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(tmp, 'screenshots'), { recursive: true });
    const dossier = buildDossier(tmp, DOSSIER_CAPS);
    const bytes = Buffer.byteLength(dossier, 'utf8');
    const ok = bytes <= 1500000;
    return { name: 'dossier', ok, detail: ok ? 'dossier.json ' + bytes + ' byte (cap 1.500.000)' : 'dossier.json ' + bytes + ' byte melebihi cap' };
  } catch (e) {
    return { name: 'dossier', ok: false, detail: 'buildDossier gagal: ' + (e instanceof Error ? e.message : String(e)) };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function runChecks() {
  return [
    checkEntrypoint(),
    checkLicense(),
    checkGameStatic(),
    checkGameComplete(),
    checkNoNetwork(),
    checkScreenshots(),
    checkDeterministic(),
    checkDossier(),
  ];
}

function printChecks(checks) {
  let passed = 0;
  for (const c of checks) {
    if (c.ok) passed += 1;
    console.log((c.ok ? 'PASS' : 'FAIL') + ' ' + c.name + ' — ' + c.detail);
  }
  console.log(passed + '/' + checks.length + ' checks passed');
  return passed === checks.length;
}

function handIn() {
  mkdirSync(out, { recursive: true });
  cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
  writeFileSync(join(out, 'dossier.json'), buildDossier(out, DOSSIER_CAPS));
  console.log('handed in to ' + out);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function serveGame(port) {
  const root = resolve(join(here, 'game'));
  createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      response.writeHead(400).end('bad request');
      return;
    }
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = resolve(join(root, pathname));
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end('forbidden');
      return;
    }
    let size;
    try {
      const stats = statSync(file);
      if (!stats.isFile()) throw new Error('not a file');
      size = stats.size;
    } catch {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, {
      'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'content-length': size,
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(response);
  }).listen(port, '127.0.0.1', () => {
    console.log('EMBER PACT di http://127.0.0.1:' + port);
  });
}

const args = process.argv.slice(2);
if (args.includes('--check')) {
  process.exit(printChecks(runChecks()) ? 0 : 1);
}
if (args.includes('--serve')) {
  const portIndex = args.indexOf('--port');
  const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
  const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;
  if (!printChecks(runChecks())) {
    console.log('entry tidak valid — server tidak dijalankan');
    process.exit(1);
  }
  serveGame(port);
} else {
  if (!printChecks(runChecks())) {
    console.log('hand-in dibatalkan: ada check yang FAIL');
    process.exit(1);
  }
  handIn();
}
