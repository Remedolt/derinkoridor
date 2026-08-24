/**
 * Derin Koridorlar — entry point
 */

const canvas = document.getElementById("game-canvas");
const startBtn = document.getElementById("btn-start");
if (startBtn) {
  startBtn.disabled = true;
  startBtn.textContent = "YÜKLENİYOR…";
}

document.addEventListener(
  "touchmove",
  (e) => {
    if (e.target.closest("#mobile-ui") || e.target === canvas) e.preventDefault();
  },
  { passive: false }
);

window.addEventListener("contextmenu", (e) => e.preventDefault());

const { Game } = await import("./game.js");
const game = new Game(canvas);
game.init();
if (startBtn) startBtn.disabled = false;
