import { parseStringPromise } from "xml2js";
import {
  sequelize,
  Cliente,
  Certificado,
  ContratoCertificado,
  Parceiro,
} from "../Models/index.js";

import { sanitizeTypeA } from "../Util/xmlDataSanitizer_a.js";
import { sanitizeTypeB } from "../Util/xmlDataSanitizer_b.js";

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
      // -------------------------
      // Cabeçalhos esperados
      // -------------------------
      const expectedHeaders = {
        type_a: [
          "cliente",
          "representante legal",
          "tickets",
          "certificado",
          "vencimento sar",
          "contato",
          "email",
          "renovado",
          "indicação",
          "matricula",
        ],
        type_b: [
          //"id_cliente",
          "nome",
          "cpf/cnpj",
          "representante",
          "telefone",
          "email",
          "parceiro_indicador",
          "numero_contrato",
          "status_contrato",
          "data_vencimento",
          "data_renovacao",
          "certificado",
        ],
      };

      // -------------------------
      //Função de comparação de layout
      // -------------------------
      function matchLayout(headerValues, expected) {
        const normalizedHeader = headerValues.map((h) =>
          h
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase()
        );

        for (const [layout, expectedCols] of Object.entries(expected)) {
          const normalizedExpected = expectedCols.map((h) =>
            h
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toLowerCase()
          );

          const allMatch = normalizedExpected.every((col, i) =>
            normalizedHeader[i]?.includes(col.split(" ")[0])
          );

          if (allMatch) return layout;
        }
        return null;
      }

      // -------------------------
      // Parse do XML
      // -------------------------
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

      const headerRow = rows[0];
      const headerCells = Array.isArray(headerRow.Cell)
        ? headerRow.Cell
        : [headerRow.Cell];
      const headerValues = headerCells.map(
        (cell) => cell?.Data?._?.trim()?.toLowerCase() || ""
      );

      // -------------------------
      // Identificação do layout
      // -------------------------
      const layoutType = matchLayout(headerValues, expectedHeaders);
      if (!layoutType) {
        throw new Error(
          "Layout de arquivo não reconhecido. O cabeçalho não corresponde ao formato esperado (Layout A ou B)."
        );
      }

      const columnCount = expectedHeaders[layoutType].length;
      const dataRows = (Array.isArray(rows) ? rows : [rows]).slice(1);
      const dadosProcessados = [];

      // -------------------------
      // Mapeamento das colunas
      // -------------------------
      const mappers = {
        type_a: (cells) => ({
          cliente_bruto: cells[0]?.Data?._,
          representante_legal: cells[1]?.Data?._,
          numero_contrato: cells[2]?.Data?._,
          nome_certificado: cells[3]?.Data?._,
          data_vencimento: cells[4]?.Data?._,
          telefone: cells[5]?.Data?._,
          email_cliente: cells[6]?.Data?._,
          status: cells[7]?.Data?._,
          nome_parceiro: cells[8]?.Data?._,
        }),
        type_b: (cells) => ({
          cliente_bruto: cells[0]?.Data?._,
          cpf_cnpj_bruto: cells[1]?.Data?._,
          representante_legal: cells[2]?.Data?._,
          telefone: cells[3]?.Data?._,
          email_cliente: cells[4]?.Data?._,
          nome_parceiro: cells[5]?.Data?._,
          numero_contrato: cells[6]?.Data?._,
          status: cells[7]?.Data?._,
          data_vencimento: cells[8]?.Data?._,
          data_renovacao: cells[9]?.Data?._,
          nome_certificado: cells[10]?.Data?._,
        }),
      };

      const sanitizers = {
        type_a: sanitizeTypeA,
        type_b: sanitizeTypeB,
      };

      // -------------------------
      // Processamento das linhas
      // -------------------------
      for (const [index, row] of dataRows.entries()) {
        const lineNumber = index + 2;
        const cells = Array.isArray(row.Cell) ? row.Cell : [row.Cell];

        const filledCells = Array.from({ length: columnCount }, () => ({
          Data: { _: "Não identificado" }, // valor padrão
        }));
        let currentIndex = 0;

        for (const cell of cells) {
          // Detecta o índice original (se existir)
          const indexAttr =
            cell?.$?.["ss:Index"] ||
            cell?.$?.Index ||
            cell?.["ss:Index"] ||
            cell?.Index;

          if (indexAttr) {
            currentIndex = parseInt(indexAttr, 10) - 1; // Excel usa base 1
          }

          filledCells[currentIndex] = cell;
          currentIndex++;
        }
        const rawData = mappers[layoutType](filledCells);
        const sanitizerFn = sanitizers[layoutType];
        const { sanitizedData, errors } = sanitizerFn(rawData);

        if (errors) {
          importReport.errorCount++;
          importReport.errors.push({
            line: lineNumber,
            nome: rawData.cliente_bruto || "N/A",
            details: errors,
          });
          continue;
        }

        dadosProcessados.push({ ...sanitizedData, lineNumber });
      }

      // -------------------------
      // Persistência no banco
      // -------------------------
      for (const data of dadosProcessados) {
        try {
          const { nome_cliente, cpf_cnpj, ...restOfData } = data;
          if (!cpf_cnpj)
            throw new Error("CPF/CNPJ ausente ou inválido após sanitização.");

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

          if (isNewClient) {
            importReport.successCount++;
          } else {
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

              if (!isNewContract) {
                if (contrato.cliente_id !== cliente.id) {
                  throw new Error(
                    `Conflito: Contrato '${numeroContratoNormalizado}' já pertence a outro cliente.`
                  );
                }
                await contrato.update(
                  {
                    status: restOfData.status,
                    cliente_id: cliente.id,
                    data_vencimento: restOfData.data_vencimento,
                    data_renovacao: restOfData.data_renovacao,
                    referencia_certificado: certificado?.id,
                  },
                  { transaction: t }
                );
              }
            }
          }
        } catch (dbError) {
          importReport.errorCount++;
          importReport.errors.push({
            line: data.lineNumber,
            nome: data.nome_cliente,
            details: [dbError.message],
          });
        }
      }

      if (importReport.errorCount > 0) {
        await t.rollback();
        return res.status(422).json({
          message:
            "Importação concluída com erros. Nenhuma alteração foi salva no banco de dados.",
          report: importReport,
        });
      }

      await t.commit();
      return res.status(200).json({
        message: "Importação concluída com sucesso.",
        report: importReport,
      });
    } catch (error) {
      await t.rollback();
      return errorHandler(error, res);
    }
  }
}

export default new XmlUploadController();
