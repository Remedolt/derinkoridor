/**
 * Derin Koridorlar — entry point
 */

import { Game } from "./game.js";

const canvas = document.getElementById("game-canvas");
const game = new Game(canvas);
game.init();

// Prevent default gestures that break FPS control on mobile
document.addEventListener(
  "touchmove",
  (e) => {
    if (e.target.closest("#mobile-ui") || e.target === canvas) e.preventDefault();
  },
  { passive: false }
);

window.addEventListener("contextmenu", (e) => e.preventDefault());
