// src/components/dashboard/listUsersModal/ListUsersModal.jsx
import React from "react";
import modalStyles from "../clientModal/clientModal.module.css"; // Estilo do modal base
import tableStyles from "./tableStyle.module.css"; // Estilo da tabela específica
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

// Hooks de dados e mutação
import {
  useUsersQuery,
  useDeleteUserMutation,
} from "../../../hooks/userMutation";

const ListUsersModal = ({ isOpen, onClose, onOpenEditUserModal }) => {
  // Se o modal não está aberto, não renderizamos nada
  if (!isOpen) return null;

  // Busca os dados dos usuários usando nosso hook personalizado
  const { data: users, isLoading, error, refetch } = useUsersQuery(isOpen);

  // Hook para a mutação de exclusão de usuário
  const deleteMutation = useDeleteUserMutation();

  // Função para lidar com a exclusão de um usuário
  const handleDelete = (userId, userName) => {
    if (
      window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)
    ) {
      deleteMutation.mutate(userId, {
        onSuccess: () => {
          alert("Usuário excluído com sucesso!");
          refetch(); // Opcional: refetch para garantir a atualização imediata da lista
        },
        onError: (mutationError) => {
          const errorMessage =
            mutationError.response?.data?.errors?.[0] ||
            "Erro ao excluir usuário.";
          alert(errorMessage);
        },
      });
    }
  };

  // Função auxiliar para renderizar o conteúdo principal do modal
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={tableStyles.statusMessage}>Carregando usuários...</div>
      );
    }
    if (error) {
      console.error("Erro ao carregar usuários:", error); // Log para debug
      return (
        <div className={tableStyles.statusMessage}>
          Erro ao carregar usuários. Por favor, tente novamente.
        </div>
      );
    }
    if (!users || users.length === 0) {
      return (
        <div className={tableStyles.statusMessage}>
          Nenhum usuário cadastrado no momento.
        </div>
      );
    }

    return (
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.tipo_usuario}</td>
                <td className={tableStyles.actionsCell}>
                  <button
                    className={`${tableStyles.actionButton} ${tableStyles.editButton}`}
                    onClick={() => onOpenEditUserModal(user)} // Passa o objeto user para edição
                    disabled={deleteMutation.isPending} // Desabilita botões durante exclusão
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                    onClick={() => handleDelete(user.id, user.nome)}
                    disabled={deleteMutation.isPending} // Desabilita botões durante exclusão
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
  );
};

export default ListUsersModal;
