import React, { useState } from "react";
//dependencias
import axios from "axios";
import { useNavigate } from "react-router-dom";
//css
import styles from "./loginModal.module.css";
//icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const LoginModal = ({ isOpen, onClose }) => {
  const default_url = "http://localhost:3001/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //se o modal n estiver aberto, n renderiza nada
  if (!isOpen) {
    return null;
  }
  const hadleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await axios.post(default_url + "usuarios/login", {
        email,
        password,
      });
      const { token, user } = response.data;

      if (token) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        onClose();
        navigate("/dashboard");
      } else {
        setError("Credenciais inválidas. Tente novamente.");
      }
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          setError("Credenciais inválidas. Tente novamente.");
        }
        if (e.response.status === 500) {
          setError("Erro no servidor. Tente novamente mais tarde.");
        }
      } else if (e.request) {
        setError("Erro na requisição. Verifique sua conexão.");
      } else {
        setError("Ocorreu um erro. Tente novamente.");
      }
    }
  };
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Acessar Conta</h2>
        <form className={styles.form} onSubmit={hadleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              className={styles.input}
              placeholder="seu@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              className={styles.input}
              placeholder="Sua senha"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.submitButton}>
            Entrar
          </button>
        </form>
        <button className={styles.closeButton} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
