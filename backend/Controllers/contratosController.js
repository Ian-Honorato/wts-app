import {
  sequelize,
  Cliente,
  Certificado,
  ContratoCertificado,
} from "../Models/index.js";

import { Op } from "sequelize";

import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

// ----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// ----------------------------------------------------------------------------
import { errorHandler } from "../Util/errorHandler.js";

class ContratosController {
  async store(req, res) {
    const t = await sequelize.transaction();
    try {
      const {
        cliente_id,
        numero_contrato,
        data_vencimento,
        data_renovacao,
        status,
        nome_certificado,
      } = req.body;

      if (!cliente_id || !data_vencimento || !status || !nome_certificado) {
        throw new Error("Dados obrigatórios do contrato não foram fornecidos.");
      }

      const contratoPorVencimento = await ContratoCertificado.findOne({
        where: { cliente_id, data_vencimento },
        transaction: t,
      });
      if (contratoPorVencimento) {
        throw new Error(
          `Este cliente já possui um contrato vencendo em ${new Date(
            data_vencimento
          ).toLocaleDateString("pt-BR")}.`
        );
      }

      if (data_renovacao) {
        const contratoSobreposto = await ContratoCertificado.findOne({
          where: {
            cliente_id,
            data_renovacao: { [Op.ne]: null },
            [Op.and]: [
              { data_renovacao: { [Op.lt]: data_vencimento } },
              { data_vencimento: { [Op.gt]: data_renovacao } },
            ],
          },
          transaction: t,
        });
        if (contratoSobreposto) {
          throw new Error(
            "O período do novo contrato está em conflito com um contrato existente."
          );
        }
      }

      const [certificado] = await Certificado.findOrCreate({
        where: { nome_certificado },
        defaults: { nome_certificado },
        transaction: t,
      });

      const novoContrato = await ContratoCertificado.create(
        {
          cliente_id,
          numero_contrato,
          data_vencimento,
          data_renovacao,
          status,
          referencia_certificado: certificado.id,
          usuario_id: req.userId,
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(201).json({
        message: "Contrato criado com sucesso!",
        contrato: novoContrato,
      });
    } catch (e) {
      await t.rollback();
      if (e.message.includes("já possui") || e.message.includes("conflito")) {
        return res.status(409).json({ error: e.message });
      }
      return errorHandler(e, res);
    }
  }

  /**
   * Atualiza um contrato existente.
   */
  async update(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const {
        numero_contrato,
        data_vencimento,
        data_renovacao,
        status,
        nome_certificado,
      } = req.body;

      const contrato = await ContratoCertificado.findByPk(id, {
        transaction: t,
      });
      if (!contrato) {
        throw new Error("Contrato não encontrado.");
      }

      if (data_vencimento) {
        const contratoPorVencimento = await ContratoCertificado.findOne({
          where: {
            cliente_id: contrato.cliente_id,
            data_vencimento,
            id: { [Op.ne]: id },
          },
          transaction: t,
        });
        if (contratoPorVencimento)
          throw new Error(
            `Este cliente já possui outro contrato vencendo em ${new Date(
              data_vencimento
            ).toLocaleDateString("pt-BR")}.`
          );
      }
      if (data_renovacao && data_vencimento) {
        const contratoSobreposto = await ContratoCertificado.findOne({
          where: {
            cliente_id: contrato.cliente_id,
            data_renovacao: { [Op.ne]: null },
            id: { [Op.ne]: id },
            [Op.and]: [
              { data_renovacao: { [Op.lt]: data_vencimento } },
              { data_vencimento: { [Op.gt]: data_renovacao } },
            ],
          },
          transaction: t,
        });
        if (contratoSobreposto) {
          throw new Error(
            "O novo período do contrato está em conflito com um contrato existente."
          );
        }
      }

      const [certificado] = await Certificado.findOrCreate({
        where: { nome_certificado },
        defaults: { nome_certificado },
        transaction: t,
      });

      const contratoAtualizado = await contrato.update(
        {
          numero_contrato,
          data_vencimento,
          data_renovacao,
          status,
          referencia_certificado: certificado.id,
        },
        { transaction: t }
      );
      if (contratoAtualizado.status === "Renovado") {
        if (!contratoAtualizado.data_renovacao) {
          throw new Error(
            "Para definir um contrato como 'Renovado', a 'data_renovacao' (data de vencimento do próximo contrato) é obrigatória."
          );
        }
        await ContratoCertificado.create(
          {
            cliente_id: contrato.cliente_id,
            numero_contrato: "não identificado",
            data_vencimento: contratoAtualizado.data_renovacao,
            data_renovacao: null,
            status: "Ativo",
            referencia_certificado: contratoAtualizado.referencia_certificado,
            usuario_id: req.userId,
          },
          { transaction: t }
        );
      }
      await t.commit();
      return res.status(200).json({
        message: "Contrato atualizado com sucesso!",
        contrato: contratoAtualizado,
      });
    } catch (e) {
      await t.rollback();
      if (e.message.includes("não encontrado")) {
        return res.status(404).json({ error: e.message });
      }
      if (e.message.includes("já possui")) {
        return res.status(409).json({ error: e.message });
      }
      return errorHandler(e, res);
    }
  }
}

export default new ContratosController();
