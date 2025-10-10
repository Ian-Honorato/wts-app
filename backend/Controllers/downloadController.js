import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
} from "../Models/index.js";

import { utils, write } from "xlsx";
import { errorHandler } from "../Util/errorHandler.js";

class DownloadController {
  async downloadXls(req, res) {
    try {
      const clientes = await Cliente.findAll({
        attributes: [
          "id",
          "nome",
          "cpf_cnpj",
          "representante",
          "telefone",
          "email",
        ],
        include: [
          {
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
          },
          {
            model: Parceiro,
            as: "parceiro_indicador",
            attributes: ["nome_escritorio"],
          },
        ],
        order: [["nome", "ASC"]],
      });

      //1. Formando dados da planilha
      const dadosPlanilha = [];
      clientes.forEach((cliente) => {
        if (cliente.contratos && cliente.contratos.length > 0) {
          cliente.contratos.forEach((contrato) => {
            dadosPlanilha.push({
              ID_Cliente: cliente.id,
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
          // Incluir clientes mesmo sem contrato
          dadosPlanilha.push({
            ID_Cliente: cliente.id,
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
