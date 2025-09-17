import React from "react";
import styles from "./renovationsCard.module.css"; // Vamos criar este CSS a seguir

const RenovationsCard = ({ value, filters, setFilters, handleSearch }) => {
  return (
    <div className={styles.renovationsWidget}>
      <div className={styles.statSection}>
        <div className={styles.statIcon}>🔄</div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statTitle}>Renovados no Período</div>
      </div>

      {/* Seção separada para os controles de filtro */}
      <div className={styles.filterSection}>
        <input
          type="date"
          placeholder="Início periodo"
          value={filters.data_inicio}
          onChange={(e) =>
            setFilters({ ...filters, data_inicio: e.target.value })
          }
          className={styles.filterInput}
        />
        <input
          type="date"
          placeholder="Fim do periodo"
          value={filters.data_fim}
          onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
          className={styles.filterInput}
        />
      </div>
      <button onClick={handleSearch} className={styles.searchButton}>
        Buscar
      </button>
    </div>
  );
};

export default RenovationsCard;
