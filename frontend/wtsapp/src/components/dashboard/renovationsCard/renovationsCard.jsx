import React from "react";
import styles from "./renovationsCard.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
const RenovationsCard = ({
  value,
  renovacoes = [],
  filters,
  setFilters,
  handleSearch,
  onClientClick,
}) => {
  const handleClientClick = (clientId) => {
    if (onClientClick) {
      onClientClick(clientId);
    }
  };

  return (
    <div className={styles.renovationsWidget}>
      <div className={styles.statSection}>
        <div className={styles.statIcon}>
          {" "}
          <FontAwesomeIcon icon={faSync} />
        </div>
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

      {/*Seção para listar os clientes renovados --- */}
      {renovacoes.length > 0 && (
        <div className={styles.resultsSection}>
          <h4 className={styles.resultsTitle}>Clientes Renovados</h4>
          <ul className={styles.resultsList}>
            {renovacoes.map((renovacao) => (
              <li key={renovacao.cliente.id} className={styles.resultsItem}>
                <button
                  className={styles.clientButton}
                  onClick={() => handleClientClick(renovacao.cliente.id)}
                >
                  {renovacao.cliente.nome}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RenovationsCard;
