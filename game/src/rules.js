// EMBER PACT — alur giliran, ember, resonansi, damage/shield/heal,
// kondisi menang/kalah, dan skor. Semua aturan duel tinggal di sini.
EP.state = null;

EP.bestScore = function bestScore() {
  try {
    return Number(window.localStorage.getItem('ember-pact-best') || 0) || 0;
  } catch (e) {
    return 0;
  }
};

EP.saveBestScore = function saveBestScore(score) {
  try {
    if (score > EP.bestScore()) window.localStorage.setItem('ember-pact-best', String(score));
  } catch (e) { /* penyimpanan tidak tersedia: skor terbaik tetap tampil sesi ini */ }
};

EP.addLog = function addLog(text) {
  if (!EP.state) return;
  EP.state.log.unshift(text);
  if (EP.state.log.length > 30) EP.state.log.length = 30;
  EP.renderLog();
};

EP.newGame = function newGame(seed) {
  const rng = EP.createRng(seed);
  const state = {
    seed,
    rng,
    screen: 'duel',
    phase: 'player',
    turn: 0,
    turnToken: (EP.state ? EP.state.turnToken + 1 : 1),
    player: EP.makeSide('Kamu', rng),
    warden: EP.makeSide('Warden', rng),
    playedElements: { flame: 0, tide: 0, thorn: 0, gale: 0 },
    resonanceUsed: { flame: false, tide: false, thorn: false, gale: false },
    damageDealt: 0,
    cardsPlayed: 0,
    log: [],
    intent: '',
    result: null,
    resultReason: '',
    finalScore: 0,
  };
  state.player.deck = EP.buildDeck(rng);
  state.warden.deck = EP.buildDeck(rng);
  EP.state = state;
  EP.drawCards(state.player, EP.config.openingHand);
  EP.drawCards(state.warden, EP.config.openingHand);
  EP.addLog('Duel dimulai. Life 30 lawan 30 — kurangi life Warden ke 0!');
  EP.startPlayerTurn();
  EP.renderAll();
  return state;
};

// Awal giliran pemain: +1 ember maksimum, ember penuh, shield lama luruh,
// tarik 2 kartu, penghitung resonansi giliran ini di-nol-kan.
EP.startPlayerTurn = function startPlayerTurn() {
  const s = EP.state;
  s.phase = 'player';
  s.turn += 1;
  const p = s.player;
  p.shield = 0;
  p.maxEmber = Math.min(EP.config.maxEmber, p.maxEmber + 1);
  p.ember = p.maxEmber;
  s.playedElements = { flame: 0, tide: 0, thorn: 0, gale: 0 };
  s.resonanceUsed = { flame: false, tide: false, thorn: false, gale: false };
  const drawn = EP.drawCards(p, EP.config.drawPerTurn);
  EP.addLog('Giliran ' + s.turn + ': +' + p.maxEmber + ' ember, tarik ' + drawn + ' kartu.');
  EP.renderAll();
};

// Damage mengenai shield dulu, sisanya mengenai life.
EP.applyDamage = function applyDamage(target, amount) {
  let rest = amount;
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, rest);
    target.shield -= blocked;
    rest -= blocked;
  }
  target.life = Math.max(0, target.life - rest);
  return { blocked: amount - rest, through: rest };
};

// Terapkan efek satu kartu. Mengembalikan kalimat log.
EP.applyCardEffect = function applyCardEffect(actor, card) {
  const s = EP.state;
  const foe = actor === s.player ? s.warden : s.player;
  if (card.type === 'strike') {
    const hit = EP.applyDamage(foe, card.value);
    if (actor === s.player) s.damageDealt += card.value;
    EP.showDamage(foe === s.warden ? 'warden' : 'player', card.value);
    let line = actor.ownerName + ' memainkan ' + card.name + ': ' + card.value + ' damage';
    if (hit.blocked > 0) line += ' (' + hit.blocked + ' ditahan shield)';
    line += '.';
    return line;
  }
  if (card.type === 'guard') {
    actor.shield += card.value;
    return actor.ownerName + ' memasang ' + card.name + ': +' + card.value + ' shield.';
  }
  if (card.type === 'mend') {
    const healed = Math.min(card.value, EP.config.maxLife - actor.life);
    actor.life += healed;
    return actor.ownerName + ' memakai ' + card.name + ': +' + healed + ' life.';
  }
  if (card.type === 'draw') {
    const drawn = EP.drawCards(actor, card.value);
    return actor.ownerName + ' memakai ' + card.name + ': tarik ' + drawn + ' kartu.';
  }
  return actor.ownerName + ' memainkan ' + card.name + '.';
};

