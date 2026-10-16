// Máscara e validação de telefone brasileiro: (62) 99694-8817 ou (62) 3456-7890.

const onlyDigits = (value) => String(value).replace(/\D/g, '');

/** Só os dígitos, sem o +55 do país (se colado) e limitado a DDD + 9 dígitos. */
export function normalizeDigits(value) {
  let digits = onlyDigits(value);
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
  return digits.slice(0, 11);
}

export function formatPhone(value) {
  const d = normalizeDigits(value);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Aceita fixo (DDD + 8 dígitos) ou celular (DDD + 9 + 8 dígitos). */
export function isValidPhone(value) {
  const d = normalizeDigits(value);
  if (d.length === 11) return d[2] === '9';
  return d.length === 10;
}

export function initPhoneMask(input) {
  if (!input) return;
  input.setAttribute('inputmode', 'tel');
  input.setAttribute('autocomplete', 'tel');
  input.addEventListener('input', () => {
    input.value = formatPhone(input.value);
  });
}
