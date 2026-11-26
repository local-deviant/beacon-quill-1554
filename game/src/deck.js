// EMBER PACT — deck, draw, discard, reshuffle.
// Deck 30 kartu: 24 desain unik + 6 salinan (satu kartu dasar tiap elemen,
// dua kali) supaya kartu murah tetap mengalir.
EP.extraCopies = ['ember-spark', 'tide-lash', 'briar-whip', 'gust-slash', 'ashen-guard', 'bark-shield'];

EP.buildDeck = function buildDeck(rng) {
  const ids = EP.cards.map((c) => c.id).concat(EP.extraCopies);
  const deck = ids.map((id) => EP.cardById(id));
  return EP.shuffle(rng, deck);
};

// Ambil n kartu dari deck ke hand (maks hand 7). Bila deck habis, kocok
// ulang tumpukan buang menjadi deck baru. Mengembalikan jumlah kartu
// yang benar-benar masuk hand; sisanya terbakar bila hand penuh.
EP.drawCards = function drawCards(side, n) {
  let drawn = 0;
  for (let i = 0; i < n; i++) {
    if (side.hand.length >= EP.config.maxHand) return drawn;
    if (side.deck.length === 0) {
      if (side.discard.length === 0) return drawn;
      side.deck = EP.shuffle(side.rng, side.discard.splice(0));
      EP.addLog(side.ownerName + ' mengocok ulang tumpukan buang.');
    }
    side.hand.push(side.deck.pop());
    drawn++;
  }
  return drawn;
};

EP.makeSide = function makeSide(ownerName, rng) {
  return {
    ownerName,
    rng,
    life: EP.config.startLife,
    shield: 0,
    ember: 0,
    maxEmber: 0,
    deck: [],
    hand: [],
    discard: [],
  };
};
