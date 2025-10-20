import {
  statusMap,
  parseDate,
  sanitizePhoneNumber,
  sanitizeEmail, // Importar a nova função
} from "../Util/sanitizerUtils.js";

export function sanitizeTypeB(rawData) {
  const errors = [];
  const sanitizedData = {};

  if (!rawData.cliente_bruto?.trim()) {
    errors.push("A coluna do nome do cliente está vazia.");
  }
  sanitizedData.nome_cliente = rawData.cliente_bruto?.trim() || "";

  if (!rawData.cpf_cnpj_bruto || !String(rawData.cpf_cnpj_bruto).trim()) {
    errors.push(
      `CPF/CNPJ não fornecido para o cliente '${sanitizedData.nome_cliente}'.`
    );
  } else {
    sanitizedData.cpf_cnpj = String(rawData.cpf_cnpj_bruto).replace(/\D/g, "");
    if (
      sanitizedData.cpf_cnpj.length !== 11 &&
      sanitizedData.cpf_cnpj.length !== 14
    ) {
      errors.push(
        `CPF/CNPJ '${sanitizedData.cpf_cnpj}' possui tamanho inválido.`
      );
    }
  }

  sanitizedData.tipo_cliente = "Não identificado";
  if (sanitizedData.cpf_cnpj?.length === 11)
    sanitizedData.tipo_cliente = "Pessoa Física";
  if (sanitizedData.cpf_cnpj?.length === 14)
    sanitizedData.tipo_cliente = "Pessoa Jurídica";

  sanitizedData.numero_contrato = rawData.numero_contrato || null;
  sanitizedData.nome_certificado = rawData.nome_certificado || null;
  sanitizedData.representante = rawData.representante_legal || null;

  sanitizedData.nome_parceiro =
    rawData.nome_parceiro?.trim() || "Não identificado";

  const statusLimpo = rawData.status?.trim().toLowerCase();
  sanitizedData.status = statusMap[statusLimpo] || "Não identificado";

  // Sanitização do E-mail (CORRIGIDO)
  const emailResult = sanitizeEmail(rawData.email_cliente);
  if (emailResult.error) {
    errors.push(emailResult.error);
  }
  sanitizedData.email_cliente = emailResult.email;

  // Sanitização das datas
  sanitizedData.data_vencimento = parseDate(rawData.data_vencimento);
  sanitizedData.data_renovacao = parseDate(rawData.data_renovacao);

  // Sanitização do Telefone
  const phoneResult = sanitizePhoneNumber(rawData.telefone);
  if (phoneResult.error) {
    errors.push(phoneResult.error);
  }
  sanitizedData.telefone = phoneResult.phone;

  return { sanitizedData, errors: errors.length ? errors : null };
}
