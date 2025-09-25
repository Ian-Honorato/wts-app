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
      if (!rows) {
        throw new Error(
          "Estrutura XML inválida. Tabela de dados não encontrada."
        );
      }

      const dataRows = (Array.isArray(rows) ? rows : [rows]).slice(1);

      for (const [index, row] of dataRows.entries()) {
        const lineNumber = index + 2;
        const cells = Array.isArray(row.Cell) ? row.Cell : [row.Cell];

        const rawData = {
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

        const { sanitizedData, errors } = sanitizarXmlRow(rawData);

        if (errors) {
          importReport.errorCount++;
          importReport.errors.push({
            line: lineNumber,
            nome: rawData.cliente_bruto || `Linha ${lineNumber}`,
            details: errors,
          });
        }

        try {
          const { nome_cliente, cpf_cnpj, ...restOfData } = sanitizedData;

          if (!cpf_cnpj) {
            throw new Error(
              "CPF/CNPJ ausente ou inválido, não é possível criar ou atualizar."
            );
          }

          let parceiro = await Parceiro.findOne({
            where: { nome_escritorio: restOfData.nome_parceiro },
            transaction: t,
          });
          if (!parceiro && restOfData.nome_parceiro) {
            parceiro = await Parceiro.create(
              {
                nome_escritorio: restOfData.nome_parceiro,
                cadastrado_por_id: req.userId,
              },
              { transaction: t }
            );
          }

          let certificado = await Certificado.findOne({
            where: { nome_certificado: restOfData.nome_certificado },
            transaction: t,
          });
          if (!certificado && restOfData.nome_certificado) {
            certificado = await Certificado.create(
              {
                nome_certificado: restOfData.nome_certificado,
              },
              { transaction: t }
            );
          }
          console.log("update ou create cliente");
          const clienteExistente = await Cliente.unscoped().findOne({
            where: { cpf_cnpj },
            paranoid: false,
            transaction: t,
            logging: console.log,
          });

          if (clienteExistente) {
            if (clienteExistente.deleted_at) {
              await clienteExistente.restore({ transaction: t });
            }

            await clienteExistente.update(
              {
                nome: nome_cliente,
                email: restOfData.email_cliente,
                representante: restOfData.representante,
                telefone: restOfData.telefone,
                tipo_cliente: restOfData.tipo_cliente,
                referencia_parceiro: parceiro.id,
              },
              { transaction: t }
            );

            let contrato = await ContratoCertificado.findOne({
              where: { cliente_id: clienteExistente.id },
              paranoid: false,
              transaction: t,
            });

            if (contrato) {
              if (contrato.deleted_at) {
                await contrato.restore({ transaction: t });
              }
              await contrato.update(
                {
                  numero_contrato: restOfData.numero_contrato,
                  data_vencimento: restOfData.data_vencimento,
                  //status: restOfData.status, comentado -> atraplhando o FInanceiro no filtro de busca por status.
                  referencia_certificado: certificado?.id,
                },
                { transaction: t }
              );
            } else {
              await ContratoCertificado.create(
                {
                  numero_contrato: restOfData.numero_contrato,
                  data_vencimento: restOfData.data_vencimento,
                  status: restOfData.status,
                  cliente_id: clienteExistente.id,
                  usuario_id: req.userId,
                  referencia_certificado: certificado?.id,
                },
                { transaction: t }
              );
            }
            importReport.updateCount++;
          } else {
            const novoCliente = await Cliente.create(
              {
                nome: nome_cliente,
                cpf_cnpj: cpf_cnpj,
                tipo_cliente: restOfData.tipo_cliente,
                representante: restOfData.representante,
                email: restOfData.email_cliente,
                telefone: restOfData.telefone,
                id_usuario: req.userId,
                referencia_parceiro: parceiro?.id,
              },
              { transaction: t }
            );

            await ContratoCertificado.create(
              {
                numero_contrato: restOfData.numero_contrato,
                data_vencimento: restOfData.data_vencimento,
                status: restOfData.status,
                cliente_id: novoCliente.id,
                usuario_id: req.userId,
                referencia_certificado: certificado?.id,
              },
              { transaction: t }
            );
            importReport.successCount++;
          }
        } catch (e) {
          if (!errors) {
            importReport.errorCount++;
            importReport.errors.push({
              line: lineNumber,
              nome: rawData.cliente_bruto,
              details: [e.message],
            });
          }
        }
      }

      await t.commit();
      return res.status(200).json({
        message: "Importação concluída.",
        report: importReport,
      });
    } catch (e) {
      await t.rollback();
      return errorHandler(e, res);
    }
  }
}

export default new XmlUploadController();
