// src/pages/Dashboard.jsx
import React from "react";

// Hooks
import { useAuth } from "../hooks/useAuth";
import { useModalManager } from "../hooks/useModalManager";
import { useDashboardData } from "../hooks/useDashboardData";

// Componentes
import AdminHeader from "../components/dashboard/adminHeader/AdminHeader.jsx";
import UserHeader from "../components/dashboard/userHeader/UserHeader.jsx";
import AdminDashboard from "../components/dashboard/adminDashboard/AdminDashboard.jsx";
import ClientesCriticos from "../components/dashboard/clientesCriticos/clientesCriticos.jsx";

// Modais
import ClientModal from "../components/dashboard/clientModal/ClientModal.jsx";
import ListClientsModal from "../components/dashboard/listarClientModal/ListClientsModal.jsx";
import ClientDetailsModal from "../components/dashboard/clientDetailsModal/ClientDetailsModal.jsx";
import ResponseModal from "../components/dashboard/responseModal/ResponseModal.jsx";
import ImportXMLModal from "../components/dashboard/importXMLModal/ImportXMLModal.jsx";
import UserModal from "../components/dashboard/userModal/UserModal.jsx";
import ListUsersModal from "../components/dashboard/ListUsersModal/ListUsersModal.jsx";

const Dashboard = () => {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { modalState, modalHandlers } = useModalManager();
  const {
    summaryData,
    criticalClients,
    isDataLoading,
    criticalPeriod,
    setCriticalPeriod,
  } = useDashboardData(user);

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
      {user.tipo_usuario === "admin" ? (
        <AdminHeader
          user={user}
          onLogout={logout} // Vem do useAuth
          onOpenClientModal={modalHandlers.openClientModal}
          onOpenListClientsModal={modalHandlers.openListClientsModal}
          onOpenImportModal={modalHandlers.openImportModal}
          onOpenUserModal={modalHandlers.openUserModal}
          onOpenListUserModal={modalHandlers.openListUsersModal}
        />
      ) : (
        <UserHeader user={user} onLogout={logout} />
      )}

      <div style={{ padding: "2rem", backgroundColor: "#f4f7f6" }}>
        {user.tipo_usuario === "admin" ? (
          <AdminDashboard
            summaryData={summaryData}
            criticalClientsData={{
              clients: criticalClients,
              isLoading: isDataLoading,
              period: criticalPeriod,
              setPeriod: setCriticalPeriod,
            }}
          />
        ) : (
          <ClientesCriticos
            clients={criticalClients}
            isLoading={isDataLoading}
            period={criticalPeriod}
            setPeriod={setCriticalPeriod}
          />
        )}
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
        clientToEdit={modalState.editingUser}
      />
      <ListUsersModal
        isOpen={modalState.isListUsersModalOpen}
        onClose={modalHandlers.closeListUsersModal}
        handleListarUserClick={(userData) => {
          modalHandlers.closeListUsersModal();
          setTimeout(() => modalHandlers.openUserModal(userData), 300);
        }}
      />
      <ResponseModal
        isOpen={modalState.responseModal.isOpen}
        onClose={modalHandlers.closeResponseModal}
        type={modalState.responseModal.type}
        message={modalState.responseModal.message}
      />
    </div>
  );
};

export default Dashboard;
