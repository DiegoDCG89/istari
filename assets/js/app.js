/* app.js — versão em um único arquivo (sem ES modules), funciona abrindo o index.html por duplo clique ou hospedado.
   Gerado a partir dos módulos de assets/js/. */
(function () {
'use strict';

// ---- config.js ----
// Única fonte de configuração do site. Edite aqui, não no código.
const SITE_CONFIG = Object.freeze({
  // Formato: país + DDD + número, só dígitos. (62) 9 9694-8817 -> 5562996948817
  whatsappNumber: '5562996948817',

  endpoints: {
    // URL do "Custom webhook" criado no Make (veja README.md, passo 1).
    // Enquanto estiver vazio, o envio automático para o WhatsApp fica inativo.
    automationWebhook: '',
    // Backup: cada mensagem também chega no painel/e-mail do Formspree.
    formspree: 'https://formspree.io/f/xdeayvqg',
  },

  // Enquanto o webhook não estiver configurado, abre o WhatsApp com a mensagem
  // pronta (exige confirmação do visitante). Com o webhook ativo, não é usado.
  fallbackToWhatsAppLink: true,

  requestTimeoutMs: 10000,
});

// ---- ui/icons.js ----
// Renderiza ícones Lucide sem quebrar o site se o CDN falhar.
function safeCreateIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try { window.lucide.createIcons(); } catch (e) { console.warn('Lucide falhou:', e); }
  } else {
    console.warn('Lucide não carregou (CDN indisponível?). Ícones não serão exibidos.');
  }
}

// ---- ui/toast.js ----
const HIDE_DELAY_MS = 4500;
const HIDDEN = ['translate-y-24', 'opacity-0', 'pointer-events-none'];
let hideTimer;

function showToast(title, desc) {
  const toast = document.getElementById('toastNotification');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastDesc').textContent = desc;
  toast.classList.remove(...HIDDEN);
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.add(...HIDDEN), HIDE_DELAY_MS);
}

// ---- ui/sound.js ----
let soundEnabled = false;
let synth = null;

function playChime(frequencies = [523.25, 659.25, 783.99]) {
  if (!soundEnabled || !synth) return;
  try {
    frequencies.forEach((freq, i) => {
      setTimeout(() => synth.triggerAttackRelease(freq, '16n'), i * 60);
    });
  } catch { /* som é opcional */ }
}

function setSoundUi(on) {
  document.getElementById('soundIcon').setAttribute('data-lucide', on ? 'volume-2' : 'volume-x');
  document.getElementById('soundStatus').textContent = on ? 'Som: Ativado' : 'Som: Desativado';
  safeCreateIcons();
}

async function enableSound() {
  await Tone.start();
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.8 },
  }).toDestination();
  synth.volume.value = -16;
  soundEnabled = true;
  setSoundUi(true);
  playChime([659.25, 783.99, 987.77]);
  showToast('Áudio Ativado', 'Interações agora emitem harmônicos sutis.');
}

function initSound() {
  const button = document.getElementById('soundToggleBtn');
  if (!button) return; // botão de som removido do HTML
  button.addEventListener('click', async () => {
    if (soundEnabled) {
      soundEnabled = false;
      setSoundUi(false);
      return;
    }
    try { await enableSound(); } catch (e) { console.warn('Falha ao iniciar áudio:', e); }
  });
}

// ---- ui/mobileMenu.js ----
function initMobileMenu() {
  const button = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (!button || !drawer) return;
  button.addEventListener('click', () => drawer.classList.toggle('hidden'));
  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => drawer.classList.add('hidden'));
  });
}

// ---- ui/phoneMask.js ----
// Máscara e validação de telefone brasileiro: (62) 99694-8817 ou (62) 3456-7890.

const onlyDigits = (value) => String(value).replace(/\D/g, '');

/** Só os dígitos, sem o +55 do país (se colado) e limitado a DDD + 9 dígitos. */
function normalizeDigits(value) {
  let digits = onlyDigits(value);
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
  return digits.slice(0, 11);
}

