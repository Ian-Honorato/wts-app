import React, { useState } from "react";
import styles from "./FinanceiroListarModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye } from "@fortawesome/free-solid-svg-icons";

// Hooks
import {
  useSumarioFinanceiro,
  useDetalhesPagamento,
} from "../../../hooks/useFinanceiroMutation";

// Subcomponente de KPIs (o outro modal)
import FinanceiroSumarioModal from "./FinanceiroSumarioModal";

// --- Subcomponente para os Detalhes ---

const DetalhesPagamento = ({ pagamento, detalhes, isLoading }) => {
  if (isLoading)
    return <div className={styles.detalhesCard}>Carregando...</div>;
  if (!detalhes) return null;

  return (
    <div className={styles.detalhesCard}>
      <h4>Detalhes do pagamento</h4>
      <div className={styles.detalhesHeader}>
        <div>
          <span>Valor total: </span> R${" "}
          {parseFloat(pagamento.valor_total).toFixed(2)}
        </div>
        <div>
          <span>Quantidade: </span>
          {pagamento.quantidade}
        </div>
        <div>
          <span>Data Pgto.: </span>
          {new Date(pagamento.data_pagamento || Date.now()).toLocaleDateString(
            "pt-BR"
          )}
        </div>
      </div>
      <h5>{pagamento.parceiro_nome}</h5>
      <table className={styles.detalhesTable}>
        <thead>
          <tr>
            <th>Produto / Serviço</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>%</th>
            <th>Comissão</th>
          </tr>
        </thead>
        <tbody>
          {detalhes.map((item) => (
            <tr key={item.id_item}>
              {/* ATUALIZAÇÃO: Exibindo o nome real do certificado */}
              <td>{item.nome_certificado}</td>
              <td>{item.cliente_nome}</td>
              <td>{parseFloat(item.valor_certificado).toFixed(2)}</td>
              <td>{item.percentual_comissao}%</td>
              <td>R$ {parseFloat(item.valor_comissao).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Componente Principal do Modal ---
const FinanceiroListarModal = ({ isOpen, onClose }) => {
  const dataAtual = new Date();
  const [mes, setMes] = useState(dataAtual.getMonth() + 1);
  const [ano, setAno] = useState(dataAtual.getFullYear());
  const [selectedPagamento, setSelectedPagamento] = useState(null);
  const [isSumarioModalOpen, setIsSumarioModalOpen] = useState(false);

  // Hooks de busca de dados
  const { data: sumario, isLoading: isLoadingSumario } = useSumarioFinanceiro(
    mes,
    ano
  );
  const { data: detalhesDoPagamento, isLoading: isLoadingDetalhes } =
    useDetalhesPagamento(selectedPagamento?.id);

  const handleViewDetails = (pagamento) => {
    setSelectedPagamento((prev) =>
      prev?.id === pagamento.id ? null : pagamento
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* O backdrop (fundo escuro) que cobre a página */}
      <div className={styles.backdrop} onClick={onClose}>
        {/* O contêiner do modal que centraliza o conteúdo */}
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. CABEÇALHO DO MODAL */}
          <div className={styles.header}>
            <h2>Histórico de pagamentos</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* 2. CORPO DO MODAL (Aqui vai todo o seu conteúdo) */}
          <div className={styles.body}>
            <div className={styles.filters}>
              <span>Mês de referência</span>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
              >
                {/* Gerar opções de meses dinamicamente seria ideal */}
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
              <span>Ano de referência</span>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
              />
            </div>

            <div className={styles.parceirosCard}>
              <h4>Escritórios parceiros</h4>
              {isLoadingSumario ? (
                <p>Carregando...</p>
              ) : (
                <ul className={styles.parceirosList}>
                  {sumario?.pagamentos.map((p, index) => (
                    <li
                      key={p.id}
                      className={
                        selectedPagamento?.id === p.id ? styles.selected : ""
                      }
                    >
                      <span>{index + 1}</span>
                      <p>{p.parceiro_nome}</p>
                      <button onClick={() => handleViewDetails(p)}>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.actions}>
                <button
                  className={styles.apontamentosButton}
                  onClick={() => setIsSumarioModalOpen(true)}
                >
                  Ver Resumo Mensal
                </button>
              </div>
            </div>

            {selectedPagamento && (
              <DetalhesPagamento
                pagamento={selectedPagamento}
                detalhes={detalhesDoPagamento}
                isLoading={isLoadingDetalhes}
              />
            )}
          </div>
        </div>
      </div>

      <FinanceiroSumarioModal
        isOpen={isSumarioModalOpen}
        onClose={() => setIsSumarioModalOpen(false)}
        mes={mes}
        ano={ano}
      />
    </>
  );
};

export default FinanceiroListarModal;
