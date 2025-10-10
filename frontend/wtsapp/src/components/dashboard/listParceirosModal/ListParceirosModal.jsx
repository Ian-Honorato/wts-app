import React, { useState } from "react";
import styles from "./ListParceirosModal.module.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEye,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { useDeleteParceiroMutation } from "../../../hooks/useParceiroMutation";

const fetchParceiros = async () => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get("/api/parceiros", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const ListParceirosModal = ({
  isOpen,
  onClose,
  onFeedback,
  onShowDetails,
  onOpenUpdateModal,
}) => {
  // Busca de dados com React Query
  const {
    data: parceiros = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["parceiros"],
    queryFn: fetchParceiros,
    enabled: isOpen,
  });

  // Lógica de deleção
  const deleteMutation = useDeleteParceiroMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

  const handleDeleteClick = (partner) => {
    setPartnerToDelete(partner);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!partnerToDelete) return;

    deleteMutation.mutate(partnerToDelete.id, {
      onSuccess: () => {
        onFeedback("success", "Parceiro excluído com sucesso!");
      },
      onError: (err) => {
        onFeedback(
          "error",
          "Erro ao excluir parceiro. Verifique se ele não possui clientes vinculados."
        );
      },
      onSettled: () => {
        setIsConfirmOpen(false);
        setPartnerToDelete(null);
      },
    });
  };

  const handleDownload = () => {
    alert(
      "Funcionalidade em implementação. Em breve você poderá exportar os dados."
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2>Listar Parceiros</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.tableContainer}>
            {/* O conteúdo da tabela permanece o mesmo */}
            {isLoading && (
              <p className={styles.statusMessage}>Carregando parceiros...</p>
            )}
            {isError && (
              <p className={`${styles.statusMessage} ${styles.error}`}>
                Erro ao carregar dados.
              </p>
            )}
            {!isLoading && !isError && (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Nome do Escritório</th>
                    <th className={styles.actionsHeader}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {parceiros.length > 0 ? (
                    parceiros.map((partner) => (
                      <tr key={partner.id}>
                        <td>{partner.nome_escritorio}</td>
                        <td className={styles.actionsCell}>
                          <button
                            title="Ver Detalhes"
                            className={`${styles.actionButton} ${styles.show}`}
                            onClick={() => onShowDetails(partner.id)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            title="Editar Parceiro"
                            className={`${styles.actionButton} ${styles.update}`}
                            onClick={() => {
                              onOpenUpdateModal(partner);
                            }}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            title="Excluir Parceiro"
                            className={`${styles.actionButton} ${styles.delete}`}
                            onClick={() => handleDeleteClick(partner)}
                            disabled={
                              deleteMutation.isLoading &&
                              partnerToDelete?.id === partner.id
                            }
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className={styles.emptyMessage}>
                        Nenhum parceiro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* NOVO: Rodapé com o botão de exportar */}
          <div className={styles.footer}>
            <button className={styles.exportButton} onClick={handleDownload}>
              Exportar Parceiros (XLS)
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o parceiro "${partnerToDelete?.nome_escritorio}"?`}
      />
    </>
  );
};

export default ListParceirosModal;
