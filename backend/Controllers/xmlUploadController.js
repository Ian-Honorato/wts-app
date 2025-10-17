import { parseStringPromise } from "xml2js";
import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
} from "../Models/index.js";

import sanitizarXmlRow from "../utils/xmlDataSanitizer.js";
import { errorHandler } from "../utils/errorHandler.js";

// Função auxiliar para normalizar o número do contrato
const normalizarNumeroContrato = (numeroContrato) => {
  if (!numeroContrato || typeof numeroContrato !== "string") return "";
  return numeroContrato.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};

// Função que centraliza a lógica de banco de dados
async function processarDados(sanitizedData, { transaction, userId }) {
  const { nome_cliente, cpf_cnpj, ...restOfData } = sanitizedData;

  if (!cpf_cnpj) {
    throw new Error(
      "CPF/CNPJ ausente ou inválido, não é possível criar ou atualizar."
    );
  }

  // Encontrar ou Criar Parceiro
  const [parceiro] = await Parceiro.findOrCreate({
    where: { nome_escritorio: restOfData.nome_parceiro },
    defaults: {
      nome_escritorio: restOfData.nome_parceiro,
      cadastrado_por_id: userId,
    },
    transaction,
  });

  // Encontrar ou Criar Certificado
  let certificado = null;
  if (restOfData.nome_certificado) {
    [certificado] = await Certificado.findOrCreate({
      where: { nome_certificado: restOfData.nome_certificado },
      defaults: { nome_certificado: restOfData.nome_certificado },
      transaction,
    });
  }

  // Encontrar ou Criar Cliente
  const [cliente, isNewClient] = await Cliente.unscoped().findOrCreate({
    where: { cpf_cnpj },
    defaults: {
      nome: nome_cliente,
      cpf_cnpj,
      tipo_cliente: restOfData.tipo_cliente,
      representante: restOfData.representante,
      email: restOfData.email_cliente,
      telefone: restOfData.telefone,
      id_usuario: userId,
      referencia_parceiro: parceiro?.id,
    },
    paranoid: false,
    transaction,
  });

  if (cliente.deleted_at) await cliente.restore({ transaction });
  if (!isNewClient) {
    await cliente.update(
      {
        nome: nome_cliente,
        email: restOfData.email_cliente,
        representante: restOfData.representante,
        telefone: restOfData.telefone,
        tipo_cliente: restOfData.tipo_cliente,
        referencia_parceiro: parceiro?.id,
      },
      { transaction }
    );
  }

  // VERIFICAÇÃO E PROCESSAMENTO DE CONTRATO
  const numeroContratoNormalizado = normalizarNumeroContrato(
    restOfData.numero_contrato
  );
  if (!numeroContratoNormalizado) return { isNewClient }; // Pula se não houver contrato

  const contratoExistente = await ContratoCertificado.findOne({
    where: { numero_contrato: numeroContratoNormalizado },
    paranoid: false,
    transaction,
  });

  if (contratoExistente) {
    if (contratoExistente.cliente_id !== cliente.id) {
      throw new Error(
        `Conflito: Contrato '${numeroContratoNormalizado}' já pertence a outro cliente.`
      );
    }
    // Lógica de atualização (ex: data) pode ser adicionada aqui se necessário
  } else {
    await ContratoCertificado.create(
      {
        numero_contrato: numeroContratoNormalizado,
        data_vencimento: restOfData.data_vencimento,
        data_renovacao: restOfData.data_renovacao,
        status: restOfData.status,
        cliente_id: cliente.id,
        usuario_id: userId,
        referencia_certificado: certificado?.id,
      },
      { transaction }
    );
  }
  return { isNewClient };
}

class XmlUploadController {
  async store(req, res) {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
    }

    const t = await sequelize.transaction();
    const importReport = {
      successCount: 0,
      updateCount: 0,
      errorCount: 0,
      errors: [],
    };

