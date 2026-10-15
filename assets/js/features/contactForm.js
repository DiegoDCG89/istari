import { SITE_CONFIG } from '../config.js';
import { sendContact, buildWhatsAppUrl, isAutomationConfigured } from '../services/contactService.js';
import { playChime } from '../ui/sound.js';
import { showToast } from '../ui/toast.js';

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

export function initContactForm() {
  const form = document.getElementById('contactForm');
  const button = document.getElementById('contactSubmitBtn');
  const label = document.getElementById('contactSubmitLabel');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = readForm(form);

    if (data.honeypot) return; // bot: ignora em silêncio

    if (!data.name || !data.email || !data.phone) {
      playChime([349.23, 293.66]);
      showToast('Faltam alguns dados', 'Preencha nome, e-mail e telefone antes de enviar.');
      return;
    }

    // Alternativa temporária: sem webhook, abre o WhatsApp (precisa ser síncrono ao clique).
    if (!isAutomationConfigured() && SITE_CONFIG.fallbackToWhatsAppLink) {
      window.open(buildWhatsAppUrl(data), '_blank', 'noopener');
    }

    setSending(button, label, true);
    try {
      await sendContact(data);
      playChime([523.25, 659.25, 783.99, 1046.5]);
      showToast('Mensagem enviada!', `Obrigado, ${data.name}! Nossa equipe já recebeu seu contato.`);
      form.reset();
    } catch (err) {
      console.error(err);
      playChime([349.23, 293.66]);
      showToast('Não foi possível enviar', 'Tente novamente ou chame direto no WhatsApp: (62) 9 9694-8817.');
    } finally {
      setSending(button, label, false);
    }
  });
}
