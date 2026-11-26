// EMBER PACT — staging screenshot (?shot=table|title|win|loss).
// Menyiapkan tiap state yang difoto, lalu menaikkan window.__shotReady
// sesudah animasi selesai. Hanya untuk screenshot; permainan normal
// tidak memakai mode ini.
window.__shotReady = false;

EP.stageShot = function stageShot(name, seed) {
  const s = EP.newGame(seed);
  if (name === 'title') {
    s.screen = 'title';
    EP.renderAll();
    window.setTimeout(() => { window.__shotReady = true; }, 400);
    return;
  }
  if (name === 'table') {
    // Tengah duel: life sudah berkurang, ember menyala, hand penuh,
    // satu kartu sedang dimainkan di tengah meja.
    s.player.life = 24;
    s.warden.life = 18;
    s.player.shield = 3;
    s.warden.shield = 2;
    s.turn = 6;
    s.damageDealt = 12;
    s.cardsPlayed = 9;
    s.player.ember = 5;
    s.player.maxEmber = 6;
    s.warden.ember = 4;
    s.warden.maxEmber = 5;
    s.player.hand = ['wildfire', 'cinder-fang', 'ashen-guard', 'moonwell', 'thorn-volley', 'zephyr']
      .map((id) => EP.cardById(id));
    s.warden.hand = s.warden.deck.slice(0, 5);
    s.intent = 'Warden mengumpulkan Flame… bersiap menyerang besar!';
    EP.addLog('Kamu memainkan Thorn Volley: 4 damage.');
    EP.addLog('Warden memasang Wind Wall: +5 shield.');
    EP.addLog('Resonansi Flame: +2 damage ke Warden!');
    EP.renderAll();
    EP.showPlayedCard(EP.cardById('cinder-fang'), 'player');
    window.setTimeout(() => { window.__shotReady = true; }, 1000);
    return;
  }
  if (name === 'win') {
    s.warden.life = 0;
    s.player.life = 17;
    s.turn = 9;
    s.damageDealt = 34;
    s.cardsPlayed = 14;
    EP.endGame('win', 'Life Warden habis — lentera tetap menyala!');
    window.setTimeout(() => { window.__shotReady = true; }, 600);
    return;
  }
  if (name === 'loss') {
    s.player.life = 0;
    s.warden.life = 11;
    s.turn = 12;
    s.damageDealt = 21;
    s.cardsPlayed = 11;
    EP.endGame('loss', 'Life-mu habis dibakar Warden.');
    window.setTimeout(() => { window.__shotReady = true; }, 600);
    return;
  }
  // Shot tidak dikenal: tampilkan title saja.
  s.screen = 'title';
  EP.renderAll();
  window.setTimeout(() => { window.__shotReady = true; }, 400);
};
