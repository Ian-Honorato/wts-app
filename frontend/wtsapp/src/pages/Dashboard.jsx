import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Componentes
import AdminHeader from "../components/dashboard/adminHeader/AdminHeader.jsx";
import UserHeader from "../components/dashboard/userHeader/UserHeader.jsx";
import ClientModal from "../components/dashboard/clientModal/ClientModal.jsx";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

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
      />
    </div>
  );
};

export default Dashboard;