    try {
      const xmlContent = req.file.buffer.toString("utf-8");
      const parsedData = await parseStringPromise(xmlContent, {
        explicitArray: false,
        trim: true,
        explicitCharkey: true,
        charkey: "_",
      });

      const rows = parsedData.Workbook?.Worksheet?.Table?.Row;
      if (!rows || rows.length < 2) {
        // Precisa ter cabeçalho e pelo menos uma linha de dados
        throw new Error("Estrutura XML inválida ou arquivo vazio.");
      }

      // 1. DETECÇÃO AUTOMÁTICA DO LAYOUT
      const headerCells = Array.isArray(rows[0].Cell)
        ? rows[0].Cell
        : [rows[0].Cell];
      let layoutType = null;

      // Layout A ('teste_importacao.xml') tem 'CLIENTE' como primeiro cabeçalho
      if (headerCells[0]?.Data?._.trim().toUpperCase() === "CLIENTE") {
        layoutType = "A";
      }
      // Layout B ('Lista_Clientes.xml') tem 'ID_Cliente' e 'Nome' como primeiros cabeçalhos
      else if (headerCells[1]?.Data?._.trim().toUpperCase() === "NOME") {
        layoutType = "B";
      }

      if (!layoutType) {
        throw new Error(
          "Não foi possível identificar o layout da planilha. Verifique os cabeçalhos."
        );
      }

      const dataRows = (Array.isArray(rows) ? rows : [rows]).slice(1);

      for (const [index, row] of dataRows.entries()) {
        const lineNumber = index + 2;
        const cells = Array.isArray(row.Cell) ? row.Cell : [row.Cell];
        let rawData = {};
        let rawClienteBruto = "Linha " + lineNumber; // Fallback para logs de erro

        try {
          // 2. MAPEAMENTO CONDICIONAL DOS DADOS
          if (layoutType === "A") {
            // Mapeamento para 'teste_importacao.xml'
            rawData = {
              cliente_bruto: cells[0]?.Data?._,
              representante_legal: cells[1]?.Data?._,
              numero_contrato: cells[2]?.Data?._,
              nome_certificado: cells[3]?.Data?._,
              data_vencimento: cells[4]?.Data?._,
              telefone: cells[5]?.Data?._,
              email_cliente: cells[6]?.Data?._,
              status: cells[7]?.Data?._,
              nome_parceiro: cells[8]?.Data?._,
            };
            rawClienteBruto = rawData.cliente_bruto;
          } else {
            // layoutType === 'B'
            // Mapeamento para 'Lista_Clientes.xml'
            rawData = {
              cliente_bruto: cells[1]?.Data?._,
              cpf_cnpj_bruto: cells[2]?.Data?._,
              representante_legal: cells[3]?.Data?._,
              telefone: cells[4]?.Data?._,
              email_cliente: cells[5]?.Data?._,
              nome_parceiro: cells[6]?.Data?._,
              numero_contrato: cells[7]?.Data?._,
              status: cells[8]?.Data?._,
              data_vencimento: cells[9]?.Data?._,
              data_renovacao: cells[10]?.Data?._,
              nome_certificado: cells[11]?.Data?._,
            };
            rawClienteBruto = rawData.cliente_bruto;
          }

          // 3. SANITIZAÇÃO
          const { sanitizedData, errors } = sanitizarXmlRow(rawData);

          if (errors) {
            // Se o sanitizador encontrou erros, registra e pula para a próxima linha
            importReport.errorCount++;
            importReport.errors.push({
              line: lineNumber,
              nome: rawClienteBruto,
              details: errors,
            });
            continue; // Pula o resto do loop para esta linha
          }

          // 4. PROCESSAMENTO NO BANCO
          const { isNewClient } = await processarDados(sanitizedData, {
            transaction: t,
            userId: req.userId,
          });

          if (isNewClient) {
            importReport.successCount++;
          } else {
            importReport.updateCount++;
          }
        } catch (e) {
          importReport.errorCount++;
          importReport.errors.push({
            line: lineNumber,
            nome: rawClienteBruto,
            details: [e.message],
          });
        }
      }

      if (importReport.errorCount > 0) {
        await t.rollback();
        return res.status(422).json({
          message:
            "Importação falhou devido a erros. Nenhuma alteração foi salva.",
          report: importReport,
        });
      }

      await t.commit();
      return res
        .status(200)
        .json({ message: "Importação concluída.", report: importReport });
    } catch (e) {
      await t.rollback();
      return errorHandler(e, res);
    }
  }
}

export default new XmlUploadController();
