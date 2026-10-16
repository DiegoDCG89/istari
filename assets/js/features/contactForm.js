import { SITE_CONFIG } from '../config.js';
import { sendContact, buildWhatsAppUrl, isAutomationConfigured } from '../services/contactService.js';
import { showToast } from '../ui/toast.js';
import { initPhoneMask, isValidPhone } from '../ui/phoneMask.js';

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

export function initContactForm() {
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
      showToast('Faltam alguns dados', 'Preencha nome e e-mail antes de enviar.');
      return;
    }
    if (!isValidPhone(data.phone)) {
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
        if (usesWhatsAppFallback()) {
        showToast('Mensagem registrada!', 'Confirme o envio na janela do WhatsApp que abriu para falarmos agora.');
      } else {
        showToast('Mensagem enviada!', `Obrigado, ${data.name}! Nossa equipe já recebeu seu contato.`);
      }
      form.reset();
    } catch (err) {
      console.error(err);
      showToast('Não foi possível enviar', 'Tente novamente ou chame direto no WhatsApp: (62) 9 9694-8817.');
    } finally {
      setSending(button, label, false);
      if (redirectUrl) window.location.assign(redirectUrl);
    }
  });
}
