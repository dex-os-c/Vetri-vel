# Vetri Vel — Chola Warrior (2D)

Story-driven 2D prototype set in the Chola Empire (reign of Rajendra Chola I).

**Chapter 1 — The Silent Frontier** (playable): leave the capital, follow the forest road, read the clues, answer the bell, and fight the Gatekeeper with the combat system (attack, dodge, block/parry, counter).

**Arc I — The Return:** Commander Vetri Vel leads the surviving soldiers home to Thanjai, a royal messenger summons him,
and in the King's Court Rajendra sends him on **Mission 01 — The Silent Frontier**.

## Play
Open `index.html` (or run `python3 -m http.server 8000` in this folder and open http://localhost:8000).

## Controls
- Story mode: hold ▶ / D / → to walk, tap / Space / Enter to advance dialogue, N or SKIP to skip a scene.
- Free play (F): A/D move, Shift run, W/Space jump, J attack, H hurt, K defeat, T talk, Y weary march.
- R restarts the story. Phone: on-screen buttons (landscape).

## Editing the story
All story and dialogue text is at the top of `game.js` (`STORY`, `MSG_LINES`, `COURT_A`, `COURT_B`, `MISSION`).
Lines marked `(draft)` are placeholders. `src/` holds the game source split into parts; `game.js` is the combined file.
Animation settings (scale, speed, stride, fps) are in the `ANIMS` table.

## Combat (courtyard fight)
J attack · K hold to block (tap right before the hit to PARRY) · L dodge (heavy swings cannot be blocked). Attacking an opened enemy does triple damage.
Source parts are in `src/`; `game.js` is the combined file.
