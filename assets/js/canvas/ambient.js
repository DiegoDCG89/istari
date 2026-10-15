// Fundo animado: runas e faíscas flutuantes.
export function initAmbientCanvas() {
  const ambCanvas = document.getElementById('ambientCanvas');
  const ambCtx = ambCanvas.getContext('2d');
  let width, height;
  let particles = [];
  const runesList = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛃ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', '{ }', '</>', '01', '10'];

  function resizeAmbient() {
    width = ambCanvas.width = window.innerWidth;
    height = ambCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeAmbient);
  resizeAmbient();

  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      char: runesList[Math.floor(Math.random() * runesList.length)],
      size: Math.random() * 12 + 9,
      vy: -0.2 - Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.4 ? '#e6c364' : '#38bdf8'
    });
  }

  function renderAmbient() {
    ambCtx.clearRect(0, 0, width, height);
    ambCtx.font = '12px "JetBrains Mono", monospace';

    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      if (p.y < -20) {
        p.y = height + 20;
        p.x = Math.random() * width;
      }
      ambCtx.fillStyle = p.color;
      ambCtx.globalAlpha = p.alpha;
      ambCtx.fillText(p.char, p.x, p.y);
    });
    requestAnimationFrame(renderAmbient);
  }
  renderAmbient();
}
