// EMBER PACT — konfigurasi permainan.
// Satu tempat untuk semua angka penyeimbang, supaya aturan mudah dipoles.
const EP = window.EP || (window.EP = {});

EP.config = {
  gameName: 'EMBER PACT',
  startLife: 30,
  maxLife: 30,
  maxEmber: 10,
  maxHand: 7,
  openingHand: 4,
  drawPerTurn: 2,
  deckSize: 30,
  // Bonus kecepatan: (25 - giliran) x 2 saat menang, tidak pernah negatif.
  speedTurnCap: 25,
  speedBonusPerTurn: 2,
  // Resonansi: mainkan 2 kartu elemen sama dalam satu giliran.
  resonance: {
    flame: { kind: 'strike', value: 2, label: 'Resonansi Flame: +2 damage ke Warden' },
    tide: { kind: 'guard', value: 2, label: 'Resonansi Tide: +2 shield untukmu' },
    thorn: { kind: 'draw', value: 1, label: 'Resonansi Thorn: +1 kartu' },
    gale: { kind: 'strike', value: 2, label: 'Resonansi Gale: +2 damage ke Warden' },
  },
  defaultSeed: 20261122,
};

// Elemen (suit): warna DAN bentuk selalu berpasangan, jadi kartu terbaca
// tanpa mengandalkan teks saja.
EP.elements = {
  flame: { label: 'Flame', color: '#e2543e', dark: '#8f2417', shape: '▲', glow: '#ff8a5c' },
  tide: { label: 'Tide', color: '#3e8fd9', dark: '#174a7d', shape: '▼', glow: '#7cc0ff' },
  thorn: { label: 'Thorn', color: '#4da34a', dark: '#1f5c22', shape: '◆', glow: '#8fe08a' },
  gale: { label: 'Gale', color: '#9a6fd0', dark: '#4d2a7d', shape: '✦', glow: '#c9a6f5' },
};
