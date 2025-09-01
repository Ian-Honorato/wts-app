import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Componentes
import AdminHeader from "../components/dashboard/adminHeader/AdminHeader.jsx";
import UserHeader from "../components/dashboard/userHeader/UserHeader.jsx";
import ClientModal from "../components/dashboard/clientModal/ClientModal.jsx";
import ListClientsModal from "../components/dashboard/listarClientModal/ListClientsModal.jsx";
import ClientDetailsModal from "../components/dashboard/clientDetailsModal/ClientDetailsModal.jsx";
import ResponseModal from "../components/dashboard/responseModal/ResponseModal.jsx";
import ImportXMLModal from "../components/dashboard/importXMLModal/ImportXMLModal.jsx";
import AdminDashboard from "../components/dashboard/adminDashboard/AdminDashboard.jsx";
import ClientesCriticos from "../components/dashboard/clientesCriticos/ClientesCriticos.jsx";
import UserModal from "../components/userModal/UserModal.jsx";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Estados dos Modais
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isListClientsModalOpen, setIsListClientsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Estados de Dados para os Modais
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [responseModal, setResponseModal] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  // Efeito para verificar autenticação
  useEffect(() => {
    const userDataString = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");

    if (!userDataString || !token) {
      navigate("/");
      return;
    }

    const currentUser = JSON.parse(userDataString);
    setUser(currentUser);

    const fetchData = async () => {
      if (currentUser.tipo_usuario !== "admin") {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Token de autenticação:", token);
        const response = await axios.get(
          "http://localhost:3001/dashboard/sumario",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSummaryData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do sumário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (isLoading || !user) {
    return <div>Verificando autenticação e carregando dados...</div>;
  }

  // Funções de Manipulação (Handlers)
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const handleOpenClientModal = (clientData = null) => {
    setEditingClient(clientData);
    setIsClientModalOpen(true);
  };

  const handleCloseClientModal = () => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleOpenListClientsModal = () => setIsListClientsModalOpen(true);
  const handleOpenImportModal = () => setIsImportModalOpen(true);

  const handleShowClientDetails = (clientId) => {
    setSelectedClientId(clientId);
    setIsDetailsModalOpen(true);
  };

  const showResponseModal = (type, message) => {
    setResponseModal({ isOpen: true, type, message });
  };

  const handleClientSubmitFeedback = (type, message) => {
    handleCloseClientModal();
    setTimeout(() => {
      showResponseModal(type, message);
    }, 300);
  };

  const handleListFeedback = (type, message) => {
    setIsListClientsModalOpen(false);
    setTimeout(() => {
      showResponseModal(type, message);
    }, 300);
  };
  const handleUserModalCreate = (type, message) => {
    setIsUserModalOpen({ isOpen: true, type, message });

    setTimeout(() => {
      showResponseModal(type, message);
    }, 300);
  };
  return (
    <div>
      {user.tipo_usuario === "admin" ? (
        <AdminHeader
          user={user}
          onLogout={handleLogout}
          onOpenClientModal={handleOpenClientModal}
          onOpenListClientsModal={handleOpenListClientsModal}
          onOpenImportModal={handleOpenImportModal}
        />
      ) : (
        <UserHeader user={user} onLogout={handleLogout} />
      )}

      {user.tipo_usuario === "admin" ? (
        <AdminDashboard summaryData={summaryData} />
      ) : (
        <ClientesCriticos />
      )}

      {/* Renderização dos Modais */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={handleCloseClientModal}
        onFeedback={handleClientSubmitFeedback}
        clientToEdit={editingClient}
      />
      <ListClientsModal
        isOpen={isListClientsModalOpen}
        onClose={() => setIsListClientsModalOpen(false)}
        onShowDetails={handleShowClientDetails}
        onOpenUpdateModal={handleOpenClientModal}
        onFeedback={handleListFeedback}
      />
      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        clientId={selectedClientId}
        onOpenUpdateModal={handleOpenClientModal}
      />
      <ImportXMLModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onFeedback={handleClientSubmitFeedback}
      />
      <ResponseModal
        isOpen={responseModal.isOpen}
        onClose={() => setResponseModal({ ...responseModal, isOpen: false })}
        type={responseModal.type}
        message={responseModal.message}
      />
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onFeedback={handleUserModalCreate}
      />
    </div>
  );
};

export default Dashboard;
