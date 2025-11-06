import React from "react";
import styles from "./FinanceiroSumarioModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faFileExcel } from "@fortawesome/free-solid-svg-icons"; // NOVO: Ícone de Excel
import {
  useSumarioFinanceiro,
  useDownloadPagamentosMutation,
} from "../../../hooks/useFinanceiroMutation";

const FinanceiroSumarioModal = ({ isOpen, onClose, mes, ano, onFeedback }) => {
  const { data: sumario, isLoading } = useSumarioFinanceiro(mes, ano);

  // NOVO: Instancia o hook de mutação para o download
  const downloadMutation = useDownloadPagamentosMutation();

  const handleExportClick = () => {
    // Reutiliza o mesmo hook, passando o mês e ano
    downloadMutation.mutate(
      { month: mes, year: ano },
      {
        onSuccess: () => {
          onFeedback?.("success", "O download do resumo foi iniciado!");
        },
        onError: () => {
          onFeedback?.(
            "error",
            "Não foi possível gerar o resumo para download."
          );
        },
      }
    );
  };

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
                <strong>
                  R$ {sumario.kpis?.totalComissao.toFixed(2) || "0.00"}
                </strong>
              </div>
              <div className={styles.kpiCard}>
                <span>Total Renovações</span>
                <strong>{sumario.kpis?.totalRenovacoes || 0}</strong>
              </div>
              <div className={styles.kpiCard}>
                <span>Parceiro Destaque</span>
                <strong>{sumario.kpis?.parceiroDestaque || "N/A"}</strong>
              </div>
            </div>
          ) : (
            <p>Não há dados para exibir.</p>
          )}
        </div>
        <div className={styles.footer}>
          <button
            className={styles.exportButton}
            onClick={handleExportClick}
            disabled={downloadMutation.isLoading}
          >
            <FontAwesomeIcon icon={faFileExcel} />
            {downloadMutation.isLoading
              ? "Exportando..."
              : "Exportar Resumo (XLS)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroSumarioModal;
