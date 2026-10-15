// Renderiza ícones Lucide sem quebrar o site se o CDN falhar.
export function safeCreateIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try { window.lucide.createIcons(); } catch (e) { console.warn('Lucide falhou:', e); }
  } else {
    console.warn('Lucide não carregou (CDN indisponível?). Ícones não serão exibidos.');
  }
}
