// Importa a conexão e os modelos a partir do inicializador central
import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
  PagamentoParceiro,
  PagamentoCertificado,
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

      // --- CORREÇÃO AQUI: 'attributes' movido para fora da 'where' ---
      const contatosPagos = await PagamentoCertificado.findAll({
        where: {
          created_at: {
            // Ou a data que representa quando o pagamento foi feito
            [Op.between]: [data_inicio, data_fim],
          },
        },
        attributes: ["contrato_certificado_id"], // Posição correta
      });

      const contratosPagosIds = contatosPagos.map(
        (pag) => pag.contrato_certificado_id
      );

      // Se não houver IDs pagos, a consulta com [Op.notIn]: [] pode falhar em alguns bancos.
      // Garantimos que, se estiver vazio, a condição não quebre a query.
      if (contratosPagosIds.length === 0) {
        contratosPagosIds.push(0); // Adiciona um ID impossível para garantir que notIn funcione
      }

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
              id: { [Op.notIn]: contratosPagosIds },
            },
          },
        },
        group: ["Parceiro.id"],
        order: [["nome_escritorio", "ASC"]],
      });

      return res.json(parceiros);
    } catch (err) {
      return errorHandler(err, res);
    }
  }

  async buscarPendentes(req, res) {
    try {
      const { parceiro_id, mes_referencia } = req.query;

      // Sua validação de parâmetros está ótima.
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

      // Sua lógica de datas está perfeita.
      const ano_atual = new Date().getFullYear();
      const data_inicio = new Date(ano_atual, mes_referencia - 1, 1);
      data_inicio.setHours(0, 0, 0, 0);
      const data_fim = new Date(ano_atual, mes_referencia, 0);
      data_fim.setHours(23, 59, 59, 999);

      // --- BUSCAR A LISTA, AGORA COM A VERIFICAÇÃO INTEGRADA ---
      const contratosRenovados = await ContratoCertificado.findAll({
        where: {
          status: "Renovado",
          data_renovacao: { [Op.between]: [data_inicio, data_fim] },

          "$pagamentos_comissao.id$": null,
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

          {
            model: PagamentoCertificado,
            as: "pagamentos_comissao",
            attributes: [],
            required: false,
          },
        ],
        order: [["data_renovacao", "ASC"]],
      });

      if (contratosRenovados.length === 0) {
        return res.status(200).json({
          mes_referencia: mes_referencia,
          resumoCertificados: [],
          detalheClientes: [],
        });
      }

      const detalhesClientes = [];
      const certificadosMap = new Map();

      for (const contrato of contratosRenovados) {
        detalhesClientes.push({
          cliente_nome: contrato.cliente.nome,
          contrato_certificado_id: contrato.id,
          numero_contrato: contrato.numero_contrato,
          data_renovacao: contrato.data_renovacao,
          certificado_nome: contrato.certificado.nome_certificado,

          valor_comissao: contrato.valor_comissao_parceiro,
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

      const respostaFinal = {
        mes_referencia: mes_referencia,
        resumoCertificados: resumoCertificados,
        detalheClientes: detalhesClientes,
      };

      return res.status(200).json(respostaFinal);
    } catch (err) {
      return errorHandler(err, res);
    }
  }

  async criarPagamento(req, res) {
    // =================================================================================
    // ETAPA 1: PREPARAÇÃO E VALIDAÇÃO DOS DADOS
    // =================================================================================
    try {
      const {
        parceiro_id,
        mes_referencia,
        contratos_referencia,
        valor_unitario,
        percentual_comissao,
        comissao_unitaria: comissao_unitaria_frontend,
        comissao_total: comissao_total_frontend,
      } = req.body;

      // Validação de dados essenciais
      if (
        !parceiro_id ||
        !mes_referencia ||
        !contratos_referencia ||
        !contratos_referencia.length
      ) {
        return res.status(400).json({ error: "Dados essenciais ausentes." });
      }

      // Preparação da data de referência
      const anoAtual = new Date().getFullYear();
      const mesReferenciaFormatado = new Date(anoAtual, mes_referencia - 1, 1);

      // Recálculo da comissão no backend
      const comissaoUnitaria_backend =
        parseFloat(valor_unitario) * (parseFloat(percentual_comissao) / 100);
      const comissaoTotal_backend =
        comissaoUnitaria_backend * contratos_referencia.length;

      // Validação de discrepância entre frontend e backend
      const diferencaTotal = Math.abs(
        comissaoTotal_backend - parseFloat(comissao_total_frontend)
      );
      if (diferencaTotal > 0.01) {
        return res.status(400).json({
          error: "Discrepância nos valores de comissão.",
          backend_calculado: { total: comissaoTotal_backend },
          frontend_enviado: { total: comissao_total_frontend },
        });
      }

      // =================================================================================
      // ETAPA 2: TRANSAÇÃO NO BANCO DE DADOS
      // =================================================================================

      // A partir daqui, todas as operações são envolvidas em uma transação.
      const resultado = await sequelize.transaction(async (t) => {
        // --- 2.1: Encontra ou Cria a "Fatura" principal para o parceiro no mês. ---
        const [pagamentoParceiro, foiCriado] =
          await PagamentoParceiro.findOrCreate({
            where: {
              parceiro_id: parceiro_id,
              mes_referencia: mesReferenciaFormatado,
            },
            defaults: {
              parceiro_id: parceiro_id,
              mes_referencia: mesReferenciaFormatado,
              valor_total: comissaoTotal_backend,
              quantidade: contratos_referencia.length,
              status: "Pendente",
              data_pagamento: new Date(),
            },
            transaction: t,
          });

        // --- 2.2: Se a fatura já existia, atualiza os totais. ---
        if (!foiCriado) {
          pagamentoParceiro.valor_total =
            parseFloat(pagamentoParceiro.valor_total) + comissaoTotal_backend;
          pagamentoParceiro.quantidade += contratos_referencia.length;
          await pagamentoParceiro.save({ transaction: t });
        }

        // --- 2.3: Prepara os dados dos "itens" da fatura (certificados individuais). ---
        const dadosCertificados = contratos_referencia.map((contratoId) => ({
          pagamento_id: pagamentoParceiro.id, // Associa ao ID da fatura principal
          contrato_certificado_id: contratoId,
          valor_certificado: valor_unitario,
          percentual_comissao: percentual_comissao,
          valor_total: comissaoUnitaria_backend,
        }));

        // --- 2.4: Insere todos os itens da fatura de uma vez. ---
        await PagamentoCertificado.bulkCreate(dadosCertificados, {
          transaction: t,
        });

        // Se todas as etapas acima funcionarem, a transação retornará o ID.
        return { pagamentoParceiroId: pagamentoParceiro.id };
      });

      // =================================================================================
      // ETAPA 3: SUCESSO - ENVIO DA RESPOSTA FINAL
      // =================================================================================
      // Se a transação foi concluída com sucesso, 'resultado' conterá o que retornamos.
      return res.status(201).json({
        message: "Pagamento registrado com sucesso!",
        pagamentoParceiroId: resultado.pagamentoParceiroId,
      });
    } catch (error) {
      // =================================================================================
      // ETAPA 4: FALHA - A TRANSAÇÃO É REVERTIDA AUTOMATICAMENTE
      // =================================================================================
      // Se qualquer 'await' dentro do bloco de transação falhar, o Sequelize
      // automaticamente fará o rollback e o erro será capturado aqui.
      console.error("Erro na transação ao registrar pagamento:", error);
      return res
        .status(500)
        .json({ error: "Ocorreu um erro interno ao processar o pagamento." });
    }
  }
  async sumarioFinanceiro(req, res) {
    try {
      const { mes, ano } = req.query;

      // Validação dos parâmetros de data
      if (!mes || !ano) {
        return res
          .status(400)
          .json({ error: "Os parâmetros 'mes' e 'ano' são obrigatórios." });
      }

      // Cria o intervalo de datas para a consulta
      const data_inicio = new Date(ano, mes - 1, 1);
      const data_fim = new Date(ano, mes, 0, 23, 59, 59); // Último dia, hora, minuto e segundo do mês

      // Consulta principal que busca todos os pagamentos de parceiros no período
      const pagamentosDoMes = await PagamentoParceiro.findAll({
        where: {
          mes_referencia: {
            [Op.between]: [data_inicio, data_fim],
          },
        },
        include: {
          model: Parceiro,
          as: "parceiro", // Assumindo que a associação se chama 'parceiro'
          attributes: ["nome_escritorio"],
          required: true,
        },
        order: [["valor_total", "DESC"]], // Ordena por maior comissão
      });

      // Se não houver dados, retorna uma resposta vazia e estruturada
      if (!pagamentosDoMes || pagamentosDoMes.length === 0) {
        return res.status(200).json({
          kpis: {
            totalComissao: 0,
            totalRenovacoes: 0,
            parceiroDestaque: "N/A",
          },
          topParceiros: [],
          pagamentos: [],
        });
      }

      // --- Processamento dos dados para montar a resposta ---

      // 1. Cálculo dos KPIs
      const kpis = pagamentosDoMes.reduce(
        (acc, pagamento) => {
          acc.totalComissao += parseFloat(pagamento.valor_total);
          acc.totalRenovacoes += pagamento.quantidade;
          return acc;
        },
        {
          totalComissao: 0,
          totalRenovacoes: 0,
          parceiroDestaque: pagamentosDoMes[0].parceiro.nome_escritorio,
        }
      );

      // 2. Dados para o gráfico (Top 5)
      const topParceiros = pagamentosDoMes.slice(0, 5).map((pagamento) => ({
        nome: pagamento.parceiro.nome_escritorio,
        valor: parseFloat(pagamento.valor_total),
      }));

      // 3. Formatação da lista de pagamentos para a tabela principal
      const pagamentosFormatados = pagamentosDoMes.map((pagamento) => ({
        id: pagamento.id,
        parceiro_nome: pagamento.parceiro.nome_escritorio,
        mes_referencia: pagamento.mes_referencia,
        quantidade: pagamento.quantidade,
        valor_total: pagamento.valor_total,
        status: pagamento.status,
      }));

      // Monta a resposta final
      const resposta = {
        kpis,
        topParceiros,
        pagamentos: pagamentosFormatados,
      };

      return res.status(200).json(resposta);
    } catch (error) {
      console.error("Erro ao gerar sumário financeiro:", error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  async listarPagamentos(req, res) {
    const { parceiro_id } = req.params;
    try {
      if (!parceiro_id)
        return res
          .status(400)
          .json({ error: "O ID do parceiro é obrigatório." });

      const pagamentos = await pagamentoParceiro.findAll({
        where: { parceiro_id },
        order: [["mes_referencia", "DESC"]],
        include: [
          { model: Parceiro, as: "parceiro", attributes: ["nome_escritorio"] },
        ],
      });
    } catch (error) {
      return handleError(error, res);
    }
  }
  async listarHistorico(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ error: "O ID do pagamento é obrigatório." });
      }

      const detalhesDoPagamento = await PagamentoCertificado.findAll({
        where: {
          pagamento_id: id,
        },
        include: [
          {
            model: ContratoCertificado,
            as: "contrato",
            attributes: [
              "numero_contrato",
              "data_renovacao",
              "referencia_certificado",
            ],

            include: [
              {
                model: Certificado,
                as: "certificado",
                attributes: ["nome_certificado"],
              },
              {
                model: Cliente,
                as: "cliente",
                attributes: ["nome"],
              },
            ],
          },
        ],
        order: [["id", "ASC"]],
      });

      if (!detalhesDoPagamento || detalhesDoPagamento.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhum detalhe encontrado para este pagamento." });
      }

      const detalhesFormatados = detalhesDoPagamento.map((detalhe) => ({
        id_item: detalhe.id,
        numero_contrato: detalhe.contrato.numero_contrato,
        cliente_nome: detalhe.contrato.cliente.nome,

        nome_certificado: detalhe.contrato.certificado.nome_certificado,
        valor_certificado: detalhe.valor_certificado,
        percentual_comissao: detalhe.percentual_comissao,
        valor_comissao: detalhe.valor_total,
      }));

      return res.status(200).json(detalhesFormatados);
    } catch (error) {
      console.error("Erro ao listar histórico de pagamento:", error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }
}

export default new PagamentoController();
