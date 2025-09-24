import React from "react";
import { useState } from "react";
import styles from "./clientDetailsModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { useQuery } from "@tanstack/react-query";
import { detailsClientApi } from "../../../hooks/useMutation";

import { useDeleteClientMutation } from "../../../hooks/useMutation";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

import {
  formatarCpfCnpj,
  formatarTelefone,
} from "../../../hooks/util/Mascaras";

const ClientDetailsModal = ({
  isOpen,
  onClose,
  clientId,
  onOpenUpdateModal,
  onFeedback,
}) => {
  const deleteMutation = useDeleteClientMutation();

  // Estados para o modal de confirmação
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const {
    data: details,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => detailsClientApi(clientId),
    enabled: isOpen && !!clientId,
  });

  const handleAlterar = () => {
    onClose();
    setTimeout(() => {
      onOpenUpdateModal(details);
    }, 300);
  };

  const handleDelete = () => {
    setClientToDelete({ id: details.id, nome: details.nome });
    setIsConfirmModalOpen(true);
  };
  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete.id, {
        onSuccess: () => {
          onFeedback("success", "Cliente excluído com sucesso!");
        },
        onError: (error) => {
          console.error("Erro ao excluir cliente:", error);
          onFeedback("error", "Não foi possível excluir o cliente.");
        },
        onSettled: () => {
          setIsConfirmModalOpen(false);
          setClientToDelete(null);
        },
      });
    }
  };

  // handler para o cancelamento, para limpar o estado
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setClientToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return new Date(dateString).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
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
            <h2>Detalhes do Cliente</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.detailsBody}>
            {isLoading && <p>Carregando...</p>}
            {error && (
              <p className={styles.error}>Erro ao carregar detalhes.</p>
            )}
            {details && (
              <div className={styles.detailsGrid}>
                {/* Bloco de Dados Pessoais */}
                <div className={styles.infoBlock}>
                  <h4>Dados Pessoais</h4>
                  <p>
                    <strong>Nome:</strong> {details.nome}
                  </p>
                  <p>
                    <strong>CPF/CNPJ:</strong>{" "}
                    {formatarCpfCnpj(details.cpf_cnpj)}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {details.tipo_cliente}
                  </p>
                  <p>
                    <strong>Representante:</strong>{" "}
                    {details.representante || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {details.email || "N/A"}
                  </p>
                  <p>
                    <strong>Telefone:</strong>{" "}
                    {formatarTelefone(details.telefone)}
                  </p>
                </div>

                {/* Bloco de Dados do Contrato */}
                {details.contratos && details.contratos[0] && (
                  <div className={styles.infoBlock}>
                    <h4>Dados do Contrato</h4>
                    <p>
                      <strong>Nº Contrato:</strong>{" "}
                      {details.contratos[0].numero_contrato}
                    </p>
                    <p>
                      <strong>Certificado:</strong>{" "}
                      {details.contratos[0].certificado.nome_certificado}
                    </p>
                    <p>
                      <strong>Status:</strong> {details.contratos[0].status}
                    </p>

                    <p>
                      <strong>Renovação:</strong>{" "}
                      {formatDate(details.contratos[0].data_renovacao)}
                    </p>

                    <p>
                      <strong>Vencimento:</strong>{" "}
                      {formatDate(details.contratos[0].data_vencimento)}
                    </p>
                  </div>
                )}
                {/* Bloco de Dados do Parceiro  */}
                {details.parceiro_indicador && (
                  <div className={styles.infoBlockFull}>
                    <h4>Parceiro</h4>
                    <p>
                      <strong>Escritório:</strong>{" "}
                      {details.parceiro_indicador.nome_escritorio}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.footerActions}>
            <button
              className={`${styles.actionButton} ${styles.delete}`}
              onClick={handleDelete}
            >
              Remover
            </button>
            <button
              className={`${styles.actionButton} ${styles.update}`}
              onClick={handleAlterar}
              disabled={!details}
            >
              Alterar
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir o cliente "${clientToDelete?.nome}"? Esta ação é irreversível.`}
      />
    </>
  );
};

export default ClientDetailsModal;
