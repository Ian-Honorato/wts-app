// src/app/utils/xmlDataSanitizer.js

// Mapeia status "sujos" da planilha para status válidos no banco
const statusMap = {
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

// Converte string de data para objeto Date em UTC ou null se inválida
function parseDate(dateString) {
  if (!dateString) return null;
  try {
    const datePart = dateString.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    if (!year || !month || !day || year < 1900 || month > 2100) return null;
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(dateObj.getTime()) || dateObj.getUTCFullYear() !== year)
      return null;
    return dateObj;
  } catch {
    return null;
  }
}

function sanitizarXmlRow(rawData) {
  const errors = [];
  const sanitizedData = {};

  // 1. Cliente, CPF/CNPJ e Tipo
  if (!rawData.cliente_bruto?.trim()) {
    errors.push("A coluna do nome do cliente está vazia.");
  } else {
    let extractedCpfCnpj = "";
    sanitizedData.nome_cliente = rawData.cliente_bruto.trim();

    // Lógica Flexível: Prioriza a coluna 'cpf_cnpj_bruto' (do layout 'type_b')
    if (rawData.cpf_cnpj_bruto && String(rawData.cpf_cnpj_bruto).trim()) {
      extractedCpfCnpj = String(rawData.cpf_cnpj_bruto).replace(/\D/g, "");
    } else {
      // Se não houver, tenta extrair de 'cliente_bruto' (do layout 'type_a')
      const match = rawData.cliente_bruto.match(/\((.*?)\)/);
      if (match && match[1]) {
        sanitizedData.nome_cliente = rawData.cliente_bruto.split("(")[0].trim();
        extractedCpfCnpj = match[1].replace(/\D/g, "");
      }
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

  // Define o tipo de cliente
  sanitizedData.tipo_cliente = "Não identificado";
  if (sanitizedData.cpf_cnpj?.length === 11)
    sanitizedData.tipo_cliente = "Pessoa Física";
  if (sanitizedData.cpf_cnpj?.length === 14)
    sanitizedData.tipo_cliente = "Pessoa Jurídica";

  // 2. Campos de Texto, Status e Datas
  sanitizedData.numero_contrato = rawData.numero_contrato || null;
  sanitizedData.nome_certificado = rawData.nome_certificado || null;
  sanitizedData.representante = rawData.representante_legal || null;
  sanitizedData.email_cliente = rawData.email_cliente || null;
  sanitizedData.nome_parceiro =
    rawData.nome_parceiro?.trim() || "Não identificado";

  const statusLimpo = rawData.status?.trim().toLowerCase();
  sanitizedData.status = statusMap[statusLimpo] || "Não identificado";

  sanitizedData.data_vencimento = parseDate(rawData.data_vencimento);
  sanitizedData.data_renovacao = parseDate(rawData.data_renovacao);

  // 3. Telefone
  if (!rawData.telefone?.trim()) {
    sanitizedData.telefone = null; // Apenas define como nulo, sem gerar erro
  } else {
    const cleaned = String(rawData.telefone).replace(/\D/g, "");
    if (cleaned.length >= 10 && cleaned.length <= 11) {
      sanitizedData.telefone = "55" + cleaned;
    } else {
      errors.push(`Telefone '${rawData.telefone}' é inválido.`);
    }
  }

  return { sanitizedData, errors: errors.length ? errors : null };
}

export default sanitizarXmlRow;
