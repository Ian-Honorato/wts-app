import React, { useState } from "react";
import styles from "./loginModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function hadleLogin(e) {
    e.preventDefault();
    console.log(email, password);
  }
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
