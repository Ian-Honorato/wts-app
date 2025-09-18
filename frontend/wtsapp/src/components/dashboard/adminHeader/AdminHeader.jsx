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
  onOpenImportModal,
  onOpenUserModal,
  onOpenListUserModal,
  onOpenParceiroModal,
  onOpenListParceiroModal,
  onOpenFinanceiroModal,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleCadastrarUserClick = (e) => {
    e.preventDefault();
    toggleSidebar();
    onOpenUserModal();
  };

  const handleListarUserClick = (e) => {
    e.preventDefault();
    toggleSidebar();
    onOpenListUserModal();
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
  const handleImportClick = (e) => {
    e.preventDefault();
    toggleSidebar();
    onOpenImportModal();
  };
  const handleCadastrarParceiro = (e) => {
    e.preventDefault();
    toggleSidebar();
    onOpenParceiroModal();
  };
  const handleListarParceiro = (e) => {
    e.preventDefault();
    toggleSidebar();
    onOpenListParceiroModal();
  };

  const handleOpenFinanceiro = (e) => {
    e.preventDefault();
    toggleSidebar();
    onOpenFinanceiroModal();
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
                    <a href="#" onClick={handleImportClick}>
                      Importar
                    </a>
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
                    <a href="#" onClick={handleCadastrarParceiro}>
                      Cadastrar
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={handleListarParceiro}>
                      Listar
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={handleOpenFinanceiro}>
                      Financeiro
                    </a>
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
                    <a href="#" onClick={handleCadastrarUserClick}>
                      Cadastrar
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={handleListarUserClick}>
                      Listar
                    </a>
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
