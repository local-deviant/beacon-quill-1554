// EMBER PACT — suara prosedural WebAudio, tanpa file audio.
// Whoosh kartu, bunyi strike, chime shield, shimmer heal, fanfare menang,
// drone kalah, klik UI. Mute dengan tombol M.
EP.audio = {
  ctx: null,
  muted: false,
};

EP.audio.ensure = function ensure() {
  if (!EP.audio.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      EP.audio.ctx = new AC();
    } catch (e) {
      EP.audio.ctx = null;
    }
  }
  if (EP.audio.ctx && EP.audio.ctx.state === 'suspended') EP.audio.ctx.resume();
  return EP.audio.ctx;
};

EP.audio.tone = function tone(freq, dur, type, vol, slideTo) {
  if (EP.audio.muted) return;
  const ctx = EP.audio.ensure();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(vol || 0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.05);
};

EP.audio.noise = function noise(dur, vol) {
  if (EP.audio.muted) return;
  const ctx = EP.audio.ensure();
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (i / len - 0.5) * 2 * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = vol || 0.15;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
};

EP.audio.click = function click() { EP.audio.tone(660, 0.07, 'triangle', 0.08); };

EP.audio.playCard = function playCard(card) {
  EP.audio.noise(0.18, 0.12);
  if (card.type === 'strike') {
    EP.audio.tone(180, 0.22, 'sawtooth', 0.14, 60);
    EP.audio.noise(0.12, 0.18);
  } else if (card.type === 'guard') {
    EP.audio.tone(520, 0.25, 'sine', 0.12, 780);
  } else if (card.type === 'mend') {
    EP.audio.tone(440, 0.3, 'sine', 0.1, 880);
    EP.audio.tone(660, 0.3, 'sine', 0.07, 990);
  } else if (card.type === 'draw') {
    EP.audio.tone(500, 0.12, 'triangle', 0.09, 900);
  }
};

EP.audio.win = function win() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => window.setTimeout(() => EP.audio.tone(f, 0.5, 'triangle', 0.14), i * 140));
};

EP.audio.lose = function lose() {
  EP.audio.tone(220, 1.1, 'sawtooth', 0.1, 55);
  EP.audio.tone(110, 1.3, 'sine', 0.12, 40);
};

EP.audio.toggleMute = function toggleMute() {
  EP.audio.muted = !EP.audio.muted;
  return EP.audio.muted;
};