function formatPhone(value) {
  const d = normalizeDigits(value);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Aceita fixo (DDD + 8 dígitos) ou celular (DDD + 9 + 8 dígitos). */
function isValidPhone(value) {
  const d = normalizeDigits(value);
  if (d.length === 11) return d[2] === '9';
  return d.length === 10;
}

function initPhoneMask(input) {
  if (!input) return;
  input.setAttribute('inputmode', 'tel');
  input.setAttribute('autocomplete', 'tel');
  input.addEventListener('input', () => {
    input.value = formatPhone(input.value);
  });
}

// ---- services/contactService.js ----
const { whatsappNumber, endpoints, requestTimeoutMs } = SITE_CONFIG;

const isAutomationConfigured = () => Boolean(endpoints.automationWebhook);

/** Texto final que chega no WhatsApp. */
function buildMessage({ name, email, phone, serviceLabel, message }) {
  return [
    'Novo contato pelo site Istari',
    '',
    `Nome/Cargo: ${name}`,
    `E-mail: ${email}`,
    `Telefone: ${phone}`,
    `Interesse: ${serviceLabel}`,
    `Mensagem: ${message || '(não informado)'}`,
  ].join('\n');
}

/** Link wa.me (usado só como alternativa quando o webhook não está configurado). */
function buildWhatsAppUrl(data) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildMessage(data))}`;
}

// Destino 1: webhook do Make -> WhatsApp. Requisição "simples" (form-urlencoded +
// no-cors) para não depender de CORS; a resposta fica opaca, então só falhas de rede aparecem.
async function postToAutomation(payload) {
  await fetch(endpoints.automationWebhook, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams(payload),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
}

// Destino 2: Formspree (backup em painel + e-mail).
async function postToFormspree(payload) {
  const res = await fetch(endpoints.formspree, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (!res.ok) throw new Error(`Formspree respondeu ${res.status}`);
}

/** Envia para todos os destinos configurados; sucesso se ao menos um aceitar. */
async function sendContact(data) {
  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    interesse: data.serviceLabel,
    message: data.message,
    text: buildMessage(data),
    to: whatsappNumber,
    origem: 'Site Istari - Formulário de Contato',
  };

  const jobs = [];
  if (isAutomationConfigured()) jobs.push(postToAutomation(payload));
  if (endpoints.formspree) jobs.push(postToFormspree(payload));
  if (jobs.length === 0) throw new Error('Nenhum destino de envio configurado.');

  const results = await Promise.allSettled(jobs);
  if (!results.some((r) => r.status === 'fulfilled')) {
    throw new Error('Todos os destinos falharam.');
  }
}

// ---- features/contactForm.js ----
// Sem webhook configurado, o envio automático para o WhatsApp não existe:
// abrimos o WhatsApp com a mensagem pronta e o visitante confirma por lá.
const usesWhatsAppFallback = () =>
  !isAutomationConfigured() && SITE_CONFIG.fallbackToWhatsAppLink;

function readForm(form) {
  const f = form.elements;
  return {
    name: f.name.value.trim(),
    email: f.email.value.trim(),
    phone: f.phone.value.trim(),
    serviceLabel: f.service.selectedOptions[0].text,
    message: f.message.value.trim(),
    honeypot: f.website.value,
  };
}

function setSending(button, label, sending) {
  button.disabled = sending;
  button.classList.toggle('opacity-60', sending);
  label.textContent = sending ? 'Enviando...' : 'Enviar mensagem';
}

// Precisa ser chamado direto no clique, senão o navegador bloqueia a janela.
function openWhatsApp(url) {
  const win = window.open(url, '_blank');
  if (!win) return false;
  win.opener = null;
  return true;
}

function updateHint(button) {
  const hint = button.nextElementSibling;
  if (!hint || hint.tagName !== 'P') return;
  hint.textContent = usesWhatsAppFallback()
    ? 'Ao enviar, abriremos o WhatsApp com sua mensagem pronta — é só confirmar o envio por lá.'
    : 'Sua mensagem chega direto no WhatsApp da nossa equipe — sem etapas extras.';
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const button = document.getElementById('contactSubmitBtn');
  const label = document.getElementById('contactSubmitLabel');

  initPhoneMask(form.elements.phone);
  updateHint(button);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = readForm(form);

    if (data.honeypot) return; // bot: ignora em silêncio

    if (!data.name || !data.email) {
      playChime([349.23, 293.66]);
      showToast('Faltam alguns dados', 'Preencha nome e e-mail antes de enviar.');
      return;
    }
    if (!isValidPhone(data.phone)) {
      playChime([349.23, 293.66]);
      showToast('Telefone inválido', 'Informe o DDD e o número, ex.: (62) 99694-8817.');
      form.elements.phone.focus();
      return;
    }

    let redirectUrl = null;
    if (usesWhatsAppFallback()) {
      const url = buildWhatsAppUrl(data);
      if (!openWhatsApp(url)) redirectUrl = url; // janela bloqueada: abre na mesma aba
    }

    setSending(button, label, true);
    try {
      await sendContact(data);
      playChime([523.25, 659.25, 783.99, 1046.5]);
      if (usesWhatsAppFallback()) {
        showToast('Mensagem registrada!', 'Confirme o envio na janela do WhatsApp que abriu para falarmos agora.');
      } else {
        showToast('Mensagem enviada!', `Obrigado, ${data.name}! Nossa equipe já recebeu seu contato.`);
      }
      form.reset();
    } catch (err) {
      console.error(err);
      playChime([349.23, 293.66]);
      showToast('Não foi possível enviar', 'Tente novamente ou chame direto no WhatsApp: (62) 9 9694-8817.');
    } finally {
      setSending(button, label, false);
      if (redirectUrl) window.location.assign(redirectUrl);
    }
  });
}

// ---- canvas/ambient.js ----
// Fundo animado: runas e faíscas flutuantes.
function initAmbientCanvas() {
  const ambCanvas = document.getElementById('ambientCanvas');
  if (!ambCanvas) return;
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

// ---- canvas/crystal.js ----
// Cajado e cristal interativos do hero (reage ao mouse/toque).
function initCrystalCanvas() {
  const cCanvas = document.getElementById('crystalCanvas');
  if (!cCanvas) return; // cristal removido do HTML
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

// ---- main.js ----
safeCreateIcons();
initSound();
initMobileMenu();
initAmbientCanvas();
initCrystalCanvas();
initContactForm();

})();
