// EMBER PACT — state machine, input (klik + keyboard), boot.
// Layar: title -> duel -> win / loss, plus pause. Restart dari mana saja.
EP.readSeed = function readSeed() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('seed');
  const n = raw === null ? NaN : parseInt(raw, 10);
  return Number.isFinite(n) ? n : EP.config.defaultSeed;
};

EP.startFromTitle = function startFromTitle() {
  EP.audio.ensure();
  EP.audio.click();
  EP.newGame(EP.readSeed());
};

EP.togglePause = function togglePause() {
  const s = EP.state;
  if (!s) return;
  if (s.screen === 'duel') { s.screen = 'paused'; EP.renderAll(); }
  else if (s.screen === 'paused') { s.screen = 'duel'; EP.renderAll(); }
};

EP.toggleMute = function toggleMute() {
  const muted = EP.audio.toggleMute();
  EP.el('mute-button').textContent = muted ? 'Suara: Mati (M)' : 'Suara: Nyala (M)';
};

EP.boot = function boot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = EP.readSeed();

  EP.el('start-button').addEventListener('click', (e) => { e.currentTarget.blur(); EP.startFromTitle(); });
  EP.el('play-again').addEventListener('click', (e) => { e.currentTarget.blur(); EP.newGame(seed); });
  EP.el('try-again').addEventListener('click', (e) => { e.currentTarget.blur(); EP.newGame(seed); });
  EP.el('resume-button').addEventListener('click', (e) => { e.currentTarget.blur(); EP.togglePause(); });
  EP.el('restart-button').addEventListener('click', (e) => { e.currentTarget.blur(); EP.restart(); });
  EP.el('mute-button').addEventListener('click', (e) => { e.currentTarget.blur(); EP.toggleMute(); });
  EP.el('pause-button').addEventListener('click', (e) => { e.currentTarget.blur(); EP.togglePause(); });
  EP.el('end-turn').addEventListener('click', (e) => { e.currentTarget.blur(); EP.audio.click(); EP.endPlayerTurn(); });

  document.addEventListener('keydown', (e) => {
    const s = EP.state;
    if (!s) return;
    if (e.key >= '1' && e.key <= '7') {
      EP.playCard(Number(e.key) - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (e.target === document.body) e.preventDefault();
      if (s.screen === 'title') EP.startFromTitle();
      else if (s.screen === 'win' || s.screen === 'loss') EP.newGame(seed);
      else EP.endPlayerTurn();
    } else if (e.key === 'r' || e.key === 'R') {
      EP.newGame(seed);
    } else if (e.key === 'm' || e.key === 'M') {
      EP.toggleMute();
    } else if (e.key === 'Escape') {
      EP.togglePause();
    }
  });

  // Sentuhan/klik pertama menghidupkan konteks audio (aturan browser).
  document.addEventListener('pointerdown', () => EP.audio.ensure(), { once: true });

  if (shot) {
    EP.stageShot(shot, seed);
  } else {
    EP.newGame(seed);
    EP.state.screen = 'title';
    EP.renderAll();
    window.__shotReady = true;
  }
};

document.addEventListener('DOMContentLoaded', EP.boot);
