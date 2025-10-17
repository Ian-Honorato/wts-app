import React, { useState } from "react";
import styles from "./ClientDetailsModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

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
    staleTime: 1000 * 60 * 5,
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

  // Função para determinar a classe CSS com base no status do contrato
  const getContractStatusClass = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "ativo") {
      return styles.active;
    }
    if (statusLower === "vencido" || statusLower === "expirado") {
      return styles.expired;
    }
    if (statusLower === "pendente") {
      return styles.pending;
    }
    return ""; // Classe padrão caso não encontre
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

                {/* Bloco de Contratos com a nova estrutura de lista */}
                <div className={styles.infoBlock}>
                  <h4>Histórico de Contratos</h4>
                  <ul className={styles.contractList}>
                    {details.contratos && details.contratos.length > 0 ? (
                      details.contratos.map((contrato) => (
                        <li
                          key={contrato.id}
                          className={styles.contractItem}
                          onClick={() => handleOpenEditContract(contrato)}
                          title="Clique para editar este contrato"
                        >
                          <div className={styles.contractInfo}>
                            <span>
                              <strong>Nº:</strong> {contrato.numero_contrato}
                            </span>
                            <span>
                              <strong>Vencimento:</strong>{" "}
                              {formatDate(contrato.data_vencimento)}
                            </span>
                          </div>
                          <span
                            className={`${
                              styles.contractLink
                            } ${getContractStatusClass(contrato.status)}`}
                          >
                            {contrato.status}
                          </span>
                        </li>
                      ))
                    ) : (
                      <p className={styles.noContracts}>
                        Nenhum contrato encontrado.
                      </p>
                    )}
                  </ul>
                </div>

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

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir o cliente "${clientToDelete?.nome}"? Esta ação é irreversível.`}
      />

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
