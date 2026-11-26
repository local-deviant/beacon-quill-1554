// EMBER PACT — 24 desain kartu unik (6 per elemen).
// Jenis efek: strike (damage ke lawan), guard (shield), mend (pulihkan life),
// draw (ambil kartu). Setiap kartu: nama, elemen, cost ember, nilai, teks.
EP.cardTypes = {
  strike: { label: 'DMG', verb: 'memberi damage' },
  guard: { label: 'SHD', verb: 'memberi shield' },
  mend: { label: 'HEAL', verb: 'memulihkan life' },
  draw: { label: 'DRAW', verb: 'mengambil kartu' },
};

EP.cards = [
  // ---- Flame (serangan) ----
  { id: 'ember-spark', name: 'Ember Spark', element: 'flame', cost: 1, type: 'strike', value: 2, text: 'Percikan bara langsung ke Warden.' },
  { id: 'cinder-fang', name: 'Cinder Fang', element: 'flame', cost: 2, type: 'strike', value: 4, text: 'Taring bara mengoyak pertahanan.' },
  { id: 'wildfire', name: 'Wildfire', element: 'flame', cost: 4, type: 'strike', value: 7, text: 'Api liar membakar seluruh barisan.' },
  { id: 'ashen-guard', name: 'Ashen Guard', element: 'flame', cost: 2, type: 'guard', value: 5, text: 'Dinding abu menahan serangan.' },
  { id: 'phoenix-mend', name: 'Phoenix Mend', element: 'flame', cost: 3, type: 'mend', value: 5, text: 'Abu phoenix menutup lukamu.' },
  { id: 'kindle-draw', name: 'Kindle Draw', element: 'flame', cost: 2, type: 'draw', value: 2, text: 'Nyalakan lentera, tarik 2 kartu.' },
  // ---- Tide (bertahan) ----
  { id: 'tide-lash', name: 'Tide Lash', element: 'tide', cost: 1, type: 'strike', value: 2, text: 'Cambuk ombak menghantam Warden.' },
  { id: 'deep-current', name: 'Deep Current', element: 'tide', cost: 3, type: 'strike', value: 5, text: 'Arus dalam menyeret lawan.' },
  { id: 'tsunami', name: 'Tsunami', element: 'tide', cost: 5, type: 'strike', value: 8, text: 'Gelombang raksasa menelan meja.' },
  { id: 'still-water', name: 'Still Water', element: 'tide', cost: 1, type: 'guard', value: 3, text: 'Air tenang menahan pukulan.' },
  { id: 'moonwell', name: 'Moonwell', element: 'tide', cost: 2, type: 'mend', value: 4, text: 'Sumur bulan memulihkan 4 life.' },
  { id: 'undertow', name: 'Undertow', element: 'tide', cost: 3, type: 'draw', value: 2, text: 'Arus bawah menarik 2 kartu.' },
  // ---- Thorn (kombinasi) ----
  { id: 'briar-whip', name: 'Briar Whip', element: 'thorn', cost: 1, type: 'strike', value: 2, text: 'Cambuk duri menyabet Warden.' },
  { id: 'thorn-volley', name: 'Thorn Volley', element: 'thorn', cost: 2, type: 'strike', value: 4, text: 'Hujan duri dari segala arah.' },
  { id: 'root-grasp', name: 'Root Grasp', element: 'thorn', cost: 3, type: 'strike', value: 5, text: 'Akar mencengkeram dan meremukkan.' },
  { id: 'bark-shield', name: 'Bark Shield', element: 'thorn', cost: 2, type: 'guard', value: 6, text: 'Kulit kayu keras menahan serangan.' },
  { id: 'bloom-mend', name: 'Bloom Mend', element: 'thorn', cost: 2, type: 'mend', value: 4, text: 'Bunga mekar memulihkan 4 life.' },
  { id: 'seedling', name: 'Seedling', element: 'thorn', cost: 1, type: 'draw', value: 1, text: 'Benih tumbuh menjadi 1 kartu.' },
  // ---- Gale (cepat) ----
  { id: 'gust-slash', name: 'Gust Slash', element: 'gale', cost: 1, type: 'strike', value: 2, text: 'Tebasan angin memotong udara.' },
  { id: 'storm-edge', name: 'Storm Edge', element: 'gale', cost: 3, type: 'strike', value: 6, text: 'Ujung badai menyayat dalam.' },
  { id: 'cyclone', name: 'Cyclone', element: 'gale', cost: 6, type: 'strike', value: 8, text: 'Pusaran raksasa meluluhlantakkan.' },
  { id: 'wind-wall', name: 'Wind Wall', element: 'gale', cost: 2, type: 'guard', value: 5, text: 'Dinding angin menangkis serangan.' },
  { id: 'sky-mend', name: 'Sky Mend', element: 'gale', cost: 3, type: 'mend', value: 6, text: 'Langit cerah memulihkan 6 life.' },
  { id: 'zephyr', name: 'Zephyr', element: 'gale', cost: 2, type: 'draw', value: 2, text: 'Bayu sepoi membawa 2 kartu.' },
];

EP.cardById = function cardById(id) {
  for (const c of EP.cards) if (c.id === id) return c;
  return null;
};
