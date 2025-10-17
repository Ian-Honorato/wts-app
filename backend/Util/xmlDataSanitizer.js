// src/app/utils/xmlDataSanitizer.js

const dbStatusEnum = [
  "Agendado",
  "Em contato",
  "Renovado",
  "Não identificado",
  "Não vai renovar",
  "Cancelado",
  "Ativo",
];
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
function sanitizarXmlRow(rawData) {
  const errors = [];
  const sanitizedData = {};

  // 1. Cliente, CPF/CNPJ e Tipo
  if (!rawData.cliente_bruto?.trim()) {
    errors.push("A coluna 'CLIENTE' está vazia.");
    sanitizedData.nome_cliente = "Nome não informado";
    sanitizedData.cpf_cnpj = "";
    sanitizedData.tipo_cliente = "Não identificado";
  } else {
    const regex = /(.*?)\s*\((.*?)\)/;
    const match = rawData.cliente_bruto.match(regex);

    if (match) {
      sanitizedData.nome_cliente = match[1].trim();
      sanitizedData.cpf_cnpj = match[2].replace(/\D/g, "");
    } else {
      // Se não houver parênteses, assume que é só o nome
      sanitizedData.nome_cliente = rawData.cliente_bruto.trim();
      sanitizedData.cpf_cnpj = ""; // Força o erro abaixo
    }

    if (!sanitizedData.cpf_cnpj) {
      errors.push(
        `Não foi possível extrair CPF/CNPJ de: '${rawData.cliente_bruto}'. Formato esperado: 'Nome (Documento)'.`
      );
      sanitizedData.tipo_cliente = "Não identificado";
    } else if (sanitizedData.cpf_cnpj.length === 11) {
      sanitizedData.tipo_cliente = "Pessoa Física";
    } else if (sanitizedData.cpf_cnpj.length === 14) {
      sanitizedData.tipo_cliente = "Pessoa Jurídica";
    } else {
      errors.push(
        `CPF/CNPJ '${sanitizedData.cpf_cnpj}' (extraído de '${rawData.cliente_bruto}') possui tamanho inválido.`
      );
      sanitizedData.tipo_cliente = "Não identificado";
    }
  }

  sanitizedData.numero_contrato = rawData.numero_contrato || null;
  sanitizedData.nome_certificado = rawData.nome_certificado || null;
  sanitizedData.representante = rawData.representante_legal || null;
  sanitizedData.email_cliente = rawData.email_cliente || null;

  // 3. Parceiro (Indicação)
  if (!rawData.nome_parceiro?.trim()) {
    sanitizedData.nome_parceiro = "Não identificado";
  } else {
    sanitizedData.nome_parceiro = rawData.nome_parceiro.trim();
  }

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
      // Se não está no mapa, verifica se é um valor válido que não foi mapeado
      const statusOriginalCase = dbStatusEnum.find(
        (s) => s.toLowerCase() === statusLimpo
      );
      if (statusOriginalCase) {
        sanitizedData.status = statusOriginalCase;
      } else {
        // Se realmente não é válido, usa o padrão e reporta o erro
        sanitizedData.status = "Não identificado";
        errors.push(
          `Status '${rawData.status.trim()}' não é válido e foi definido como 'Não identificado'.`
        );
      }
    }
  }

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
