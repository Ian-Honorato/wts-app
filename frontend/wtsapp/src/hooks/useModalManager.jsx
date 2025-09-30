import { useState } from "react";

export function useModalManager() {
  const [modalState, setModalState] = useState({
    // Flags de visibilidade de modais
    isClientModalOpen: false,
    isListClientsModalOpen: false,
    isDetailsModalOpen: false,
    isImportModalOpen: false,
    isUserModalOpen: false,
    isListUsersModalOpen: false,
    isParceiroModalOpen: false,
    isListParceirosModalOpen: false,
    isParceiroDetailsModalOpen: false,
    isFinanceiroModalOpen: false,
    isFinanceiroListarModalOpen: false,
    responseModal: { isOpen: false, type: "", message: "" },

    // Dados para os modais
    editingUser: null,
    editingClient: null,
    editingParceiro: null,
    selectedClientId: null,
    selectedParceiroId: null,
  });

  const modalHandlers = {
    // --- Handlers de Usuário ---
    openUserModal: (userData = null) => {
      setModalState((prev) => ({
        ...prev,
        editingUser: userData,
        isUserModalOpen: true,
      }));
    },
    closeUserModal: () =>
      setModalState((prev) => ({
        ...prev,
        isUserModalOpen: false,
        editingUser: null,
      })),
    openListUsersModal: () => {
      setModalState((prev) => ({ ...prev, isListUsersModalOpen: true }));
    },
    closeListUsersModal: () => {
      setModalState((prev) => ({ ...prev, isListUsersModalOpen: false }));
    },

    // --- Handlers de Cliente ---
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

    // --- Handlers de Parceiro ---
    openParceiroModal: (parceiroData = null) => {
      if (modalState.isListParceirosModalOpen) {
        setModalState((prev) => ({ ...prev, isListParceirosModalOpen: false }));
        setTimeout(() => {
          setModalState((prev) => ({
            ...prev,
            editingParceiro: parceiroData,
            isParceiroModalOpen: true,
          }));
        }, 300);
      } else {
        setModalState((prev) => ({
          ...prev,
          editingParceiro: parceiroData,
          isParceiroModalOpen: true,
        }));
      }
    },

    closeParceiroModal: () =>
      setModalState((prev) => ({
        ...prev,
        isParceiroModalOpen: false,
        editingParceiro: null,
      })),
    openListParceirosModal: () =>
      setModalState((prev) => ({ ...prev, isListParceirosModalOpen: true })),
    closeListParceirosModal: () =>
      setModalState((prev) => ({ ...prev, isListParceirosModalOpen: false })),
    openParceiroDetails: (parceiroId) => {
      if (modalState.isListParceirosModalOpen) {
        setModalState((prev) => ({ ...prev, isListParceirosModalOpen: false }));
        setTimeout(() => {
          setModalState((prev) => ({
            ...prev,
            selectedParceiroId: parceiroId,
            isParceiroDetailsModalOpen: true,
          }));
        }, 300);
      } else {
        setModalState((prev) => ({
          ...prev,
          selectedParceiroId: parceiroId,
          isParceiroDetailsModalOpen: true,
        }));
      }
    },
    closeParceiroDetails: () =>
      setModalState((prev) => ({
        ...prev,
        isParceiroDetailsModalOpen: false,
        selectedParceiroId: null,
      })),
    // --- Handlers de Financeiro ---
    openFinanceiroListarModal: () =>
      setModalState((prev) => ({ ...prev, isFinanceiroListarModalOpen: true })),

    closeFinanceiroListarModal: () =>
      setModalState((prev) => ({
        ...prev,
        isFinanceiroListarModalOpen: false,
      })),
    openFinanceiroModal: () =>
      setModalState((prev) => ({ ...prev, isFinanceiroModalOpen: true })),
    closeFinanceiroModal: () =>
      setModalState((prev) => ({ ...prev, isFinanceiroModalOpen: false })),

    // --- Handlers Gerais ---
    openImportModal: () =>
      setModalState((prev) => ({ ...prev, isImportModalOpen: true })),
    closeImportModal: () =>
      setModalState((prev) => ({ ...prev, isImportModalOpen: false })),

    showResponseModal: (type, message) =>
      setModalState((prev) => ({
        ...prev,
        responseModal: { isOpen: true, type, message: String(message || "") },
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
        isParceiroModalOpen: false,
        isListParceirosModalOpen: false,
        isParceiroDetailsModalOpen: false,
        isFinanceiroModalOpen: false,
      })),
  };

  return { modalState, modalHandlers };
}
