import { parseStringPromise } from "xml2js";
import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
} from "../Models/index.js";
class DownloadController {
  async downloadXls(req, res) {
    try {
      const clientes = await Cliente.findAll({
        attributes: ["id", "nome", "cpf_cnpj", "representante", "telefone"],
        include: [
          {
            model: ContratoCertificado,
            as: "contratos",
            attributes: [
              "numero_contrato",
              "data_vencimento",
              "status",
              "data_renovacao",
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
      return res.json(clientes);
    } catch (e) {
      return errorHandler(e, res);
    }
  }
}

export default new DownloadController();
