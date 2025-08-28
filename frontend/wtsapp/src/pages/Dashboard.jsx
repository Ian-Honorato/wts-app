import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Crie estes componentes de header distintos
// import AdminHeader from '../components/dashboard/AdminHeader';
// import UserHeader from '../components/dashboard/UserHeader';

// --- Placeholders para os Headers ---
const AdminHeader = ({ user }) => (
  <header style={{ background: "crimson", color: "white", padding: "1rem" }}>
    Header do Administrador: {user.name}
  </header>
);
const UserHeader = ({ user }) => (
  <header style={{ background: "#333", color: "white", padding: "1rem" }}>
    Header do Usuário: {user.name}
  </header>
);
// ------------------------------------

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  if (!user) {
    return <div>Verificando autenticação...</div>;
  }

  return (
    <div>
      {/* Renderização Condicional do Header */}
      {user.role === "admin" ? (
        <AdminHeader user={user} />
      ) : (
        <UserHeader user={user} />
      )}

      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>Dashboard</h1>
        <p>Seu conteúdo exclusivo está aqui.</p>
        <button onClick={handleLogout}>Sair</button>
      </div>
    </div>
  );
};

export default Dashboard;
