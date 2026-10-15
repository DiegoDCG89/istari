// Cajado e cristal interativos do hero (reage ao mouse/toque).
export function initCrystalCanvas() {
  const cCanvas = document.getElementById('crystalCanvas');
  const cCtx = cCanvas.getContext('2d');
  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  const container = document.getElementById('crystalContainer');
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetRotX = ny * 0.5;
    targetRotY = nx * 0.6;
  });

  container.addEventListener('mouseleave', () => {
    targetRotX = 0;
    targetRotY = 0;
  });

  // Touch support for mobile interaction
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = container.getBoundingClientRect();
      const nx = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
      const ny = (e.touches[0].clientY - rect.top) / rect.height - 0.5;
      targetRotX = ny * 0.5;
      targetRotY = nx * 0.6;
    }
  }, { passive: true });

  let pulseTime = 0;

  function drawCrystalStaff() {
    pulseTime += 0.03;
    // Smooth lerp rotation
    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;

    const cw = cCanvas.width;
    const ch = cCanvas.height;
    cCtx.clearRect(0, 0, cw, ch);

    cCtx.save();
    cCtx.translate(cw / 2, ch / 2);

    // Parallax offset
    const offX = currentRotY * 40;
    const offY = currentRotX * 30;

    // 1. Arcane Aura Glow behind staff
    const auraGrad = cCtx.createRadialGradient(offX, -50 + offY, 10, offX, -50 + offY, 150);
    auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    auraGrad.addColorStop(0.5, 'rgba(230, 195, 100, 0.25)');
    auraGrad.addColorStop(1, 'rgba(6, 17, 23, 0)');
    cCtx.fillStyle = auraGrad;
    cCtx.beginPath();
    cCtx.arc(offX, -50 + offY, 150, 0, Math.PI * 2);
    cCtx.fill();

    // 2. Braided Staff Branches with Golden Carved Circuit Lines
    cCtx.lineWidth = 3;
    cCtx.strokeStyle = '#b8933b';
    cCtx.beginPath();
    // Main staff trunk
    cCtx.moveTo(-15, 230);
    cCtx.bezierCurveTo(-30, 140, 25, 80, -20, -10 + offY);
    cCtx.stroke();

    cCtx.beginPath();
    cCtx.moveTo(15, 230);
    cCtx.bezierCurveTo(30, 140, -25, 80, 20, -10 + offY);
    cCtx.strokeStyle = '#e6c364';
    cCtx.stroke();

    // Glowing circuit vein on wood
    cCtx.beginPath();
    cCtx.moveTo(0, 220);
    cCtx.lineTo(-10, 160);
    cCtx.lineTo(10, 100);
    cCtx.lineTo(-5, 40);
    cCtx.lineTo(0, -5 + offY);
    cCtx.strokeStyle = '#ffd875';
    cCtx.lineWidth = 2;
    cCtx.shadowColor = '#e6c364';
    cCtx.shadowBlur = 12;
    cCtx.stroke();
    cCtx.shadowBlur = 0;

    // Left cradle root
    cCtx.beginPath();
    cCtx.moveTo(-20, 20);
    cCtx.bezierCurveTo(-55, -20, -40, -80, -28, -120 + offY);
    cCtx.strokeStyle = '#e6c364';
    cCtx.lineWidth = 4;
    cCtx.stroke();

    // Right cradle root
    cCtx.beginPath();
    cCtx.moveTo(20, 20);
    cCtx.bezierCurveTo(55, -20, 40, -80, 28, -120 + offY);
    cCtx.strokeStyle = '#ffd875';
    cCtx.lineWidth = 4;
    cCtx.stroke();

    // 3. Floating Arcane Diamond Prism Crystal (Image 2 & 3 core)
    const crystalY = -60 + offY + Math.sin(pulseTime) * 6;
    const crystalX = offX * 0.8;
    const crystalW = 45;
    const crystalH = 95;

    // Crystal Core Gradient
    const crystalGrad = cCtx.createLinearGradient(crystalX - crystalW, crystalY, crystalX + crystalW, crystalY);
    crystalGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    crystalGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    crystalGrad.addColorStop(1, 'rgba(45, 212, 191, 0.75)');

    // Top Pyramid Facet
    cCtx.fillStyle = crystalGrad;
    cCtx.strokeStyle = '#e6c364';
    cCtx.lineWidth = 2;
    cCtx.shadowColor = '#38bdf8';
    cCtx.shadowBlur = 20;

    cCtx.beginPath();
    cCtx.moveTo(crystalX, crystalY - crystalH); // Top tip
    cCtx.lineTo(crystalX + crystalW, crystalY); // Right point
    cCtx.lineTo(crystalX, crystalY + crystalH); // Bottom tip
    cCtx.lineTo(crystalX - crystalW, crystalY); // Left point
    cCtx.closePath();
    cCtx.fill();
    cCtx.stroke();

    // Inner Diamond facets for 3D realism
    cCtx.beginPath();
    cCtx.moveTo(crystalX, crystalY - crystalH);
    cCtx.lineTo(crystalX + 16, crystalY);
    cCtx.lineTo(crystalX, crystalY + crystalH);
    cCtx.lineTo(crystalX - 16, crystalY);
    cCtx.closePath();
    cCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    cCtx.fill();
    cCtx.strokeStyle = 'rgba(230, 195, 100, 0.8)';
    cCtx.stroke();

    // Horizontal equator facet line
    cCtx.beginPath();
    cCtx.moveTo(crystalX - crystalW, crystalY);
    cCtx.lineTo(crystalX + crystalW, crystalY);
    cCtx.strokeStyle = '#ffffff';
    cCtx.lineWidth = 1.5;
    cCtx.stroke();

    // 4. Orbiting holographic data rings
    cCtx.shadowBlur = 0;
    cCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    cCtx.lineWidth = 1;
    cCtx.beginPath();
    cCtx.ellipse(crystalX, crystalY, 75, 25, pulseTime * 0.4, 0, Math.PI * 2);
    cCtx.stroke();

    cCtx.strokeStyle = 'rgba(230, 195, 100, 0.35)';
    cCtx.beginPath();
    cCtx.ellipse(crystalX, crystalY, 85, 30, -pulseTime * 0.3, 0, Math.PI * 2);
    cCtx.stroke();

    cCtx.restore();

    requestAnimationFrame(drawCrystalStaff);
  }
  drawCrystalStaff();
}
