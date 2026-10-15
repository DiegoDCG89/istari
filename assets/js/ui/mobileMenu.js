export function initMobileMenu() {
  const button = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  button.addEventListener('click', () => drawer.classList.toggle('hidden'));
  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => drawer.classList.add('hidden'));
  });
}
