export const statusMap = {
  agendado: "Agendado",
  "em contato": "Em contato",
  renovado: "Renovado",
  "não identificado": "Não identificado",
  "nao vai renovar": "Não vai renovar",
  "não vai renovar": "Não vai renovar",
  cancelado: "Cancelado",
  ativo: "Ativo",
  "esc agendado": "Agendado",
  tickets: "Não identificado",
  "sem dados cntt": "Não identificado",
  "vence em outro mês": "Não identificado",
};

export function parseDate(dateString) {
  if (!dateString) return null;
  try {
    const datePart = dateString.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day || year < 1900 || year > 2100) return null;

    const dateObj = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(dateObj.getTime()) || dateObj.getUTCFullYear() !== year) {
      return null;
    }

    return dateObj;
  } catch {
    return null;
  }
}
export function sanitizePhoneNumber(phoneString) {
  // Se a string for nula, vazia, ou explicitamente "Não identificado", retorne nulo sem erro.
  if (
    !phoneString ||
    !String(phoneString).trim() ||
    String(phoneString).trim().toLowerCase() === "não identificado"
  ) {
    return { phone: null, error: null };
  }

  const cleaned = String(phoneString).replace(/\D/g, "");

  if (cleaned.length >= 10 && cleaned.length <= 11) {
    return { phone: "55" + cleaned, error: null };
  }

  if (
    cleaned.startsWith("55") &&
    cleaned.length >= 12 &&
    cleaned.length <= 13
  ) {
    return { phone: cleaned, error: null };
  }
  return { phone: null, error: `Telefone '${phoneString}' é inválido.` };
}
export function sanitizeEmail(emailString) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailString ||
    !String(emailString).trim() ||
    String(emailString).trim().toLowerCase() === "não identificado"
  ) {
    return { email: null, error: null };
  }

  const trimmedEmail = String(emailString).trim();

  // Testa o e-mail contra a Regex.
  if (emailRegex.test(trimmedEmail)) {
    return { email: trimmedEmail, error: null };
  }

  return {
    email: null,
    error: `O e-mail '${emailString}' possui um formato inválido.`,
  };
}
