// EMBER PACT — Ashen Warden, lawan AI.
// Niatnya selalu terlihat sebelum ia bergerak, jadi pemain bisa melawan:
// Guard saat serangan besar akan datang, serang saat ia sibuk bertahan.
EP.ai = {};

// Niat Warden untuk giliran ini, dibaca dari hand dan life kedua belah pihak.
EP.ai.makeIntent = function makeIntent(state) {
  const w = state.warden;
  const p = state.player;
  const bigStrike = w.hand.some((c) => c.type === 'strike' && c.cost >= 5);
  const elements = {};
  for (const c of w.hand) elements[c.element] = (elements[c.element] || 0) + 1;
  let topElement = null;
  let topCount = 0;
  for (const el of Object.keys(elements)) {
    if (elements[el] > topCount) { topCount = elements[el]; topElement = el; }
  }
  if (bigStrike && p.life <= 14) return 'Warden menghimpun serangan besar… bersiaplah bertahan!';
  if (w.life <= 10) return 'Warden merapatkan pertahanan… serang sekarang!';
  if (p.life <= 8) return 'Warden mengincar kemenangan… jangan lengah!';
  if (topElement && topCount >= 3) {
    return 'Warden mengumpulkan ' + EP.elements[topElement].label + '… resonansi akan datang!';
  }
  if (w.life <= 16) return 'Warden menambal lukanya… tekan terus!';
  return 'Warden menimbang langkahnya…';
};

// Nilai satu kartu dari sudut pandang Warden (makin besar makin diprioritaskan).
EP.ai.scoreCard = function scoreCard(state, card) {
  const w = state.warden;
  const p = state.player;
  if (card.type === 'strike') {
    let s = card.value * (p.life <= 8 ? 2 : 1);
    if (card.value >= 7) s += 1;
    return s;
  }
  if (card.type === 'guard') return w.life <= 12 ? card.value * 1.5 : card.value * 0.4;
  if (card.type === 'mend') return w.life <= 15 ? card.value * 1.2 : card.value * 0.2;
  if (card.type === 'draw') return w.hand.length < 3 ? 3 : 0.5;
  return 0;
};

// Susun urutan kartu yang akan dimainkan Warden giliran ini.
// Serakah tapi hemat: bila kartu besar belum terjangkau, ia menyimpan ember.
EP.ai.choosePlays = function choosePlays(state) {
  const w = state.warden;
  const plays = [];
  let ember = w.ember;
  const hand = w.hand.slice();
  const bigComing = hand.some((c) => c.type === 'strike' && c.cost >= 5 && c.cost > ember);
  for (let step = 0; step < 7; step++) {
    let best = null;
    let bestScore = 0;
    for (const c of hand) {
      if (c.cost > ember) continue;
      let s = EP.ai.scoreCard(state, c);
      // Simpan ember untuk kartu besar: kartu kecil jadi kurang menarik.
      if (bigComing && c.cost <= 2 && c.type !== 'draw') s -= 2;
      // Sedikit variasi deterministik dari rng supaya tidak monoton.
      s += state.rng() * 0.4;
      if (s > bestScore) { bestScore = s; best = c; }
    }
    if (!best || bestScore < 1) break;
    plays.push(best);
    ember -= best.cost;
    hand.splice(hand.indexOf(best), 1);
  }
  return plays;
};
