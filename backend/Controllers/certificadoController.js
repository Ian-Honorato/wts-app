import { Certificado } from "../Models/index.js";

import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

import { errorHandler } from "../Util/errorHandler.js";
class CertificadoController {
  async store(req, res) {
    try {
      const { nome_certificado } = req.body;
      if (!nome_certificado) {
        return res
          .status(400)
          .json({ error: "O campo 'nome_certificado' é obrigatório." });
      }

      const novoCertificado = await Certificado.create({ nome_certificado });
      return res.status(201).json(novoCertificado);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async index(req, res) {
    try {
      const certificados = await Certificado.findAll({
        order: [["nome_certificado", "ASC"]],
      });
      return res.json(certificados);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const certificado = await Certificado.findByPk(id);

      if (!certificado) {
        return res.status(404).json({ error: "Certificado não encontrado." });
      }

      return res.json(certificado);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome_certificado } = req.body;

      const certificado = await Certificado.findByPk(id);
      if (!certificado) {
        return res.status(404).json({ error: "Certificado não encontrado." });
      }

      if (!nome_certificado) {
        return res
          .status(400)
          .json({ error: "O campo 'nome_certificado' é obrigatório." });
      }

      const certificadoAtualizado = await certificado.update({
        nome_certificado,
      });
      return res.json(certificadoAtualizado);
    } catch (e) {
      return errorHandler(e, res);
    }
  }
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const certificado = await Certificado.findByPk(id);

      if (!certificado) {
        return res.status(404).json({ error: "Certificado não encontrado." });
      }

      await certificado.destroy();
      return res.json({ message: "Certificado excluído com sucesso." });
    } catch (e) {
      return errorHandler(e, res);
    }
  }
}

export default new CertificadoController();
