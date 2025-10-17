import { parseStringPromise } from "xml2js";
import {
  sequelize,
  Cliente,
  Certificado,
  ContratoCertificado,
  Parceiro,
} from "../Models/index.js";

import { xmlDataSanitizer } from "../Util/xmlDataSanitizer.js";
import { errorHandler } from "../Util/errorHandler.js";

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
        throw new Error(
          "Estrutura XML inválida ou arquivo sem dados (cabeçalho + 1 linha de dados no mínimo)."
        );
      }

      // --- PARTE 1: DETECÇÃO AUTOMÁTICA E MAPEAMENTO PADRONIZADO ---
      const headerRow = rows[0];
      const headerCells = Array.isArray(headerRow.Cell)
        ? headerRow.Cell
        : [headerRow.Cell];
      const columnCount = headerCells.length;

      let layoutType = "";
      if (columnCount === 9) {
        layoutType = "type_a"; // Layout com 9 colunas
      } else if (columnCount === 12) {
        layoutType = "type_b"; // Layout com 12 colunas
      } else {
        throw new Error(
          `Layout de arquivo não reconhecido. Esperado 9 ou 12 colunas, mas foram encontradas ${columnCount}.`
        );
      }

      const dataRows = (Array.isArray(rows) ? rows : [rows]).slice(1);
      const dadosMapeados = [];

      for (const [index, row] of dataRows.entries()) {
        const lineNumber = index + 2;
        const cells = Array.isArray(row.Cell) ? row.Cell : [row.Cell];
        let rawData = {};

        if (layoutType === "type_a") {
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
        } else {
          // layoutType === 'type_b'
          rawData = {
            cliente_bruto: cells[1]?.Data?._,
            cpf_cnpj_bruto: cells[2]?.Data?._, // Campo extra para o CPF/CNPJ separado
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
        }
        dadosMapeados.push({ ...rawData, lineNumber });
      }

      // --- PARTE 2: SANITIZAÇÃO DOS DADOS MAPEADOS ---
      const dadosProcessados = [];
      for (const item of dadosMapeados) {
        const { sanitizedData, errors } = sanitizarXmlRow(item);

        if (errors) {
          importReport.errorCount++;
          importReport.errors.push({
            line: item.lineNumber,
            nome: item.cliente_bruto,
            details: errors,
          });
          continue;
        }
        dadosProcessados.push({
          ...sanitizedData,
          lineNumber: item.lineNumber,
        });
      }

      // --- PARTE 3: PERSISTÊNCIA NO BANCO DE DADOS ---
      for (const data of dadosProcessados) {
        try {
          const { nome_cliente, cpf_cnpj, ...restOfData } = data;
          if (!cpf_cnpj) throw new Error("CPF/CNPJ ausente ou inválido.");

          const [parceiro] = await Parceiro.findOrCreate({
            where: { nome_escritorio: restOfData.nome_parceiro },
            defaults: {
              nome_escritorio: restOfData.nome_parceiro,
              cadastrado_por_id: req.userId,
            },
            transaction: t,
          });
          let certificado = null;
          if (restOfData.nome_certificado) {
            [certificado] = await Certificado.findOrCreate({
              where: { nome_certificado: restOfData.nome_certificado },
              defaults: { nome_certificado: restOfData.nome_certificado },
              transaction: t,
            });
          }

          const [cliente, isNewClient] = await Cliente.unscoped().findOrCreate({
            where: { cpf_cnpj },
            defaults: {
              nome: nome_cliente,
              cpf_cnpj,
              tipo_cliente: restOfData.tipo_cliente,
              representante: restOfData.representante,
              email: restOfData.email_cliente,
              telefone: restOfData.telefone,
              id_usuario: req.userId,
              referencia_parceiro: parceiro?.id,
            },
            paranoid: false,
            transaction: t,
          });

          if (isNewClient) importReport.successCount++;
          else {
            if (cliente.deleted_at) await cliente.restore({ transaction: t });
            await cliente.update(
              {
                nome: nome_cliente,
                email: restOfData.email_cliente,
                representante: restOfData.representante,
                telefone: restOfData.telefone,
                tipo_cliente: restOfData.tipo_cliente,
                referencia_parceiro: parceiro?.id,
              },
              { transaction: t }
            );
            importReport.updateCount++;
          }

          if (restOfData.numero_contrato) {
            const numeroContratoNormalizado = String(restOfData.numero_contrato)
              .replace(/[^a-zA-Z0-9]/g, "")
              .toUpperCase();
            if (numeroContratoNormalizado) {
              const [contrato, isNewContract] =
                await ContratoCertificado.findOrCreate({
                  where: { numero_contrato: numeroContratoNormalizado },
                  defaults: {
                    numero_contrato: numeroContratoNormalizado,
                    status: restOfData.status,
                    cliente_id: cliente.id,
                    usuario_id: req.userId,
                    data_vencimento: restOfData.data_vencimento,
                    data_renovacao: restOfData.data_renovacao,
                    referencia_certificado: certificado?.id,
                  },
                  paranoid: false,
                  transaction: t,
                });
              if (!isNewContract && contrato.cliente_id !== cliente.id)
                throw new Error(
                  `Conflito: Contrato '${numeroContratoNormalizado}' já pertence a outro cliente.`
                );
            }
          }
        } catch (e) {
          importReport.errorCount++;
          importReport.errors.push({
            line: data.lineNumber,
            nome: data.nome_cliente,
            details: [e.message],
          });
        }
      }

      // --- FINALIZAÇÃO DA TRANSAÇÃO ---
      if (importReport.errorCount > 0) {
        await t.rollback();
        return res.status(422).json({
          message:
            "Importação concluída com erros. Nenhuma alteração foi salva.",
          report: importReport,
        });
      }

      await t.commit();
      return res.status(200).json({
        message: "Importação concluída com sucesso.",
        report: importReport,
      });
    } catch (e) {
      await t.rollback();
      return errorHandler(e, res); // Assumindo que seu errorHandler recebe (error, res)
    }
  }
}

export default new XmlUploadController();
