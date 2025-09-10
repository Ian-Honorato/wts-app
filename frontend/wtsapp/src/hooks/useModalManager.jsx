import { useState } from "react";

export function useModalManager() {
  const [modalState, setModalState] = useState({
    isClientModalOpen: false,
    isListClientsModalOpen: false,
    isDetailsModalOpen: false,
    isImportModalOpen: false,
    isUserModalOpen: false,
    isListUsersModalOpen: false,
    editingUser: null,
    selectedClientId: null,
    editingClient: null,
    responseModal: { isOpen: false, type: "", message: "" },
  });

  const modalHandlers = {
    openUserModal: (userData = null) => {
      setModalState((prev) => ({
        ...prev,
        editingUser: userData,
        isUserModalOpen: true,
      }));
    },
    openListUsersModal: () => {
      setModalState((prev) => ({
        ...prev,
        isListUsersModalOpen: true,
      }));
    },
    closeListUsersModal: () => {
      setModalState((prev) => ({
        ...prev,
        isListUsersModalOpen: false,
      }));
    },
    closeUserModal: () =>
      setModalState((prev) => ({
        ...prev,
        isUserModalOpen: false,
        editingUser: null, // Limpa o usuário ao fechar
      })),

    openClientModal: (clientData = null) =>
      setModalState((prev) => ({
        ...prev,
        editingClient: clientData,
        isClientModalOpen: true,
      })),
    closeClientModal: () =>
      setModalState((prev) => ({
        ...prev,
        isClientModalOpen: false,
        editingClient: null,
      })),
    openListClientsModal: () =>
      setModalState((prev) => ({ ...prev, isListClientsModalOpen: true })),
    closeListClientsModal: () =>
      setModalState((prev) => ({ ...prev, isListClientsModalOpen: false })),
    showClientDetails: (clientId) =>
      setModalState((prev) => ({
        ...prev,
        selectedClientId: clientId,
        isDetailsModalOpen: true,
      })),
    closeDetailsModal: () =>
      setModalState((prev) => ({
        ...prev,
        isDetailsModalOpen: false,
        selectedClientId: null,
      })),
    openImportModal: () =>
      setModalState((prev) => ({ ...prev, isImportModalOpen: true })),
    closeImportModal: () =>
      setModalState((prev) => ({ ...prev, isImportModalOpen: false })),
    showResponseModal: (type, message) =>
      setModalState((prev) => ({
        ...prev,
        responseModal: { isOpen: true, type, message },
      })),
    closeResponseModal: () =>
      setModalState((prev) => ({
        ...prev,
        responseModal: { ...prev.responseModal, isOpen: false },
      })),
    closeAll: () =>
      setModalState((prev) => ({
        ...prev,
        isClientModalOpen: false,
        isListClientsModalOpen: false,
        isDetailsModalOpen: false,
        isImportModalOpen: false,
        isUserModalOpen: false,
        isListUsersModalOpen: false,
      })),
  };

  return { modalState, modalHandlers };
}
