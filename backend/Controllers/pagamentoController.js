// Importa a conexão e os modelos a partir do inicializador central
import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
  PagamentoParceiro,
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
      const { mes } = req.query;

      if (!mes || mes < 1 || mes > 12) {
        return res.json([]);
      }

      const ano_atual = new Date().getFullYear();

      const data_inicio = new Date(ano_atual, mes - 1, 1);
      data_inicio.setHours(0, 0, 0, 0);

      const data_fim = new Date(ano_atual, mes, 0);
      data_fim.setHours(23, 59, 59, 999);

      const parceiros = await Parceiro.findAll({
        attributes: ["id", "nome_escritorio"],
        include: {
          model: Cliente,
          as: "clientes_indicados",
          attributes: [],
          required: true,
          include: {
            model: ContratoCertificado,
            as: "contratos",
            attributes: [],
            required: true,
            where: {
              status: "Renovado",
              data_renovacao: {
                [Op.between]: [data_inicio, data_fim],
              },
            },
          },
        },
        group: ["Parceiro.id"],
      });

      return res.json(parceiros);
    } catch (err) {
      return errorHandler(err, res);
    }
  }

  async buscarPendentes(req, res) {
    try {
      const { parceiro_id, mes_referencia } = req.query;

      // SUGESTÃO: Validação unificada para clareza
      if (
        !parceiro_id ||
        !mes_referencia ||
        mes_referencia < 1 ||
        mes_referencia > 12
      ) {
        return res.status(400).json({
          errors: [
            "Parâmetros 'parceiro_id' e 'mes_referencia' (1-12) são obrigatórios.",
          ],
        });
      }

      const ano_atual = new Date().getFullYear();

      // CORREÇÃO: Usar 'mes_referencia' ao invés de 'mes'
      const data_inicio = new Date(ano_atual, mes_referencia - 1, 1);
      data_inicio.setHours(0, 0, 0, 0);

      // CORREÇÃO: Usar 'mes_referencia' ao invés de 'mes'
      const data_fim = new Date(ano_atual, mes_referencia, 0);
      data_fim.setHours(23, 59, 59, 999);

      // ---BUSCAR A LISTA COMPLETA E DETALHADA DOS CONTRATOS ---
      // A sua consulta principal não precisa de alterações, pois já usa as variáveis corrigidas.
      const contratosRenovados = await ContratoCertificado.findAll({
        where: {
          status: "Renovado",
          data_renovacao: { [Op.between]: [data_inicio, data_fim] },
        },
        include: [
          {
            model: Cliente,
            as: "cliente",
            required: true,
            include: [
              {
                model: Parceiro,
                as: "parceiro_indicador",
                required: true,
                where: { id: parceiro_id },
              },
            ],
          },
          {
            model: Certificado,
            as: "certificado",
            required: true,
          },
        ],
        order: [["data_renovacao", "ASC"]],
      });

      // O restante do seu código para processar os dados já está correto.
      // Apenas precisamos garantir que ele retorne um resultado no final.

      if (contratosRenovados.length === 0) {
        return res.status(200).json({
          mes_referencia: mes_referencia,
          resumoCertificados: [],
          detalheClientes: [],
        });
      }

      // A sua lógica de processamento que estava aqui (vou recriá-la baseado no contexto anterior)
      const detalhesClientes = [];
      const certificadosMap = new Map();

      for (const contrato of contratosRenovados) {
        detalhesClientes.push({
          cliente_nome: contrato.cliente.nome,
          numero_contrato: contrato.numero_contrato,
          data_renovacao: contrato.data_renovacao,
          certificado_nome: contrato.certificado.nome_certificado,
        });

        const certId = contrato.certificado.id;
        const certNome = contrato.certificado.nome_certificado;

        if (!certificadosMap.has(certId)) {
          certificadosMap.set(certId, {
            tipo_certificado_id: certId,
            nome: certNome,
            quantidade: 0,
          });
        }
        certificadosMap.get(certId).quantidade += 1;
      }

      const resumoCertificados = Array.from(certificadosMap.values());

      // "CONCERTANDO" O RETORNO FINAL
      const respostaFinal = {
        mes_referencia: mes_referencia, // Garante que o mês correto seja retornado
        resumoCertificados: resumoCertificados,
        detalheClientes: detalhesClientes,
      };

      return res.status(200).json(respostaFinal);
    } catch (err) {
      // Supondo que você tenha uma função errorHandler
      return errorHandler(err, res);
    }
  }

  async ConfirmarPagamento(req, res) {
    const { data } = req.body;

    return res.status(200).json({ message: "ok" });
  }

  async atualizarPagamento(req, res) {}

  async listarHistorico(req, res) {}
}

export default new PagamentoController();
