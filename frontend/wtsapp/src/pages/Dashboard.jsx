import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Crie estes componentes de header distintos
import AdminHeader from "../components/dashboard/adminHeader/AdminHeader.jsx";
import UserHeader from "../components/dashboard/userHeader/UserHeader.jsx";

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
      {user.tipo_usuario === "admin" ? (
        <AdminHeader user={user} onLogout={handleLogout} />
      ) : (
        <UserHeader user={user} onLogout={handleLogout} />
      )}

      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>Dashboard</h1>
        <p>conteúdo exclusivo está aqui.</p>
        <p>{}</p>
        <button onClick={handleLogout}>Sair</button>
      </div>
    </div>
  );
};

export default Dashboard;
