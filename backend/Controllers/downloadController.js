import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
} from "../Models/index.js";

import { Op } from "sequelize";
import { utils, write } from "xlsx";
import { errorHandler } from "../Util/errorHandler.js";

class DownloadController {
  async downloadXls(req, res) {
    try {
      const { status, startDate, endDate } = req.query;

      console.log(
        "DADOS RECEBIDOS DO FRONTEND ->" + status,
        startDate,
        endDate
      );
      const contratoInclude = {
        model: ContratoCertificado,
        as: "contratos",
        attributes: [
          "numero_contrato",
          "data_vencimento",
          "data_renovacao",
          "status",
        ],
        include: [
          {
            model: Certificado,
            as: "certificado",
            attributes: ["nome_certificado"],
          },
        ],
      };

      const parceiroInclude = {
        model: Parceiro,
        as: "parceiro_indicador",
        attributes: ["nome_escritorio"],
      };

      const contratoWhereClause = {};

      if (status) {
        contratoWhereClause.status = status;
      }

      // --- LÓGICA DE DATA ADICIONADA ---
      const dateFilter = {};
      if (startDate) {
        dateFilter[Op.gte] = startDate;
      }
      if (endDate) {
        dateFilter[Op.lte] = `${endDate} 23:59:59`;
      }

      if (Object.keys(dateFilter).length > 0) {
        contratoWhereClause.data_vencimento = dateFilter;
      }

      if (Object.keys(contratoWhereClause).length > 0) {
        contratoInclude.where = contratoWhereClause;
        contratoInclude.required = true;
      }

      // --- DEBUGGING ---
      console.log(
        "Executando download com filtros:",
        JSON.stringify(contratoInclude.where, null, 2)
      );

      const clientes = await Cliente.findAll({
        attributes: [
          "id",
          "nome",
          "cpf_cnpj",
          "representante",
          "telefone",
          "email",
        ],
        include: [contratoInclude, parceiroInclude],
        order: [["nome", "ASC"]],
      });

      // --- DEBUGGING ---
      console.log(`Clientes encontrados: ${clientes.length}`);

      const dadosPlanilha = [];
      clientes.forEach((cliente) => {
        if (cliente.contratos && cliente.contratos.length > 0) {
          cliente.contratos.forEach((contrato) => {
            dadosPlanilha.push({
              //ID_Cliente: cliente.id,
              Nome: cliente.nome,
              "CPF/CNPJ": cliente.cpf_cnpj,
              Representante: cliente.representante,
              Telefone: cliente.telefone,
              Email: cliente.email,
              Parceiro_Indicador: cliente.parceiro_indicador
                ? cliente.parceiro_indicador.nome_escritorio
                : "N/A",
              Numero_Contrato: contrato.numero_contrato,
              Status_Contrato: contrato.status,
              Data_Vencimento: contrato.data_vencimento,
              Data_Renovacao: contrato.data_renovacao,
              Certificado: contrato.certificado
                ? contrato.certificado.nome_certificado
                : "N/A",
            });
          });
        } else {
          dadosPlanilha.push({
            //ID_Cliente: cliente.id,
            Nome: cliente.nome,
            "CPF/CNPJ": cliente.cpf_cnpj,
            Representante: cliente.representante,
            Telefone: cliente.telefone,
            Email: cliente.email,
            Parceiro_Indicador: cliente.parceiro_indicador
              ? cliente.parceiro_indicador.nome_escritorio
              : "N/A",
            Numero_Contrato: "N/A",
            Status_Contrato: "N/A",
            Data_Vencimento: "N/A",
            Data_Renovacao: "N/A",
            Certificado: "N/A",
          });
        }
      });
      console.log("dados finais" + dadosPlanilha);
      const worksheet = utils.json_to_sheet(dadosPlanilha);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Clientes");

      const buffer = write(workbook, { bookType: "xlsx", type: "buffer" });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="Lista_Clientes.xlsx"'
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      return res.status(200).send(buffer);
    } catch (e) {
      console.error("Erro ao gerar a planilha de clientes:", e);
      return errorHandler(e, res);
    }
  }
}

export default new DownloadController();
