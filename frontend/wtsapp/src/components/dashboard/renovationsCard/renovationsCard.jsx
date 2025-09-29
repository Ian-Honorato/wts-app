import React from "react";
import styles from "./renovationsCard.module.css";

// --- ALTERAÇÃO 1: Receber a nova prop 'renovacoes' ---
const RenovationsCard = ({
  value,
  renovacoes = [],
  filters,
  setFilters,
  handleSearch,
}) => {
  return (
    <div className={styles.renovationsWidget}>
      <div className={styles.statSection}>
        <div className={styles.statIcon}>🔄</div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statTitle}>Renovados no Período</div>
      </div>

      <div className={styles.filterSection}>
        <input
          type="date"
          value={filters.data_inicio}
          onChange={(e) =>
            setFilters({ ...filters, data_inicio: e.target.value })
          }
          className={styles.filterInput}
        />
        <input
          type="date"
          value={filters.data_fim}
          onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
          className={styles.filterInput}
        />
      </div>
      <button onClick={handleSearch} className={styles.searchButton}>
        Buscar
      </button>

      {/* --- ALTERAÇÃO 2: Seção para listar os clientes renovados --- */}
      {renovacoes.length > 0 && (
        <div className={styles.resultsSection}>
          <h4 className={styles.resultsTitle}>Clientes Renovados</h4>
          <ul className={styles.resultsList}>
            {renovacoes.map((renovacao) => (
              <li key={renovacao.id} className={styles.resultsItem}>
                {renovacao.Cliente?.nome || "Cliente não identificado"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RenovationsCard;
