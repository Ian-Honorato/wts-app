import {
  sequelize,
  Cliente,
  Parceiro,
  ContratoCertificado,
} from "../Models/index.js";
import { Op } from "sequelize";
import { errorHandler } from "../Util/errorHandler.js";
class DashboardController {
  /**
   * Agrega e resume os principais dados do sistema para o dashboard.
   */
  async getSummary(req, res) {
    try {
      // Usamos Promise.all para executar todas as consultas em paralelo para melhor performance
      const [
        totalClients,
        clientsByType,
        contractsByStatus,
        upcomingExpirations,
        topPartners,
      ] = await Promise.all([
        // KPI 1: Total de Clientes (para um card de resumo)
        Cliente.count(),

        // KPI 2: Clientes por Tipo (para um gráfico de Pizza/Rosca)
        Cliente.findAll({
          attributes: [
            "tipo_cliente",
            [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          ],
          group: ["tipo_cliente"],
        }),

        // KPI 3: Contratos por Status (para um gráfico de Pizza/Barra)
        ContratoCertificado.findAll({
          attributes: [
            "status",
            [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          ],
          group: ["status"],
          order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
        }),

        // KPI 4: Vencimentos Próximos (para cards de alerta ou gráfico de barra)
        (async () => {
          // Garante a precisão da data, começando à meia-noite
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const in10Days = new Date(new Date().setDate(hoje.getDate() + 10));
          const in30Days = new Date(new Date().setDate(hoje.getDate() + 30));
          const in60Days = new Date(new Date().setDate(hoje.getDate() + 60));
          const in90Days = new Date(new Date().setDate(hoje.getDate() + 90));

          // Define o filtro de status que será REUTILIZADO em todas as consultas
          const statusFilter = {
            status: {
              [Op.notIn]: [
                "Cancelado",
                "Renovado",
                "Não vai renovar",
                "Agendado",
                "Em contato",
              ],
            },
          };
          const expiringIn10 = await ContratoCertificado.count({
            where: {
              data_vencimento: { [Op.between]: [in30Days, in10Days] },
              ...statusFilter,
            },
          });
          const expiringIn30 = await ContratoCertificado.count({
            where: {
              data_vencimento: { [Op.between]: [hoje, in30Days] },
              status: {
                [Op.notIn]: [
                  "Cancelado",
                  "Renovado",
                  "Não vai renovar",
                  "Agendado",
                  "Em contato",
                ],
              },
            },
          });
          const expiringIn60 = await ContratoCertificado.count({
            where: {
              data_vencimento: { [Op.between]: [in30Days, in60Days] },
              ...statusFilter,
            },
          });
          const expiringIn90 = await ContratoCertificado.count({
            where: {
              data_vencimento: { [Op.between]: [in60Days, in90Days] },
              ...statusFilter,
            },
          });

          return {
            "Próximos 10 dias": expiringIn10,
            "Próximos 30 dias": expiringIn30,
            "31-60 dias": expiringIn60,
            "61-90 dias": expiringIn90,
          };
        })(),

        // KPI 5: Top 5 Parceiros por Indicação (para uma tabela/ranking)
        Cliente.findAll({
          attributes: [
            [
              sequelize.fn("COUNT", sequelize.col("referencia_parceiro")),
              "referralCount",
            ],
          ],
          include: [
            {
              model: Parceiro,
              as: "parceiro_indicador",
              attributes: ["nome_escritorio"],
              required: true, // Garante que apenas clientes com parceiros sejam contados
            },
          ],
          group: [
            "parceiro_indicador.id",
            "parceiro_indicador.nome_escritorio",
          ],
          order: [
            [
              sequelize.fn("COUNT", sequelize.col("referencia_parceiro")),
              "DESC",
            ],
          ],
          limit: 5,
        }),
      ]);

      // Monta o objeto de resposta final
      const summary = {
        totalClients,
        clientsByType,
        contractsByStatus,
        upcomingExpirations,
        topPartners,
      };

      return res.json(summary);
    } catch (e) {
      return errorHandler(e, res);
    }
  }
}

export default new DashboardController();
