const HIDE_DELAY_MS = 4500;
const HIDDEN = ['translate-y-24', 'opacity-0', 'pointer-events-none'];
let hideTimer;

export function showToast(title, desc) {
  const toast = document.getElementById('toastNotification');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastDesc').textContent = desc;
  toast.classList.remove(...HIDDEN);
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.add(...HIDDEN), HIDE_DELAY_MS);
}
