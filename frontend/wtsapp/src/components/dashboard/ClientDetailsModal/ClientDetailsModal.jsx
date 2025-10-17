import React, { useState } from "react";
import styles from "./ClientDetailsModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

// Imports corretos
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ContractModal from "../ContractModal/ContractModal.jsx";

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
  const queryClient = useQueryClient();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState(null);

  const {
    data: details,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => detailsClientApi(clientId),
    enabled: isOpen && !!clientId,
    staleTime: 1000 * 60 * 5, // Opcional: mantém os dados frescos por 5 minutos
  });

  const handleOpenAddContract = () => {
    setContractToEdit(null);
    setIsContractModalOpen(true);
  };

  const handleOpenEditContract = (contract) => {
    setContractToEdit(contract);
    setIsContractModalOpen(true);
  };

  const handleCloseContractModal = () => {
    setIsContractModalOpen(false);

    queryClient.invalidateQueries({ queryKey: ["client", clientId] });
  };

  const handleAlterar = () => {
    onClose(); // Fecha o modal de detalhes
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
        onSuccess: () => onFeedback("success", "Cliente excluído com sucesso!"),
        onError: (error) =>
          onFeedback("error", "Não foi possível excluir o cliente."),
        onSettled: () => {
          setIsConfirmModalOpen(false);
          setClientToDelete(null);
          onClose();
        },
      });
    }
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setClientToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

                {/* Lista de contratos */}
                <div className={styles.infoBlock}>
                  <h4>Contratos</h4>
                  <div className={styles.contractList}>
                    {details.contratos && details.contratos.length > 0 ? (
                      details.contratos.map((contrato) => (
                        <div
                          key={contrato.id}
                          className={styles.contractItem}
                          onClick={() => handleOpenEditContract(contrato)}
                          title="Clique para editar este contrato"
                        >
                          <p>
                            <strong>Nº Contrato:</strong>{" "}
                            {contrato.numero_contrato}
                          </p>
                          <p>
                            <strong>Vencimento:</strong>{" "}
                            {formatDate(contrato.data_vencimento)}
                          </p>
                          <p>
                            <strong>Renovação:</strong>{" "}
                            {formatDate(contrato.data_renovacao)}
                          </p>
                          <span className={styles.statusTag}>
                            {contrato.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noContracts}>
                        Nenhum contrato encontrado.
                      </p>
                    )}
                  </div>
                </div>

                {/* Bloco de Dados do Parceiro */}
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
              disabled={!details}
            >
              Remover Cliente
            </button>
            <button
              className={`${styles.actionButton} ${styles.update}`}
              onClick={handleAlterar}
              disabled={!details}
            >
              Alterar Dados
            </button>
            <button
              className={`${styles.actionButton} ${styles.addContract}`}
              onClick={handleOpenAddContract}
              disabled={!details}
            >
              Adicionar Contrato
            </button>
          </div>
        </div>
      </div>

      {/* Renderiza o ConfirmationModal para deletar o cliente */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir o cliente "${clientToDelete?.nome}"? Esta ação é irreversível.`}
      />

      {/* Renderiza o novo Modal de Contrato */}
      {clientId && (
        <ContractModal
          isOpen={isContractModalOpen}
          onClose={handleCloseContractModal}
          contractToEdit={contractToEdit}
          clientId={clientId}
          onFeedback={onFeedback}
        />
      )}
    </>
  );
};

export default ClientDetailsModal;