// Resonansi: kartu kedua elemen sama dalam satu giliran memicu bonus.
EP.maybeResonance = function maybeResonance(actor, card) {
  const s = EP.state;
  const el = card.element;
  s.playedElements[el] = (s.playedElements[el] || 0) + 1;
  if (s.playedElements[el] < 2 || s.resonanceUsed[el]) return;
  s.resonanceUsed[el] = true;
  const bonus = EP.config.resonance[el];
  EP.addLog(bonus.label + '!');
  EP.showBanner(bonus.label);
  if (bonus.kind === 'strike') {
    const foe = actor === s.player ? s.warden : s.player;
    EP.applyDamage(foe, bonus.value);
    if (actor === s.player) s.damageDealt += bonus.value;
  } else if (bonus.kind === 'guard') {
    actor.shield += bonus.value;
  } else if (bonus.kind === 'draw') {
    EP.drawCards(actor, bonus.value);
  }
};

// Pemain memainkan kartu dari hand (klik atau tombol 1–7).
EP.playCard = function playCard(index) {
  const s = EP.state;
  if (!s || s.screen !== 'duel' || s.phase !== 'player') return false;
  const card = s.player.hand[index];
  if (!card) return false;
  if (card.cost > s.player.ember) {
    EP.addLog('Ember tidak cukup untuk ' + card.name + ' (' + card.cost + ' ember).');
    EP.audio.click();
    EP.renderAll();
    return false;
  }
  s.player.hand.splice(index, 1);
  s.player.ember -= card.cost;
  s.player.discard.push(card);
  s.cardsPlayed += 1;
  EP.addLog(EP.applyCardEffect(s.player, card));
  EP.audio.playCard(card);
  EP.showPlayedCard(card, 'player');
  EP.maybeResonance(s.player, card);
  EP.renderAll();
  EP.checkEnd();
  return true;
};

// Akhiri giliran pemain: Warden menunjukkan niatnya, lalu bermain
// kartunya satu per satu dengan jeda, kemudian giliran kembali ke pemain.
EP.endPlayerTurn = function endPlayerTurn() {
  const s = EP.state;
  if (!s || s.screen !== 'duel' || s.phase !== 'player') return;
  s.phase = 'ai';
  EP.renderAll();
  const w = s.warden;
  w.shield = 0;
  w.maxEmber = Math.min(EP.config.maxEmber, w.maxEmber + 1);
  w.ember = w.maxEmber;
  EP.drawCards(w, EP.config.drawPerTurn);
  s.intent = EP.ai.makeIntent(s);
  EP.addLog('Warden: ' + s.intent);
  EP.renderAll();
  const plays = EP.ai.choosePlays(s);
  const token = s.turnToken;
  let step = 0;
  const playNext = function playNext() {
    if (!EP.state || EP.state.turnToken !== token || EP.state.screen !== 'duel') return;
    if (step >= plays.length) {
      EP.addLog('Warden mengakhiri gilirannya.');
      EP.startPlayerTurn();
      EP.checkEnd();
      return;
    }
    const card = plays[step];
    step += 1;
    const idx = w.hand.indexOf(card);
    if (idx === -1 || card.cost > w.ember) { playNext(); return; }
    w.hand.splice(idx, 1);
    w.ember -= card.cost;
    w.discard.push(card);
    EP.addLog(EP.applyCardEffect(w, card));
    EP.audio.playCard(card);
    EP.showPlayedCard(card, 'warden');
    EP.renderAll();
    EP.checkEnd();
    if (EP.state.screen === 'duel') window.setTimeout(playNext, 850);
  };
  window.setTimeout(playNext, 1100);
};

// Skor akhir: damage yang diberikan + life tersisa x10 saat menang
// + bonus kecepatan (maks 25 giliran).
EP.computeScore = function computeScore() {
  const s = EP.state;
  let score = s.damageDealt;
  if (s.result === 'win') {
    score += s.player.life * 10;
    score += Math.max(0, EP.config.speedTurnCap - s.turn) * EP.config.speedBonusPerTurn;
  }
  return score;
};

EP.checkEnd = function checkEnd() {
  const s = EP.state;
  if (!s || s.screen !== 'duel') return;
  if (s.warden.life <= 0) {
    EP.endGame('win', 'Life Warden habis — lentera tetap menyala!');
  } else if (s.player.life <= 0) {
    EP.endGame('loss', 'Life-mu habis dibakar Warden.');
  }
};

EP.endGame = function endGame(result, reason) {
  const s = EP.state;
  s.result = result;
  s.resultReason = reason;
  s.screen = result === 'win' ? 'win' : 'loss';
  s.phase = 'over';
  s.finalScore = EP.computeScore();
  if (result === 'win') EP.saveBestScore(s.finalScore);
  EP.addLog(result === 'win' ? 'KEMENANGAN! Skor akhir ' + s.finalScore + '.' : 'Kekalahan. ' + reason);
  if (result === 'win') EP.audio.win(); else EP.audio.lose();
  EP.renderAll();
};

EP.restart = function restart() {
  EP.newGame(EP.state ? EP.state.seed : EP.config.defaultSeed);
};
