import React, { useState, useEffect, useMemo } from "react";
import styles from "./financeiroModal.module.css";
import { useCreatePagamentoCertificados } from "../../../hooks/useFinanceiroMutation";

// MELHORIA 3b: Constante para o valor padrão, evitando "números mágicos"
const DEFAULT_COMMISSION_PERCENTAGE = 7;

const DetalhesParceiro = ({
  certificadosData,
  isLoading,
  onFeedback,
  voltar,
}) => {
  // --- ESTADOS ---
  const [certificadoAbertoId, setCertificadoAbertoId] = useState(null);
  const [certificadoSelecionadoId, setCertificadoSelecionadoId] = useState("");
  const [valorUnitario, setValorUnitario] = useState(0);
  const [percentual, setPercentual] = useState(0);
  const [quantidade, setQuantidade] = useState(0);

  const { mutateAsync, isPending } = useCreatePagamentoCertificados();

  // --- FUNÇÕES AUXILIARES ---

  // MELHORIA 3a: Função centralizada para resetar o formulário
  const resetForm = () => {
    setCertificadoSelecionadoId("");
    setQuantidade(0);
    setValorUnitario(0);
    setPercentual(0);
  };

  // --- EFEITOS ---
  useEffect(() => {
    if (certificadoSelecionadoId && certificadosData?.resumoCertificados) {
      const cert = certificadosData.resumoCertificados.find(
        (c) => c.tipo_certificado_id.toString() === certificadoSelecionadoId
      );
      if (cert) {
        setQuantidade(cert.quantidade || 0);
        setValorUnitario(cert.valor_unitario || 0);
        setPercentual(
          cert.percentual_comissao || DEFAULT_COMMISSION_PERCENTAGE
        );
      }
    } else {
      resetForm();
    }
  }, [certificadoSelecionadoId, certificadosData]);

  // --- VALORES DERIVADOS E MEMOIZADOS ---

  // MELHORIA 1: Cálculos derivados feitos diretamente, sem useEffect ou useState extra.
  const vUnitario = parseFloat(valorUnitario) || 0;
  const perc = parseFloat(percentual) || 0;
  const qtd = parseInt(quantidade, 10) || 0;
  const comissaoUnitariaCalculada = vUnitario * (perc / 100);
  const comissaoTotalCalculada = comissaoUnitariaCalculada * qtd;

  // Extrai os dados com segurança, provendo um objeto vazio como fallback.
  const { resumoCertificados = [], detalheClientes = [] } =
    certificadosData || {};

  // MELHORIA 2: Otimização com useMemo para agrupar clientes e evitar re-cálculos.
  const clientesAgrupados = useMemo(() => {
    return detalheClientes.reduce((acc, cliente) => {
      const nomeCertificado = cliente.certificado_nome;
      if (!acc[nomeCertificado]) {
        acc[nomeCertificado] = [];
      }
      acc[nomeCertificado].push(cliente);
      return acc;
    }, {});
  }, [detalheClientes]); // Apenas re-calcula se 'detalheClientes' mudar.

  // --- FUNÇÕES DE CONTROLE ---
  const handleToggleClientes = (certId) => {
    setCertificadoAbertoId(certificadoAbertoId === certId ? null : certId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certificadoSelecionadoId) {
      onFeedback("error", "Por favor, selecione um tipo de certificado.");
      return;
    }

    //Encontrar o objeto do certificado selecionado para obter o nome
    const certificadoSelecionado = resumoCertificados.find(
      (cert) => cert.tipo_certificado_id.toString() === certificadoSelecionadoId
    );

    if (!certificadoSelecionado) {
      onFeedback("Certificado selecionado não encontrado.", "error");
      return;
    }
    const nomeCertificadoSelecionado = certificadoSelecionado.nome;

    // Passo 2: Filtrar os detalhes dos clientes/contratos pelo nome e extrair os IDs
    const contratosIds = detalheClientes
      .filter(
        (cliente) => cliente.certificado_nome === nomeCertificadoSelecionado
      )
      .map((cliente) => cliente.contrato_certificado_id);

    // Verificação para garantir que temos IDs para enviar
    if (contratosIds.length === 0) {
      onFeedback(
        "Nenhum contrato encontrado para este tipo de certificado.",
        "error"
      );
      return;
    }

    const pagamentoData = {
      tipo_certificado_id: certificadoSelecionadoId,
      valor_unitario: vUnitario,
      percentual_comissao: perc,
      quantidade: qtd,
      contratos_referencia: contratosIds,
      comissao_unitaria: comissaoUnitariaCalculada,
      comissao_total: comissaoTotalCalculada,
    };
    console.log("Dados do pagamento a serem enviados:", pagamentoData);
    console.log("IDs dos contratos:", contratosIds);

    // Chamada à mutação para criar o pagamento
    try {
      const resultado = await mutateAsync(pagamentoData);
      if (resultado) {
        onFeedback("success", "Pagamento criado com sucesso!");
        voltar();
        resetForm();
      }
    } catch (error) {
      onFeedback("error", "Erro ao criar pagamento. Tente novamente.");
      console.error("Erro ao criar pagamento:", error.errors || error);
    }
  };

  if (isLoading)
    return <p className={styles.centeredMessage}>Carregando detalhes...</p>;
  if (!certificadosData)
    return <p className={styles.centeredMessage}>Nenhum dado encontrado.</p>;

  return (
    <div className={styles.detalhesGrid}>
      {/* Coluna da Esquerda: Lista de Certificados */}
      <div className={styles.certificadosResumo}>
        <h4>Certificados Renovados</h4>
        <ul>
          {resumoCertificados.map((cert) => (
            <li
              key={cert.tipo_certificado_id}
              className={styles.certificadoItem}
            >
              <div
                className={styles.certificadoHeader}
                onClick={() => handleToggleClientes(cert.tipo_certificado_id)}
              >
                <span>{cert.nome}</span>
                <span className={styles.badge}>{cert.quantidade}</span>
              </div>
              {certificadoAbertoId === cert.tipo_certificado_id && (
                <ul className={styles.clientesLista}>
                  {/* MELHORIA 2 em ação: busca rápida no objeto agrupado */}
                  {clientesAgrupados[cert.nome]?.map((cliente, index) => (
                    <li key={index}>{cliente.cliente_nome}</li>
                  )) || <li>Nenhum cliente encontrado.</li>}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Coluna da Direita: Formulário de Comissão*/}
      <div className={styles.comissaoForm}>
        <h4>Calcular Comissão</h4>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Tipo certificado:</label>
            <select
              value={certificadoSelecionadoId}
              onChange={(e) => setCertificadoSelecionadoId(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Selecione um tipo...</option>
              {resumoCertificados.map((cert) => (
                <option
                  key={cert.tipo_certificado_id}
                  value={cert.tipo_certificado_id}
                >
                  {cert.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Quantidade</label>
            <input type="number" value={quantidade} readOnly disabled />
          </div>

          <div className={styles.inputGroup}>
            <label>Valor Unitário (R$)</label>
            <input
              type="number"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Percentual (%)</label>
            <input
              type="number"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Comissão Unitária (R$)</label>
              {/* MELHORIA 1 em ação: usando a variável calculada */}
              <input
                type="text"
                value={comissaoUnitariaCalculada.toFixed(2)}
                readOnly
                disabled
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Comissão Total (R$)</label>
              {/* MELHORIA 1 em ação: usando a variável calculada */}
              <input
                type="text"
                value={comissaoTotalCalculada.toFixed(2)}
                readOnly
                disabled
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isPending}
          >
            {isPending ? "Confirmando..." : "Confirmar Operação"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DetalhesParceiro;
