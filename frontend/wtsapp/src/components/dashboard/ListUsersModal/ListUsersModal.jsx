// src/components/dashboard/listUsersModal/ListUsersModal.jsx
import React, { useState } from "react";
import modalStyles from "../clientModal/clientModal.module.css";
import tableStyles from "./tableStyle.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

import {
  useUsersQuery,
  useDeleteUserMutation,
} from "../../../hooks/userMutation";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

const ListUsersModal = ({
  isOpen,
  onClose,
  onOpenEditUserModal, // A prop para editar é esta
  onFeedback,
}) => {
  // --- HOOKS E ESTADOS ---
  const { data: users, isLoading, error } = useUsersQuery(isOpen);
  const deleteMutation = useDeleteUserMutation();

  // -> CORREÇÃO 2: Declarar os estados que faltavam
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // --- HANDLERS ---
  const handleOpenDeleteConfirmation = (user) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        onFeedback(
          "success",
          `Usuário "${userToDelete.nome}" excluído com sucesso!`
        );
      },
      onError: (mutationError) => {
        const errorMessage =
          mutationError.response?.data?.errors?.[0] ||
          "Erro ao excluir usuário.";
        onFeedback("error", errorMessage);
      },
      onSettled: () => {
        setIsConfirmModalOpen(false);
        setUserToDelete(null);
      },
    });
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setUserToDelete(null);
  };

  if (!isOpen) return null;

  // Função auxiliar para renderizar o conteúdo principal
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={tableStyles.statusMessage}>Carregando usuários...</div>
      );
    }
    if (error) {
      return (
        <div className={tableStyles.statusMessage}>
          Erro ao carregar usuários.
        </div>
      );
    }
    if (!users || users.length === 0) {
      return (
        <div className={tableStyles.statusMessage}>
          Nenhum usuário cadastrado.
        </div>
      );
    }

    return (
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>{/* ... cabeçalho da tabela ... */}</thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.tipo_usuario}</td>
                <td className={tableStyles.actionsCell}>
                  <button
                    className={`${tableStyles.actionButton} ${tableStyles.editButton}`}
                    onClick={() => onOpenEditUserModal(user)}
                    disabled={deleteMutation.isPending}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                    // -> CORREÇÃO 3: Chamar a função correta para abrir o modal
                    onClick={() => handleOpenDeleteConfirmation(user)}
                    disabled={deleteMutation.isPending}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className={modalStyles.backdrop} onClick={onClose}>
        <div
          className={modalStyles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className={modalStyles.title}>Gerenciar Usuários</h2>
          {renderContent()}
          <button className={modalStyles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão de Usuário"
        message={`Você tem certeza que deseja excluir o usuário "${userToDelete?.nome}"?`}
      />
    </>
  );
};

export default ListUsersModal;
