import { SITE_CONFIG } from '../config.js';

const { whatsappNumber, endpoints, requestTimeoutMs } = SITE_CONFIG;

export const isAutomationConfigured = () => Boolean(endpoints.automationWebhook);

/** Texto final que chega no WhatsApp. */
export function buildMessage({ name, email, phone, serviceLabel, message }) {
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
export function buildWhatsAppUrl(data) {
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
export async function sendContact(data) {
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
