// Única fonte de configuração do site. Edite aqui, não no código.
export const SITE_CONFIG = Object.freeze({
  // Formato: país + DDD + número, só dígitos. (62) 9 9694-8817 -> 5562996948817
  whatsappNumber: '5562996948817',

  endpoints: {
    // URL do "Custom webhook" criado no Make (veja README.md, passo 1).
    // Enquanto estiver vazio, o envio automático para o WhatsApp fica inativo.
    automationWebhook: '',
    // Backup: cada mensagem também chega no painel/e-mail do Formspree.
    formspree: 'https://formspree.io/f/mvkgadoz',
  },

  // Enquanto o webhook não estiver configurado, abre o WhatsApp com a mensagem
  // pronta (exige confirmação do visitante). Com o webhook ativo, não é usado.
  fallbackToWhatsAppLink: true,

  requestTimeoutMs: 10000,
});
