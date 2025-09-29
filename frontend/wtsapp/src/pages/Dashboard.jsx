// src/pages/Dashboard.jsx
import React from "react";

// Hooks
import { useAuth } from "../hooks/useAuth";
import { useModalManager } from "../hooks/useModalManager";
import { useDashboardData } from "../hooks/useDashboardData";

// Componentes
import AdminHeader from "../components/dashboard/adminHeader/AdminHeader.jsx";

import AdminDashboard from "../components/dashboard/adminDashboard/AdminDashboard.jsx";
import ClientesCriticos from "../components/dashboard/clientesCriticos/ClientesCriticos.jsx";

// Modais
import ClientModal from "../components/dashboard/clientModal/ClientModal.jsx";
import ListClientsModal from "../components/dashboard/listarClientModal/ListClientsModal.jsx";
import ClientDetailsModal from "../components/dashboard/ClientDetailsModal/ClientDetailsModal.jsx";
import ResponseModal from "../components/dashboard/responseModal/ResponseModal.jsx";
import ImportXMLModal from "../components/dashboard/ImportXMLModal/ImportXMLModal.jsx";
import UserModal from "../components/dashboard/userModal/UserModal.jsx";
import ListUsersModal from "../components/dashboard/ListUsersModal/ListUsersModal.jsx";
import ParceiroModal from "../components/dashboard/parceiroModal/ParceiroModal.jsx";
import ListParceirosModal from "../components/dashboard/listParceirosModal/ListParceirosModal.jsx";
import ParceiroDetailsModal from "../components/dashboard/parceiroDetailsModal/ParceiroDetailsModal.jsx";
import FinanceiroModal from "../components/dashboard/financeiroModal/FinanceiroModal.jsx";
import FinanceiroListarModal from "../components/dashboard/financeiroListarModal/FinanceiroListarModal.jsx";
const Dashboard = () => {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { modalState, modalHandlers } = useModalManager();
  const {
    sumarioData,
    criticalClients,
    isDataLoading,
    criticalPeriod,
    setCriticalPeriod,
    filters,
    setFilters,
    handleSearch,
    renovationsData,
  } = useDashboardData(user);
  //console.log("sumarioData", sumarioData);
  const handleSubmitFeedback = (type, message) => {
    modalHandlers.closeAll();
    setTimeout(() => {
      modalHandlers.showResponseModal(type, message);
    }, 300);
  };

  if (isAuthLoading || !user) {
    return <div>Verificando autenticação...</div>;
  }

  return (
    <div>
      <AdminHeader
        user={user}
        onLogout={logout} // Vem do useAuth
        onOpenClientModal={modalHandlers.openClientModal}
        onOpenListClientsModal={modalHandlers.openListClientsModal}
        onOpenImportModal={modalHandlers.openImportModal}
        onOpenUserModal={modalHandlers.openUserModal}
        onOpenListUserModal={modalHandlers.openListUsersModal}
        onOpenParceiroModal={modalHandlers.openParceiroModal}
        onOpenListParceiroModal={modalHandlers.openListParceirosModal}
        onOpenFinanceiroModal={modalHandlers.openFinanceiroModal}
        onOpenListarFianceiroModal={modalHandlers.openFinanceiroListarModal}
      />

      <div style={{ padding: "2rem", backgroundColor: "#f4f7f6" }}>
        <AdminDashboard
          summaryData={sumarioData}
          criticalClientsData={{
            clients: criticalClients,
            isLoading: isDataLoading,
            period: criticalPeriod,
            setPeriod: setCriticalPeriod,
          }}
          renovationsData={renovationsData}
          filters={filters}
          setFilters={setFilters}
          handleSearch={handleSearch}
        />
      </div>

      <ClientModal
        isOpen={modalState.isClientModalOpen}
        onClose={modalHandlers.closeClientModal}
        onFeedback={handleSubmitFeedback}
        clientToEdit={modalState.editingClient}
      />
      <ListClientsModal
        isOpen={modalState.isListClientsModalOpen}
        onClose={modalHandlers.closeListClientsModal}
        onShowDetails={modalHandlers.showClientDetails}
        onOpenUpdateModal={modalHandlers.openClientModal}
        onFeedback={handleSubmitFeedback}
      />
      <ClientDetailsModal
        isOpen={modalState.isDetailsModalOpen}
        onClose={modalHandlers.closeDetailsModal}
        clientId={modalState.selectedClientId}
        onFeedback={handleSubmitFeedback}
        onOpenUpdateModal={modalHandlers.openClientModal}
      />
      <ImportXMLModal
        isOpen={modalState.isImportModalOpen}
        onClose={modalHandlers.closeImportModal}
        onFeedback={handleSubmitFeedback}
      />
      <UserModal
        isOpen={modalState.isUserModalOpen}
        onClose={modalHandlers.closeUserModal}
        onFeedback={handleSubmitFeedback}
        userToEdit={modalState.editingUser}
      />
      <ListUsersModal
        isOpen={modalState.isListUsersModalOpen}
        onClose={modalHandlers.closeListUsersModal}
        onFeedback={handleSubmitFeedback}
        onOpenEditUserModal={(userData) => {
          //modalHandlers.closeListUsersModal();
          setTimeout(() => modalHandlers.openUserModal(userData), 300);
        }}
      />
      <ResponseModal
        isOpen={modalState.responseModal.isOpen}
        onClose={modalHandlers.closeResponseModal}
        type={modalState.responseModal.type}
        message={modalState.responseModal.message}
      />
      <ParceiroModal
        isOpen={modalState.isParceiroModalOpen}
        onClose={modalHandlers.closeParceiroModal}
        onFeedback={handleSubmitFeedback}
        editingParceiro={modalState.editingParceiro}
      />
      <ListParceirosModal
        isOpen={modalState.isListParceirosModalOpen}
        onClose={modalHandlers.closeListParceirosModal}
        onShowDetails={modalHandlers.openParceiroDetails}
        onOpenUpdateModal={modalHandlers.openParceiroModal}
        onFeedback={handleSubmitFeedback}
      />
      <ParceiroDetailsModal
        isOpen={modalState.isParceiroDetailsModalOpen}
        onClose={modalHandlers.closeParceiroDetails}
        parceiroId={modalState.selectedParceiroId}
        onShowDetails={modalHandlers.openParceiroDetails}
        onOpenUpdateModal={modalHandlers.openParceiroModal}
      />
      <FinanceiroModal
        isOpen={modalState.isFinanceiroModalOpen}
        onOpenFinanceiroModal={modalHandlers.openFinanceiroModal}
        onClose={modalHandlers.closeFinanceiroModal}
        onFeedback={handleSubmitFeedback}
      />
      <FinanceiroListarModal
        isOpen={modalState.isFinanceiroListarModalOpen}
        onOpenFinanceiroListarModal={modalState.openFinandeiroListarModal}
        onClose={modalHandlers.closeFinanceiroListarModal}
        onFeedback={handleSubmitFeedback}
      />
    </div>
  );
};

export default Dashboard;
