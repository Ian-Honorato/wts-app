import { parseStringPromise } from "xml2js";
import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
} from "../Models/index.js";

import sanitizarXmlRow from "../Util/xmlDataSanitizer.js";
import { errorHandler } from "../Util/errorHandler.js";

// ===================================================================
// FUNÇÃO UTILITÁRIA DE NORMALIZAÇÃO
// ===================================================================

const normalizarNumeroContrato = (numeroContrato) => {
  if (!numeroContrato || typeof numeroContrato !== "string") {
    return "";
  }
  // Remove tudo que não for letra ou número e converte para maiúsculo
  return numeroContrato.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};

const mapListaClientesXml = (cells) => {
  return {
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
};

const mapNovosContratosXml = (cells) => {
  return {
    cliente_bruto: cells[0]?.Data?._,
    representante_legal: null,
    numero_contrato: cells[1]?.Data?._,
    nome_certificado: cells[2]?.Data?._,
    data_vencimento: cells[3]?.Data?._,
    telefone: cells[4]?.Data?._,
    email_cliente: cells[5]?.Data?._,
    status: "Pendente",
    nome_parceiro: cells[6]?.Data?._,
  };
};

const mappers = {
  lista_clientes: mapListaClientesXml,
  novos_contratos: mapNovosContratosXml,
  // Adicione futuros mapeadores aqui
};

// ===================================================================
// SERVIÇO DE PROCESSAMENTO DE DADOS
// ===================================================================
async function processarLinha(rawData, { transaction, userId }) {
  const { sanitizedData, errors: validationErrors } = sanitizarXmlRow(rawData);

  if (validationErrors) {
    throw new Error(validationErrors.join("; "));
  }

  const { nome_cliente, cpf_cnpj, ...restOfData } = sanitizedData;

  if (!cpf_cnpj) {
    throw new Error(
      "CPF/CNPJ ausente ou inválido, não é possível processar a linha."
    );
  }

  let parceiro = null;
  if (restOfData.nome_parceiro) {
    [parceiro] = await Parceiro.findOrCreate({
      where: { nome_escritorio: restOfData.nome_parceiro },
      defaults: {
        nome_escritorio: restOfData.nome_parceiro,
        cadastrado_por_id: userId,
      },
      transaction,
    });
  }
  let certificado = null;
  if (restOfData.nome_certificado) {
    [certificado] = await Certificado.findOrCreate({
      where: { nome_certificado: restOfData.nome_certificado },
      defaults: { nome_certificado: restOfData.nome_certificado },
      transaction,
    });
  }

  const [cliente, isNewClient] = await Cliente.unscoped().findOrCreate({
    where: { cpf_cnpj },
    defaults: {
      nome: nome_cliente,
      cpf_cnpj: cpf_cnpj,
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

  if (cliente.deleted_at) {
    await cliente.restore({ transaction });
  }

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

  const numeroContratoNormalizado = normalizarNumeroContrato(
    restOfData.numero_contrato
  );

  if (!numeroContratoNormalizado) {
    console.warn(
      `Cliente ${nome_cliente} (CPF/CNPJ: ${cpf_cnpj}): pulando contrato por número de contrato ausente ou inválido.`
    );
    return { isNewClient, contractSkipped: true };
  }
  const contratoExistente = await ContratoCertificado.findOne({
    where: {
      numero_contrato: numeroContratoNormalizado,
    },
    paranoid: false, // Inclui contratos deletados
    transaction,
  });

  const dataVencimentoArquivo = restOfData.data_vencimento;

  if (contratoExistente) {
    // --- CONTRATO JÁ EXISTE ---

    // VERIFICAÇÃO DE INTEGRIDADE: O contrato pertence a este cliente?
    if (contratoExistente.cliente_id !== cliente.id) {
      throw new Error(
        `Erro de integridade: O número de contrato '${numeroContratoNormalizado}' já está em uso por outro cliente (ID: ${contratoExistente.cliente_id}).`
      );
    }

    // Se estava deletado, restaura
    if (contratoExistente.deleted_at) {
      await contratoExistente.restore({ transaction });
    }

    // LÓGICA DE ATUALIZAÇÃO BASEADA NA DATA DE VENCIMENTO
    const dataVencimentoBanco = contratoExistente.data_vencimento
      ? new Date(contratoExistente.data_vencimento)
      : null;

    let deveAtualizar = false;
    if (dataVencimentoArquivo) {
      // Se a data do arquivo for válida
      if (!dataVencimentoBanco) {
        deveAtualizar = true; // Data no banco é nula, então atualiza.
      } else if (new Date(dataVencimentoArquivo) > dataVencimentoBanco) {
        deveAtualizar = true; // Data do arquivo é mais recente.
      }
    }

    if (deveAtualizar) {
      await contratoExistente.update(
        {
          data_vencimento: dataVencimentoArquivo,
          data_renovacao:
            restOfData.data_renovacao || contratoExistente.data_renovacao,
          referencia_certificado: certificado?.id,
        },
        { transaction }
      );
    } else {
      console.log(
        `Contrato ${numeroContratoNormalizado} não atualizado (data do arquivo não é mais recente).`
      );
    }
  } else {
    // --- CONTRATO NÃO EXISTE, VAMOS CRIAR ---
    await ContratoCertificado.create(
      {
        numero_contrato: numeroContratoNormalizado,
        data_vencimento: dataVencimentoArquivo,
        data_renovacao: restOfData.data_renovacao || null,
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
// ===================================================================
// CONTROLLER
// ===================================================================
class XmlUploadController {
  async store(req, res) {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
    }

    const { template } = req.query;
    const mapper = mappers[template];

    if (!mapper) {
      return res.status(400).json({
        error: `Template de importação inválido: '${template}'. Valores aceitos: ${Object.keys(
          mappers
        ).join(", ")}`,
      });
    }

    const t = await sequelize.transaction();
    const importReport = {
      successCount: 0,
      updateCount: 0,
      errorCount: 0,
      errors: [],
    };

    try {
      // 2. Parse do XML
      const xmlContent = req.file.buffer.toString("utf-8");
      const parsedData = await parseStringPromise(xmlContent, {
        explicitArray: false,
        trim: true,
        explicitCharkey: true,
        charkey: "_",
      });

      const rows = parsedData.Workbook?.Worksheet?.Table?.Row;
      if (!rows) {
        throw new Error(
          "Estrutura XML inválida. Tabela de dados não encontrada."
        );
      }

      const dataRows = (Array.isArray(rows) ? rows : [rows]).slice(1);

      // 3. Processamento de cada linha
      for (const [index, row] of dataRows.entries()) {
        const lineNumber = index + 2;
        const cells = Array.isArray(row.Cell) ? row.Cell : [row.Cell];
        let rawData = {};

        try {
          rawData = mapper(cells);

          // 3b. Processa a linha (valida, sanitiza, cria/atualiza)
          const { isNewClient } = await processarLinha(rawData, {
            transaction: t,
            userId: req.userId,
          });

          if (isNewClient) {
            importReport.successCount++;
          } else {
            importReport.updateCount++;
          }
        } catch (e) {
          // Erro na linha específica
          importReport.errorCount++;
          importReport.errors.push({
            line: lineNumber,
            nome: rawData.cliente_bruto || `Linha ${lineNumber}`,
            details: e.message,
          });
        }
      }

      if (importReport.errorCount > 0) {
        await t.rollback();
        return res.status(422).json({
          message:
            "A importação falhou devido a erros nos dados. Nenhuma informação foi salva.",
          report: importReport,
        });
      }

      // Sucesso!
      await t.commit();
      return res.status(200).json({
        message: "Importação concluída com sucesso.",
        report: importReport,
      });
    } catch (e) {
      await t.rollback();
      return errorHandler(e, res);
    }
  }
}

export default new XmlUploadController();
