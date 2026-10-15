import { safeCreateIcons } from './icons.js';
import { showToast } from './toast.js';

let soundEnabled = false;
let synth = null;

export function playChime(frequencies = [523.25, 659.25, 783.99]) {
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

export function initSound() {
  document.getElementById('soundToggleBtn').addEventListener('click', async () => {
    if (soundEnabled) {
      soundEnabled = false;
      setSoundUi(false);
      return;
    }
    try { await enableSound(); } catch (e) { console.warn('Falha ao iniciar áudio:', e); }
  });
}
