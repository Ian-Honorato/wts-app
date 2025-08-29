// src/components/dashboard/adminHeader/AdminHeader.jsx
import React, { useState } from "react";
import styles from "./adminHeader.module.css";
import logo from "../../../assets/logo.png";

// Ícones
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faSignOutAlt,
  faUsers,
  faHandshake,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";

const AdminHeader = ({
  user,
  onLogout,
  onOpenClientModal,
  onOpenListClientsModal,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleCadastrarClienteClick = (e) => {
    e.preventDefault();
    toggleSidebar();
    onOpenClientModal();
  };

  const handleListarClienteClick = (e) => {
    e.preventDefault();
    toggleSidebar();
    onOpenListClientsModal();
  };

  return (
    <>
      {isSidebarOpen && (
        <div className={styles.backdrop} onClick={toggleSidebar}></div>
      )}

      <header className={styles.adminHeader}>
        <div className={styles.container}>
          <a href="/dashboard" className={styles.brand}>
            <img src={logo} alt="Logo" className={styles.logoImage} />
            <span>Painel Administrador</span>
          </a>

          <div className={styles.rightIcons}>
            <button
              onClick={onLogout}
              className={styles.iconButton}
              title="Sair"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
            <button
              onClick={toggleSidebar}
              className={styles.iconButton}
              title="Menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>
      </header>

      <aside
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <h3>Menu</h3>
          <button onClick={toggleSidebar} className={styles.iconButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <p>Olá {user.nome}</p>
          <ul>
            <li>
              <details>
                <summary>
                  <FontAwesomeIcon icon={faUsers} className={styles.menuIcon} />
                  Clientes
                </summary>
                <ul>
                  <li>
                    <a href="#" onClick={handleCadastrarClienteClick}>
                      Cadastrar
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={handleListarClienteClick}>
                      Listar
                    </a>
                  </li>
                  <li>
                    <a href="#">Importar</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>
                  <FontAwesomeIcon
                    icon={faHandshake}
                    className={styles.menuIcon}
                  />
                  Parceiros
                </summary>
                <ul>
                  <li>
                    <a href="#">Listar</a>
                  </li>
                  <li>
                    <a href="#">Financeiro</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className={styles.menuIcon}
                  />
                  Usuários
                </summary>
                <ul>
                  <li>
                    <a href="#">Cadastrar</a>
                  </li>
                  <li>
                    <a href="#">Listar</a>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};
export default AdminHeader;
