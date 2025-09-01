// src/app/utils/xmlDataSanitizer.js

const statusEnumValidos = [
  "Agendado",
  "Em contato",
  "ESC Agendado",
  "Não vai renovar",
  "Sem dados CNTT",
  "Vence em outro mês",
  "Tickets",
  "Ativo",
  "Não identificado",
  "Renovado",
  "Cancelado",
];

function sanitizarXmlRow(rawData) {
  const errors = [];
  const sanitizedData = {};

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
      sanitizedData.nome_cliente = rawData.cliente_bruto.trim();
      sanitizedData.cpf_cnpj = "";
    }

    if (!sanitizedData.cpf_cnpj) {
      errors.push(
        `Não foi possível extrair CPF/CNPJ de: '${rawData.cliente_bruto}'.`
      );
      sanitizedData.tipo_cliente = ""; // vazio
    } else if (sanitizedData.cpf_cnpj.length === 11) {
      sanitizedData.tipo_cliente = "Pessoa Física";
    } else if (sanitizedData.cpf_cnpj.length === 14) {
      sanitizedData.tipo_cliente = "Pessoa Jurídica";
    } else {
      errors.push(
        `CPF/CNPJ '${sanitizedData.cpf_cnpj}' possui tamanho inválido.`
      );
      sanitizedData.tipo_cliente = ""; // vazio
    }
  }
  sanitizedData.numero_contrato = rawData.numero_contrato || null;
  sanitizedData.nome_certificado = rawData.nome_certificado || null;
  sanitizedData.representante = rawData.representante_legal || null;
  sanitizedData.email_cliente = rawData.email_cliente || null;

  // 3. Parceiro (Coluna 'INDICAÇÃO')
  if (!rawData.nome_parceiro?.trim()) {
    sanitizedData.nome_parceiro = "Não identificado";
  } else {
    sanitizedData.nome_parceiro = rawData.nome_parceiro.trim();
  }

  // 4. Telefone
  if (!rawData.telefone?.trim()) {
    errors.push("A coluna 'CONTATO' (telefone) é obrigatória.");
  } else {
    const cleaned = String(rawData.telefone).replace(/\D/g, "");
    if (cleaned.length >= 10 && cleaned.length <= 11) {
      sanitizedData.telefone = "55" + cleaned;
    } else {
      errors.push(`Telefone '${rawData.telefone}' é inválido.`);
    }
  }

  if (!rawData.status?.trim()) {
    sanitizedData.status = "Não identificado";
  } else {
    const statusLimpo = rawData.status.trim();
    const statusValido = statusEnumValidos.find(
      (s) => s.toLowerCase() === statusLimpo.toLowerCase()
    );
    if (statusValido) {
      sanitizedData.status = statusValido;
    } else {
      sanitizedData.status = "Não identificado";
      errors.push(`Status '${statusLimpo}' na coluna 'RENOVADO' não é válido.`);
    }
  }

  if (rawData.data_vencimento) {
    const datePart = rawData.data_vencimento.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    if (!isNaN(dateObj.getTime())) {
      sanitizedData.data_vencimento = dateObj;
    } else {
      errors.push(`Data '${rawData.data_vencimento}' é inválida.`);
      sanitizedData.data_vencimento = null;
    }
  } else {
    sanitizedData.data_vencimento = null;
  }
  //console.log("Sanitized Data:", sanitizedData);
  return { sanitizedData, errors: errors.length ? errors : null };
}

export default sanitizarXmlRow;
