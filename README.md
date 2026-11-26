SPDX-License-Identifier: MIT

# EMBER PACT

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/local-deviant/best-card-game-20261122-1826-ours/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/local-deviant/best-card-game-20261122-1826-ours/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)


Duel kartu orisinal melawan **Ashen Warden** di meja bara. Kamu adalah Penjaga Lentera:
kurangi life Warden dari 30 ke 0 sebelum lifemu habis.

## Cara main

- Setiap giliran kamu mendapat +1 ember maksimum (maks 10), ember terisi penuh, dan menarik 2 kartu.
- Klik kartu yang embernya cukup untuk memainkannya. Kartu yang tidak terjangkau tampak redup.
- Ada 4 elemen, dibedakan warna **dan** bentuk: **▲ Flame** (merah), **▼ Tide** (biru),
  **◆ Thorn** (hijau), **✦ Gale** (ungu). Total 24 desain kartu: Strike, Guard, Mend, dan Draw.
- **Resonansi:** memainkan 2 kartu elemen sama dalam satu giliran memicu bonus —
  Flame/Gale +2 damage, Tide +2 shield, Thorn +1 kartu.
- Sebelum giliran Warden, baca baris niatnya: bila ia bersiap menyerang besar, pasang Guard.
- Tekan **Akhiri Giliran** untuk menyerahkan giliran ke Warden.

## Skor

Skor = damage yang kamu berikan + (life tersisa × 10 saat menang) + bonus kecepatan
((25 − giliran) × 2 saat menang). Skor terbaik tersimpan di browser.

## Kontrol

- Klik kartu / tombol **1–7**: mainkan kartu di hand
- **Enter / Space**: akhiri giliran (atau mulai dari title screen)
- **R**: ulang duel · **M**: suara nyala/mati · **Esc**: jeda

## Suara

Semua suara dibuat prosedural dengan WebAudio — tanpa file audio.

## File

- `game/index.html` — page, meja, HUD, kedua hand, log
- `game/src/style.css` — tampilan meja, kartu, animasi, bar life, layar akhir
- `game/src/config.js` — konstanta (life 30, ember maks 10, hand maks 7, skor)
- `game/src/random.js` — RNG seeded (mulberry32)
- `game/src/cards.js` — 24 definisi kartu
- `game/src/deck.js` — build deck, shuffle, draw, reshuffle
- `game/src/ai.js` — logika Ashen Warden + niat yang terlihat
- `game/src/rules.js` — alur giliran, ember, resonansi, menang/kalah
- `game/src/render.js` — render DOM + animasi
- `game/src/audio.js` — suara WebAudio prosedural
- `game/src/shots.js` — staging screenshot (`?shot=table|title|win|loss`)
- `game/src/main.js` — state machine, input, boot
- `main.ts` — entrypoint hand-in (`node main.ts`, `--check`, `--serve`)
- `serve.ts` — server statis kecil untuk playtest lokal
- `shots.json` — daftar screenshot

## Lisensi

MIT — lihat `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=njrtxptt&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
