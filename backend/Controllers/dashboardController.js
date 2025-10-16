import {
  sequelize,
  Cliente,
  Parceiro,
  ContratoCertificado,
} from "../Models/index.js";
import { Op } from "sequelize";
import { errorHandler } from "../Util/errorHandler.js";
class DashboardController {
  async getSummary(req, res) {
    try {
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
              required: true,
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

      return res.status(200).json(summary);
    } catch (e) {
      console.log("Caiu no catch - verificar ");
      return errorHandler(e, res);
    }
  }
  async getRenovationsByPeriod(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;
      let startDate;
      let endDate;

      const parseDate = (dateString) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return new Date(dateString + "T00:00:00");
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
          const [day, month, year] = dateString.split("/");
          return new Date(`${year}-${month}-${day}T00:00:00`);
        }
        return null;
      };

      if (data_inicio && data_fim) {
        startDate = parseDate(data_inicio);
        endDate = parseDate(data_fim);
      } else {
        const hoje = new Date();
        startDate = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        endDate = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      }

      const whereOptions = {
        status: "Renovado",
      };

      if (startDate && endDate) {
        endDate.setHours(23, 59, 59, 999);
        whereOptions.updated_at = {
          // Lembre-se de confirmar esta coluna
          [Op.between]: [startDate, endDate],
        };
      }

      const renovatedContracts = await ContratoCertificado.findAll({
        attributes: ["id", "updated_at"],
        where: whereOptions,
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["id", "nome"],
            required: true,
          },
        ],
        order: [["updated_at", "DESC"]],
      });

      // A resposta permanece a mesma
      return res.json({
        totalRenovados: renovatedContracts.length,
        renovacoes: renovatedContracts,
      });
    } catch (e) {
      return errorHandler(e, res);
    }
  }
  async getNotificacoesPorMes(req, res) {
    // O bloco try permanece o mesmo
    try {
      const mes = parseInt(req.query.month) || new Date().getMonth() + 1;
      const ano = new Date().getFullYear();

      const startDate = new Date(ano, mes - 1, 1);
      const endDate = new Date(ano, mes, 0);
      endDate.setHours(23, 59, 59, 999);

      const { count, rows } = await MensagensEnviadas.findAndCountAll({
        where: {
          data_envio: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: Cliente,
            as: "cliente_notificado",
            attributes: ["id", "nome", "cpf_cnpj", "telefone"],
          },
        ],
        order: [["created_at", "DESC"]],
        distinct: true,
      });

      return res.json({
        totalNotificados: count,
        notificacoes: rows,
      });
    } catch (error) {
      console.error("Erro ao buscar notificações por mês:", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
}

export default new DashboardController();
