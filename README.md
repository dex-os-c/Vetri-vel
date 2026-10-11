# Vetri Vel — Chola Warrior (2D)

Side-scrolling prototype: a Chola warrior with idle, walk, run, jump and sword-slash animations.

## Play
Open `index.html` in a browser. If images don't load, run a local server in this folder:

    python3 -m http.server 8000

then open http://localhost:8000

## Controls
- Keyboard: A/D or arrows move, Shift run, W/Space jump, J attack
- Phone: on-screen buttons (rotate to landscape)

## Tweaking animations
Everything is in the table at the top of `game.js` (scale, speed, stride, fps, offsets).
Sprite sheets are in `assets/` (idle, walk, run, attack).
