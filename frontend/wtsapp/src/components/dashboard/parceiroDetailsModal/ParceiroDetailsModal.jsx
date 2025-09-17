import React from "react";
import styles from "./parceiroDetailsModal.module.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEdit } from "@fortawesome/free-solid-svg-icons";

// Função para buscar os detalhes do parceiro
const fetchParceiroDetails = async (parceiroId) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get(
    `http://localhost:3001/parceiros/${parceiroId}/contratos`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

const ParceiroDetailsModal = ({
  isOpen,
  onClose,
  parceiroId,
  onOpenUpdateModal,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["parceiroDetails", parceiroId], // A chave da query depende do ID
    queryFn: () => fetchParceiroDetails(parceiroId),
    enabled: !!parceiroId && isOpen, // Só busca se houver um ID e o modal estiver aberto
  });

  // Função para processar e contar contratos por tipo
  const getStatsPorTipo = () => {
    if (!data?.contratos_associados) return {};
    return data.contratos_associados.reduce((acc, contrato) => {
      const tipo = contrato.tipo_contrato || "Não especificado";
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
  };

  const statsPorTipo = getStatsPorTipo();

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Detalhes do Parceiro</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.detailsContainer}>
          {isLoading && (
            <p className={styles.statusMessage}>Carregando detalhes...</p>
          )}
          {isError && (
            <p className={`${styles.statusMessage} ${styles.error}`}>
              Erro ao buscar detalhes.
            </p>
          )}

          {data && (
            <>
              <h3 className={styles.partnerName}>
                {data.parceiro.nome_escritorio}
              </h3>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {data.quantidade_clientes_indicados}
                  </span>
                  <span className={styles.statLabel}>Clientes Indicados</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {data.contratos_associados.length}
                  </span>
                  <span className={styles.statLabel}>Contratos Totais</span>
                </div>
              </div>

              <h4 className={styles.sectionTitle}>Contratos por Tipo</h4>
              <ul className={styles.typeList}>
                {Object.keys(statsPorTipo).length > 0 ? (
                  Object.entries(statsPorTipo).map(([tipo, count]) => (
                    <li key={tipo}>
                      <span>{tipo}:</span>
                      <strong>{count}</strong>
                    </li>
                  ))
                ) : (
                  <li>Nenhum contrato associado.</li>
                )}
              </ul>

              <div className={styles.actionsFooter}>
                <button
                  className={styles.editButton}
                  onClick={() => onOpenUpdateModal(data.parceiro)}
                >
                  <FontAwesomeIcon icon={faEdit} /> Editar Parceiro
                </button>
                <button className={styles.paymentButton} disabled>
                  Gerar Pagamento (Em breve)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParceiroDetailsModal;
