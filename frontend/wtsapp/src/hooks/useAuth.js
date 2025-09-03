// src/hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Verificação de segurança para garantir que o hook é usado corretamente
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  // Retorna todos os valores que o AuthProvider forneceu
  return context;
};
