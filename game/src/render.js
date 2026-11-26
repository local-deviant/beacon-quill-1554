// EMBER PACT — render DOM + animasi (deal, slide, flip, damage number,
// bar life, spanduk resonansi). Tidak ada logika aturan di sini.
EP.el = function el(id) { return document.getElementById(id); };

EP.renderAll = function renderAll() {
  const s = EP.state;
  if (!s) return;
  EP.renderHud();
  EP.renderSide('player');
  EP.renderSide('warden');
  EP.renderHands();
  EP.renderLog();
  EP.renderOverlays();
};

EP.renderHud = function renderHud() {
  const s = EP.state;
  EP.el('hud-score').textContent = 'Skor ' + s.damageDealt;
  EP.el('hud-turn').textContent = 'Giliran ' + Math.max(1, s.turn);
  EP.el('hud-best').textContent = 'Terbaik ' + EP.bestScore();
  EP.el('end-turn').disabled = !(s.screen === 'duel' && s.phase === 'player');
  EP.el('end-turn').textContent = s.phase === 'ai' ? 'Warden bermain…' : 'Akhiri Giliran';
};

EP.renderSide = function renderSide(which) {
  const s = EP.state;
  const side = s[which];
  const lifePct = Math.round((side.life / EP.config.maxLife) * 100);
  EP.el(which + '-life-fill').style.width = lifePct + '%';
  EP.el(which + '-life-text').textContent = side.life + ' / ' + EP.config.maxLife;
  const shieldEl = EP.el(which + '-shield');
  shieldEl.textContent = side.shield > 0 ? 'Shield ' + side.shield : '';
  shieldEl.classList.toggle('on', side.shield > 0);
  const pips = EP.el(which + '-ember');
  pips.innerHTML = '';
  for (let i = 0; i < side.maxEmber; i++) {
    const pip = document.createElement('span');
    pip.className = 'pip' + (i < side.ember ? ' lit' : '');
    pips.appendChild(pip);
  }
  const count = EP.el(which + '-count');
  if (count) count.textContent = side.hand.length + ' kartu';
};

EP.cardElement = function cardElement(card, index) {
  const elInfo = EP.elements[card.element];
  const div = document.createElement('div');
  div.className = 'card el-' + card.element + (index !== null && card.cost <= EP.state.player.ember ? ' playable' : ' dim');
  div.dataset.index = index === null ? '' : String(index);
  const typeLabel = EP.cardTypes[card.type].label;
  div.innerHTML =
    '<div class="card-cost">' + card.cost + '</div>' +
    '<div class="card-shape" style="color:' + elInfo.glow + '">' + elInfo.shape + '</div>' +
    '<div class="card-name">' + card.name + '</div>' +
    '<div class="card-elem">' + elInfo.label.toUpperCase() + '</div>' +
    '<div class="card-value">' + typeLabel + ' ' + card.value + '</div>' +
    '<div class="card-text">' + card.text + '</div>' +
    (index !== null ? '<div class="card-key">' + (index + 1) + '</div>' : '');
  return div;
};

EP.renderHands = function renderHands() {
  const s = EP.state;
  const handEl = EP.el('player-hand');
  handEl.innerHTML = '';
  s.player.hand.forEach((card, i) => {
    const node = EP.cardElement(card, i);
    node.style.animationDelay = (i * 70) + 'ms';
    node.addEventListener('click', () => EP.playCard(i));
    handEl.appendChild(node);
  });
  const wardenEl = EP.el('warden-hand');
  wardenEl.innerHTML = '';
  s.warden.hand.forEach(() => {
    const back = document.createElement('div');
    back.className = 'card-back';
    wardenEl.appendChild(back);
  });
  EP.el('intent').textContent = s.intent || 'Warden menunggu gilirannya…';
};

EP.renderLog = function renderLog() {
  const s = EP.state;
  const logEl = EP.el('log');
  logEl.innerHTML = '';
  s.log.slice(0, 8).forEach((line) => {
    const li = document.createElement('li');
    li.textContent = line;
    logEl.appendChild(li);
  });
};

EP.renderOverlays = function renderOverlays() {
  const s = EP.state;
  EP.el('title-screen').classList.toggle('hidden', s.screen !== 'title');
  EP.el('win-screen').classList.toggle('hidden', s.screen !== 'win');
  EP.el('loss-screen').classList.toggle('hidden', s.screen !== 'loss');
  EP.el('pause-screen').classList.toggle('hidden', s.screen !== 'paused');
  if (s.screen === 'win') {
    EP.el('win-score').textContent = 'Skor ' + s.finalScore;
    EP.el('win-stats').innerHTML = EP.statsHtml();
  }
  if (s.screen === 'loss') {
    EP.el('loss-reason').textContent = s.resultReason;
    EP.el('loss-stats').innerHTML = EP.statsHtml();
  }
  if (s.screen === 'title') {
    EP.el('title-best').textContent = 'Skor terbaik: ' + EP.bestScore();
  }
};

EP.statsHtml = function statsHtml() {
  const s = EP.state;
  const speed = s.result === 'win'
    ? Math.max(0, EP.config.speedTurnCap - s.turn) * EP.config.speedBonusPerTurn
    : 0;
  return '<div><span>Damage diberikan</span><b>' + s.damageDealt + '</b></div>' +
    '<div><span>Life tersisa</span><b>' + s.player.life + ' × 10 = ' + (s.result === 'win' ? s.player.life * 10 : 0) + '</b></div>' +
    '<div><span>Bonus kecepatan</span><b>+' + speed + '</b></div>' +
    '<div><span>Giliran</span><b>' + s.turn + '</b></div>' +
    '<div><span>Kartu dimainkan</span><b>' + s.cardsPlayed + '</b></div>';
};

// Kartu yang baru dimainkan melayang ke tengah meja.
EP.showPlayedCard = function showPlayedCard(card, side) {
  const slot = EP.el('played-slot');
  slot.innerHTML = '';
  const node = EP.cardElement(card, null);
  node.classList.add('played', side === 'warden' ? 'from-warden' : 'from-player');
  node.classList.remove('dim');
  slot.appendChild(node);
  window.setTimeout(() => { if (slot.contains(node)) slot.removeChild(node); }, 1400);
};

// Angka damage melayang di atas bar life target.
EP.showDamage = function showDamage(which, amount) {
  const zone = EP.el(which + '-zone');
  if (!zone) return;
  const floater = document.createElement('div');
  floater.className = 'floater';
  floater.textContent = '−' + amount;
  zone.appendChild(floater);
  window.setTimeout(() => { if (zone.contains(floater)) zone.removeChild(floater); }, 1100);
};

// Spanduk resonansi di tengah meja.
EP.showBanner = function showBanner(text) {
  const banner = EP.el('resonance-banner');
  banner.textContent = text;
  banner.classList.remove('show');
  void banner.offsetWidth;
  banner.classList.add('show');
  window.setTimeout(() => banner.classList.remove('show'), 1800);
};
