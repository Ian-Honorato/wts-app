import React from "react";
import styles from "./FinanceiroSumarioModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useSumarioFinanceiro } from "../../../hooks/useFinanceiroMutation";

const FinanceiroSumarioModal = ({ isOpen, onClose, mes, ano }) => {
  // Busca os dados de sumário (usará o cache do react-query se já tiver sido buscado na página)
  const { data: sumario, isLoading } = useSumarioFinanceiro(mes, ano);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            Resumo de{" "}
            {new Date(ano, mes - 1).toLocaleString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className={styles.body}>
          {isLoading ? (
            <p>Carregando KPIs...</p>
          ) : sumario ? (
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <span>Comissão Total</span>
                <strong>R$ {sumario.kpis.totalComissao.toFixed(2)}</strong>
              </div>
              <div className={styles.kpiCard}>
                <span>Total Renovações</span>
                <strong>{sumario.kpis.totalRenovacoes}</strong>
              </div>
              <div className={styles.kpiCard}>
                <span>Parceiro Destaque</span>
                <strong>{sumario.kpis.parceiroDestaque}</strong>
              </div>
            </div>
          ) : (
            <p>Não há dados para exibir.</p>
          )}
          {/* Aqui você pode adicionar o gráfico com os top 5 parceiros, se desejar */}
        </div>
      </div>
    </div>
  );
};

export default FinanceiroSumarioModal;
