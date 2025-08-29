import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Componentes
import AdminHeader from "../components/dashboard/adminHeader/AdminHeader.jsx";
import UserHeader from "../components/dashboard/userHeader/UserHeader.jsx";
import ClientModal from "../components/dashboard/clientModal/ClientModal.jsx";
import ResponseModal from "../components/dashboard/responseModal/ResponseModal.jsx";
import ListClientsModal from "../components/dashboard/listarClientModal/ListClientsModal.jsx";
import ClientDetailsModal from "../components/dashboard/clientDetailsModal/ClientDetailsModal.jsx";
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isListClientsModalOpen, setIsListClientsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const handleOpenListClientsModal = () => setIsListClientsModalOpen(true);

  const [responseModal, setResponseModal] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  const showResponseModal = (type, message) => {
    setResponseModal({ isOpen: true, type, message });
  };
  const handleClientSubmitFeedback = (type, message) => {
    setIsClientModalOpen(false);
    setTimeout(() => {
      showResponseModal(type, message);
    }, 300);
  };
  useEffect(() => {
    const userDataString = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");

    if (!userDataString || !token) {
      navigate("/");
      return;
    }

    setUser(JSON.parse(userDataString));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const handleOpenClientModal = () => {
    setIsClientModalOpen(true);
  };
  const handleShowClientDetails = (clientId) => {
    setSelectedClientId(clientId); // Guarda o ID do cliente a ser exibido
    setIsDetailsModalOpen(true); // Abre o modal de detalhes
  };

  if (!user) {
    return <div>Verificando autenticação...</div>;
  }

  return (
    <div>
      {user.tipo_usuario === "admin" ? (
        <AdminHeader
          user={user}
          onLogout={handleLogout}
          onOpenClientModal={handleOpenClientModal}
          onOpenListClientsModal={handleOpenListClientsModal}
        />
      ) : (
        <UserHeader user={user} onLogout={handleLogout} />
      )}
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>Dashboard</h1>
        <p>Seu conteúdo exclusivo está aqui.</p>
        <button onClick={handleLogout}>Sair</button>
      </div>
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onFeedback={handleClientSubmitFeedback}
      />

      <ResponseModal
        isOpen={responseModal.isOpen}
        onClose={() => setResponseModal({ ...responseModal, isOpen: false })}
        type={responseModal.type}
        message={responseModal.message}
      />
      <ListClientsModal
        isOpen={isListClientsModalOpen}
        onClose={() => setIsListClientsModalOpen(false)}
        onShowDetails={handleShowClientDetails}
      />
      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        clientId={selectedClientId}
      />
    </div>
  );
};

export default Dashboard;
