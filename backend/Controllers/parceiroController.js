import {
  Cliente,
  Parceiro,
  ContratoCertificado,
  Certificado,
} from "../Models/index.js";

import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";
import { errorHandler } from "../Util/errorHandler.js";

class ParceiroController {
  async store(req, res) {
    try {
      const { nome_escritorio } = req.body;
      if (!nome_escritorio) {
        return res
          .status(400)
          .json({ error: "O campo 'nome_escritorio' é obrigatório." });
      }

      const novoParceiro = await Parceiro.create({
        nome_escritorio,
        cadastrado_por_id: req.userId,
      });

      return res.status(201).json(novoParceiro);
    } catch (e) {
      return errorHandler(e, res);
    }
  }
  async index(req, res) {
    try {
      const parceiros = await Parceiro.findAll({
        order: [["nome_escritorio", "ASC"]],
      });
      return res.json(parceiros);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const parceiro = await Parceiro.findByPk(id);

      if (!parceiro) {
        return res.status(404).json({ error: "Parceiro não encontrado." });
      }

      return res.json(parceiro);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome_escritorio } = req.body;

      const parceiro = await Parceiro.findByPk(id);
      if (!parceiro) {
        return res.status(404).json({ error: "Parceiro não encontrado." });
      }

      if (!nome_escritorio) {
        return res
          .status(400)
          .json({ error: "O campo 'nome_escritorio' é obrigatório." });
      }

      const parceiroAtualizado = await parceiro.update({ nome_escritorio });
      return res.json(parceiroAtualizado);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const parceiro = await Parceiro.findByPk(id);

      if (!parceiro) {
        return res.status(404).json({ error: "Parceiro não encontrado." });
      }

      await parceiro.destroy();
      return res.json({ message: "Parceiro excluído com sucesso." });
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async contratosByParceiro(req, res) {
    try {
      const { id } = req.params;

      const parceiro = await Parceiro.findByPk(id, {
        include: [
          {
            model: Cliente,
            as: "clientes_indicados",
            attributes: ["id", "nome", "cpf_cnpj"],
            include: [
              {
                model: ContratoCertificado,
                as: "contratos",
                attributes: [
                  "id",
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
            ],
          },
        ],
      });

      if (!parceiro) {
        return res.status(404).json({ error: "Parceiro nao encontrado." });
      }

      return res.status(200).json(parceiro);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async pagarParceiro(req, res) {}
}

export default new ParceiroController();
