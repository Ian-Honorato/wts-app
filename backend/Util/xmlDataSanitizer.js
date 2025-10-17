// src/app/utils/xmlDataSanitizer.js

/**
 * Lista de status EXATAMENTE como estão no ENUM do banco de dados (Migration)
 */
const dbStatusEnum = [
  "Agendado",
  "Em contato",
  "Renovado",
  "Não identificado",
  "Não vai renovar",
  "Cancelado",
  "Ativo",
];

/**
 * Mapeia status "sujos" (vindos da planilha) para status válidos no banco.
 * Chaves devem estar em minúsculo para facilitar a busca.
 */
const statusMap = {
  agendado: "Agendado",
  "em contato": "Em contato",
  renovado: "Renovado",
  "não identificado": "Não identificado",
  "nao vai renovar": "Não vai renovar", // Variação comum
  "não vai renovar": "Não vai renovar",
  cancelado: "Cancelado",
  ativo: "Ativo",
  "esc agendado": "Agendado", // Mapeamento
  tickets: "Não identificado", // Mapeamento
  "sem dados cntt": "Não identificado", // Mapeamento
  "vence em outro mês": "Não identificado", // Mapeamento
};

/**
 * Converte uma string de data (ex: 2025-10-17T00:00:00) para um objeto Date em UTC.
 * Retorna null se a data for inválida ou vazia.
 * @param {string} dateString
 * @returns {Date | null}
 */
function parseDate(dateString) {
  if (!dateString) {
    return null;
  }

  try {
    const datePart = dateString.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);

    if (
      !year ||
      !month ||
      !day ||
      year < 1900 ||
      year > 2100 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      throw new Error("Componentes da data inválidos.");
    }

    const dateObj = new Date(Date.UTC(year, month - 1, day));

    if (
      dateObj.getUTCFullYear() !== year ||
      dateObj.getUTCMonth() !== month - 1 ||
      dateObj.getUTCDate() !== day
    ) {
      throw new Error("Data inconsistente (ex: dia 30 de Fev).");
    }

    if (isNaN(dateObj.getTime())) {
      throw new Error("Data inválida (isNaN).");
    }

    return dateObj;
  } catch (e) {
    console.warn(
      `Falha ao processar data: '${dateString}'. Erro: ${e.message}`
    );
    return null;
  }
}

/**
 * Sanitiza e valida os dados brutos de uma linha do XML.
 * @param {object} rawData - Objeto vindo do mapeador (ex: { cliente_bruto, ... })
 * @returns {{sanitizedData: object, errors: string[] | null}}
 */
function sanitizarXmlRow(rawData) {
  const errors = [];
  const sanitizedData = {};

  // 1. Cliente, CPF/CNPJ e Tipo (LÓGICA ATUALIZADA)
  if (!rawData.cliente_bruto?.trim()) {
    errors.push("A coluna do nome do cliente está vazia.");
    sanitizedData.nome_cliente = "Nome não informado";
    sanitizedData.cpf_cnpj = "";
    sanitizedData.tipo_cliente = "Não identificado";
  } else {
    let extractedCpfCnpj = "";
    sanitizedData.nome_cliente = rawData.cliente_bruto.trim();

    // Lógica Flexível: Prioriza a coluna 'cpf_cnpj_bruto' se ela existir.
    // Caso contrário, tenta extrair da coluna 'cliente_bruto'.
    if (rawData.cpf_cnpj_bruto && String(rawData.cpf_cnpj_bruto).trim()) {
      extractedCpfCnpj = String(rawData.cpf_cnpj_bruto).replace(/\D/g, "");
    } else {
      const regex = /(.*?)\s*\((.*?)\)/;
      const match = rawData.cliente_bruto.match(regex);
      if (match) {
        sanitizedData.nome_cliente = match[1].trim();
        extractedCpfCnpj = match[2].replace(/\D/g, "");
      }
    }

    sanitizedData.cpf_cnpj = extractedCpfCnpj;

    if (!sanitizedData.cpf_cnpj) {
      errors.push(
        `Não foi possível extrair CPF/CNPJ de: '${rawData.cliente_bruto}'.`
      );
      sanitizedData.tipo_cliente = "Não identificado";
    } else if (sanitizedData.cpf_cnpj.length === 11) {
      sanitizedData.tipo_cliente = "Pessoa Física";
    } else if (sanitizedData.cpf_cnpj.length === 14) {
      sanitizedData.tipo_cliente = "Pessoa Jurídica";
    } else {
      errors.push(
        `CPF/CNPJ '${sanitizedData.cpf_cnpj}' possui tamanho inválido.`
      );
      sanitizedData.tipo_cliente = "Não identificado";
    }
  }

  // 2. Campos de Texto Simples
  sanitizedData.numero_contrato = rawData.numero_contrato || null;
  sanitizedData.nome_certificado = rawData.nome_certificado || null;
  sanitizedData.representante = rawData.representante_legal || null;
  sanitizedData.email_cliente = rawData.email_cliente || null;

  // 3. Parceiro (Indicação)
  sanitizedData.nome_parceiro =
    rawData.nome_parceiro?.trim() || "Não identificado";

  // 4. Telefone
  if (!rawData.telefone?.trim()) {
    errors.push("A coluna 'CONTATO' (telefone) é obrigatória.");
    sanitizedData.telefone = null;
  } else {
    const cleaned = String(rawData.telefone).replace(/\D/g, "");
    if (cleaned.length >= 10 && cleaned.length <= 11) {
      sanitizedData.telefone = "55" + cleaned; // Adiciona DDI do Brasil
    } else {
      errors.push(
        `Telefone '${rawData.telefone}' é inválido (tamanho ${cleaned.length} dígitos).`
      );
      sanitizedData.telefone = null;
    }
  }

  // 5. Status (Com mapeamento para ENUM válido)
  if (!rawData.status?.trim()) {
    sanitizedData.status = "Não identificado";
  } else {
    const statusLimpo = rawData.status.trim().toLowerCase();
    const statusMapeado = statusMap[statusLimpo];
    if (statusMapeado) {
      sanitizedData.status = statusMapeado;
    } else {
      sanitizedData.status = "Não identificado";
      errors.push(
        `Status '${rawData.status.trim()}' não é válido e foi definido como 'Não identificado'.`
      );
    }
  }

  // 6. Datas
  sanitizedData.data_vencimento = parseDate(rawData.data_vencimento);
  if (rawData.data_vencimento && !sanitizedData.data_vencimento) {
    errors.push(`Data de Vencimento '${rawData.data_vencimento}' é inválida.`);
  }

  sanitizedData.data_renovacao = parseDate(rawData.data_renovacao);
  if (rawData.data_renovacao && !sanitizedData.data_renovacao) {
    errors.push(`Data de Renovação '${rawData.data_renovacao}' é inválida.`);
  }

  return { sanitizedData, errors: errors.length ? errors : null };
}

export default sanitizarXmlRow;
