import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  PagamentoParceiro,
  PagamentoCertificado,
  ContratoCertificado,
} from "../Models/index.js";

import { Op, fn, col } from "sequelize";
import { utils, write } from "xlsx";
import { errorHandler } from "../Util/errorHandler.js";

class DownloadController {
  async downloadXls(req, res) {
    try {
      const { status, startDate, endDate } = req.query;

      console.log(
        "DADOS RECEBIDOS DO FRONTEND ->" + status,
        startDate,
        endDate
      );
      const contratoInclude = {
        model: ContratoCertificado,
        as: "contratos",
        attributes: [
          "numero_contrato",
          "data_vencimento",
          "data_renovacao",
          "status",
        ],
        include: [
          {
            model: Certificado,
            as: "certificado",
            attributes: ["nome_certificado"],
          },
        ],
      };

      const parceiroInclude = {
        model: Parceiro,
        as: "parceiro_indicador",
        attributes: ["nome_escritorio"],
      };

      const contratoWhereClause = {};

      if (status) {
        contratoWhereClause.status = status;
      }

      // --- LÓGICA DE DATA ADICIONADA ---
      const dateFilter = {};
      if (startDate) {
        dateFilter[Op.gte] = startDate;
      }
      if (endDate) {
        dateFilter[Op.lte] = `${endDate} 23:59:59`;
      }

      if (Object.keys(dateFilter).length > 0) {
        contratoWhereClause.data_vencimento = dateFilter;
      }

      if (Object.keys(contratoWhereClause).length > 0) {
        contratoInclude.where = contratoWhereClause;
        contratoInclude.required = true;
      }

      // --- DEBUGGING ---
      console.log(
        "Executando download com filtros:",
        JSON.stringify(contratoInclude.where, null, 2)
      );

      const clientes = await Cliente.findAll({
        attributes: [
          "id",
          "nome",
          "cpf_cnpj",
          "representante",
          "telefone",
          "email",
        ],
        include: [contratoInclude, parceiroInclude],
        order: [["nome", "ASC"]],
      });

      // --- DEBUGGING ---
      console.log(`Clientes encontrados: ${clientes.length}`);

      const dadosPlanilha = [];
      clientes.forEach((cliente) => {
        if (cliente.contratos && cliente.contratos.length > 0) {
          cliente.contratos.forEach((contrato) => {
            dadosPlanilha.push({
              //ID_Cliente: cliente.id,
              Nome: cliente.nome,
              "CPF/CNPJ": cliente.cpf_cnpj,
              Representante: cliente.representante,
              Telefone: cliente.telefone,
              Email: cliente.email,
              Parceiro_Indicador: cliente.parceiro_indicador
                ? cliente.parceiro_indicador.nome_escritorio
                : "N/A",
              Numero_Contrato: contrato.numero_contrato,
              Status_Contrato: contrato.status,
              Data_Vencimento: contrato.data_vencimento,
              Data_Renovacao: contrato.data_renovacao,
              Certificado: contrato.certificado
                ? contrato.certificado.nome_certificado
                : "N/A",
            });
          });
        } else {
          dadosPlanilha.push({
            //ID_Cliente: cliente.id,
            Nome: cliente.nome,
            "CPF/CNPJ": cliente.cpf_cnpj,
            Representante: cliente.representante,
            Telefone: cliente.telefone,
            Email: cliente.email,
            Parceiro_Indicador: cliente.parceiro_indicador
              ? cliente.parceiro_indicador.nome_escritorio
              : "N/A",
            Numero_Contrato: "N/A",
            Status_Contrato: "N/A",
            Data_Vencimento: "N/A",
            Data_Renovacao: "N/A",
            Certificado: "N/A",
          });
        }
      });
      console.log("dados finais" + dadosPlanilha);
      const worksheet = utils.json_to_sheet(dadosPlanilha);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Clientes");

      const buffer = write(workbook, { bookType: "xlsx", type: "buffer" });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="Lista_Clientes.xlsx"'
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      return res.status(200).send(buffer);
    } catch (e) {
      console.error("Erro ao gerar a planilha de clientes:", e);
      return errorHandler(e, res);
    }
  }
  async downloadXlsFinanceiro(req, res) {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ message: "Mês e Ano são obrigatórios." });
      }

      const lotePagamentoWhere = {
        [Op.and]: [
          sequelize.where(fn("MONTH", col("mes_referencia")), month),
          sequelize.where(fn("YEAR", col("mes_referencia")), year),
        ],
      };

      const itensPagamento = await PagamentoCertificado.findAll({
        attributes: ["valor_certificado", "percentual_comissao", "valor_total"],
        include: [
          {
            model: PagamentoParceiro,
            as: "pagamento_parceiro", // <-- VERIFIQUE ESTE ALIAS
            where: lotePagamentoWhere,
            required: true,
            attributes: ["mes_referencia", "data_pagamento"],
            include: [
              {
                model: Parceiro,
                as: "parceiro", // <-- VERIFIQUE ESTE ALIAS
                attributes: ["nome_escritorio"],
              },
            ],
          },
          // Inclui o CONTRATO (para obter dados do contrato, cliente e certificado)
          {
            model: ContratoCertificado,
            as: "contrato", // <-- VERIFIQUE ESTE ALIAS
            attributes: ["numero_contrato", "data_vencimento", "status"],
            include: [
              {
                model: Cliente,
                as: "cliente", // <-- VERIFIQUE ESTE ALIAS
                attributes: ["nome", "cpf_cnpj"],
              },
              {
                model: Certificado,
                as: "certificado", // <-- VERIFIQUE ESTE ALIAS
                attributes: ["nome_certificado"],
              },
            ],
          },
        ],
        // Ordena pelo nome do parceiro e depois pelo nome do cliente
        order: [
          [
            { model: PagamentoParceiro, as: "pagamento_parceiro" },
            { model: Parceiro, as: "parceiro" },
            "nome_escritorio",
            "ASC",
          ],
          [
            { model: ContratoCertificado, as: "contrato" },
            { model: Cliente, as: "cliente" },
            "nome",
            "ASC",
          ],
        ],
      });

      console.log(
        `Registros financeiros encontrados: ${itensPagamento.length}`
      );

      // 3. Mapear os dados para a planilha
      const dadosPlanilha = itensPagamento.map((item) => {
        // Usar '?' (optional chaining) para evitar erros de 'null'
        const nomeParceiro =
          item.pagamento_parceiro?.parceiro?.nome_escritorio || "N/A";
        const nomeCliente = item.contrato?.cliente?.nome || "N/A";
        const cpfCnpjCliente = item.contrato?.cliente?.cpf_cnpj || "N/A";
        const nomeCertificado =
          item.contrato?.certificado?.nome_certificado || "N/A";
        const numContrato = item.contrato?.numero_contrato || "N/A";
        const dataPagamentoLote =
          item.pagamento_parceiro?.data_pagamento || "N/A";
        const mesReferencia = item.pagamento_parceiro?.mes_referencia || "N/A";

        return {
          Parceiro: nomeParceiro,
          "Mês Referência": mesReferencia,
          "Data Pagamento": dataPagamentoLote,
          Cliente: nomeCliente,
          "CPF/CNPJ": cpfCnpjCliente,
          Certificado: nomeCertificado,
          "Nº Contrato": numContrato,
          Status_Contrato: item.contrato?.status || "N/A",
          Data_Vencimento_Contrato: item.contrato?.data_vencimento || "N/A",
          "Valor Base (R$)": item.valor_certificado,
          "% Comissão": item.percentual_comissao,
          "Valor Comissão (R$)": item.valor_total,
        };
      });

      // --- Geração do XLS ---
      const worksheet = utils.json_to_sheet(dadosPlanilha);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Pagamentos");

      const buffer = write(workbook, { bookType: "xlsx", type: "buffer" });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="Relatorio_Financeiro.xlsx"'
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      return res.status(200).send(buffer);
    } catch (e) {
      console.error("Erro ao gerar a planilha de pagamentos:", e);
      return errorHandler(e, res);
    }
  }
}

export default new DownloadController();
