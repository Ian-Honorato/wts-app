import {
  statusMap,
  parseDate,
  sanitizePhoneNumber,
} from "../Util/sanitizerUtils.js";

export function sanitizeTypeA(rawData) {
  const errors = [];
  const sanitizedData = {};

  // 1. Processamento de Cliente e extração de CPF/CNPJ
  if (!rawData.cliente_bruto?.trim()) {
    errors.push("A coluna do nome do cliente está vazia.");
  } else {
    let extractedCpfCnpj = "";
    sanitizedData.nome_cliente = rawData.cliente_bruto.trim();

    const match = rawData.cliente_bruto.match(/\((.*?)\)/);
    if (match && match[1]) {
      sanitizedData.nome_cliente = rawData.cliente_bruto.split("(")[0].trim();
      extractedCpfCnpj = match[1].replace(/\D/g, "");
    }

    sanitizedData.cpf_cnpj = extractedCpfCnpj;

    if (!sanitizedData.cpf_cnpj) {
      errors.push(
        `Não foi possível extrair CPF/CNPJ de: '${rawData.cliente_bruto}'.`
      );
    } else if (
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

  // 3. Sanitização de campos de texto, status e parceiro
  sanitizedData.numero_contrato = rawData.numero_contrato || null;
  sanitizedData.nome_certificado = rawData.nome_certificado || null;
  sanitizedData.representante = rawData.representante_legal || null;
  sanitizedData.email_cliente = rawData.email_cliente || null;
  sanitizedData.nome_parceiro =
    rawData.nome_parceiro?.trim() || "Não identificado";

  const statusLimpo = rawData.status?.trim().toLowerCase();
  sanitizedData.status = statusMap[statusLimpo] || "Não identificado";

  // 4. Sanitização das datas
  sanitizedData.data_vencimento = parseDate(rawData.data_vencimento);
  sanitizedData.data_renovacao = null;

  // 5. Sanitização do Telefone
  const phoneResult = sanitizePhoneNumber(rawData.telefone);
  if (phoneResult.error) {
    errors.push(phoneResult.error);
  }
  sanitizedData.telefone = phoneResult.phone;

  return { sanitizedData, errors: errors.length ? errors : null };
}
