// 1. Importa o modelo 'Certificado' a partir do inicializador central
import { Certificado } from "../Models/index.js";

// Importando os tipos de erro específicos do Sequelize para tratamento
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

import { handleError } from "../Util/errorHandler.js";
class CertificadoController {
  /**
   * Cria um novo tipo de certificado.
   */
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
      // 2. Corrige a chamada para a função auxiliar (remove o 'this')
      return errorHandler(e, res);
    }
  }

  /**
   * Lista todos os tipos de certificados.
   */
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

  /**
   * Exibe um tipo de certificado específico.
   */
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

  /**
   * Atualiza um tipo de certificado existente.
   */
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

  /**
   * Exclui um tipo de certificado.
   */
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
