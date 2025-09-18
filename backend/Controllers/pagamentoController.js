// Importa a conexão e os modelos a partir do inicializador central
import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
} from "../Models/index.js";

import { Op } from "sequelize";

// Importando os tipos de erro específicos do Sequelize
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

// ----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// ----------------------------------------------------------------------------
import { errorHandler, handleError } from "../Util/errorHandler.js";

class PagamentoController {
  async index(req, res) {
    try {
      const { data_inicial, data_final, id_parceiro } = req.query;

      if (!data_inicio || !data_fim) {
        errorHandler("As datas de início e fim são obrigatórias.", 400);
      }
      //verificar formato das datas
      const data_inicio = new Date(data_inicial);
      const data_fim = new Date(data_final);

      const whereClause = {
        mes_referencia: {
          [Op.between]: [data_inicio, data_fim],
        },
      };
      if (id_parceiro) {
        whereClause.parceiro_id = id_parceiro;
      }
      const pagamentos = await PagamentoParceiro.findAll({
        where: whereClause,
        include: [
          {
            model: Parceiro,
            as: "parceiro",
            attributes: ["nome_escritorio"],
          },
          {
            model: PagamentoCertificado,
            as: "certificados",
            include: {
              model: Certificado,
              as: "certificado",
              attributes: ["nome_certificado"],
            },
          },
        ],
        order: [["mes_referencia", "DESC"]],
      });

      return res.json(pagamentos);
    } catch (error) {
      handleError(res, error);
    }
  }

  async store(req, res) {}

  async show(req, res) {}

  async findByParceiro(req, res) {}
}

export default new PagamentoController();
