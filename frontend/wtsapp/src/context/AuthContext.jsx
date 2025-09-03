// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Cria o contexto que será compartilhado
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Roda uma vez quando a aplicação carrega para verificar a sessão
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userDataString = sessionStorage.getItem("user");

    if (token && userDataString) {
      setUser(JSON.parse(userDataString));
    }
    // É importante parar o loading mesmo se não houver usuário
    setIsLoading(false);
  }, []);

  // Função de login que será usada pelo LoginModal
  const login = (userData, token) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    navigate("/dashboard");
  };

  // Função de logout que será usada pelos Headers
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
