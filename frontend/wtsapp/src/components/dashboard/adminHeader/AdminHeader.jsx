// src/components/dashboard/adminHeader/AdminHeader.jsx
import React, { useState } from "react";
import styles from "./adminHeader.module.css";
import logo from "../../../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faSignOutAlt,
  faUsers,
  faHandshake,
  faUserCircle,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

// Componente reutilizável para o menu de navegação
const NavigationMenu = ({ user, handlers }) => (
  <nav className={styles.mainNav}>
    <ul>
      <li>
        <details>
          <summary>
            <FontAwesomeIcon icon={faUsers} className={styles.menuIcon} />
            Clientes
          </summary>
          <ul>
            <li>
              <a href="#" onClick={handlers.handleCadastrarClienteClick}>
                Cadastrar
              </a>
            </li>
            <li>
              <a href="#" onClick={handlers.handleListarClienteClick}>
                Listar
              </a>
            </li>
            <li>
              <a href="#" onClick={handlers.handleImportClick}>
                Importar
              </a>
            </li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>
            <FontAwesomeIcon icon={faHandshake} className={styles.menuIcon} />
            Parceiros
          </summary>
          <ul>
            <li>
              <a href="#" onClick={handlers.handleCadastrarParceiro}>
                Cadastrar
              </a>
            </li>
            <li>
              <a href="#" onClick={handlers.handleListarParceiro}>
                Listar
              </a>
            </li>
          </ul>
        </details>
      </li>
      {user && user.tipo_usuario === "admin" && (
        <li>
          <details>
            <summary>
              <FontAwesomeIcon
                icon={faDollarSign}
                className={styles.menuIcon}
              />
              Financeiro
            </summary>
            <ul>
              <li>
                <a href="#" onClick={handlers.handleOpenFinanceiro}>
                  Cadastrar pagamento
                </a>
              </li>
              <li>
                <a href="#" onClick={handlers.handleOpenListarFinanceiro}>
                  Apontamentos
                </a>
              </li>
            </ul>
          </details>
        </li>
      )}
      <li>
        <details>
          <summary>
            <FontAwesomeIcon icon={faUserCircle} className={styles.menuIcon} />
            Usuários
          </summary>
          <ul>
            <li>
              <a href="#" onClick={handlers.handleCadastrarUserClick}>
                Cadastrar
              </a>
            </li>
            <li>
              <a href="#" onClick={handlers.handleListarUserClick}>
                Listar
              </a>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </nav>
);

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
  onOpenListarFianceiroModal,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Agrupando os handlers para passar para o componente de navegação
  const navHandlers = {
    handleCadastrarUserClick: (e) => {
      e.preventDefault();
      onOpenUserModal();
    },
    handleListarUserClick: (e) => {
      e.preventDefault();
      onOpenListUserModal();
    },
    handleCadastrarClienteClick: (e) => {
      e.preventDefault();
      onOpenClientModal();
    },
    handleListarClienteClick: (e) => {
      e.preventDefault();
      onOpenListClientsModal();
    },
    handleImportClick: (e) => {
      e.preventDefault();
      onOpenImportModal();
    },
    handleCadastrarParceiro: (e) => {
      e.preventDefault();
      onOpenParceiroModal();
    },
    handleListarParceiro: (e) => {
      e.preventDefault();
      onOpenListParceiroModal();
    },
    handleOpenFinanceiro: (e) => {
      e.preventDefault();
      onOpenFinanceiroModal();
    },
    handleOpenListarFinanceiro: (e) => {
      e.preventDefault();
      onOpenListarFianceiroModal();
    },
  };

  // Handlers para a sidebar (que precisam fechar o menu)
  const sidebarHandlers = Object.keys(navHandlers).reduce((acc, key) => {
    acc[key] = (e) => {
      navHandlers[key](e);
      toggleSidebar();
    };
    return acc;
  }, {});

  return (
    <>
      {isSidebarOpen && (
        <div className={styles.backdrop} onClick={toggleSidebar}></div>
      )}

      <header className={styles.adminHeader}>
        <div className={styles.container}>
          <a href="/" className={styles.brand}>
            <img src={logo} alt="Logo" className={styles.logoImage} />
            <span>Painel Administrador</span>
          </a>

          {/* NAVEGAÇÃO PARA DESKTOP (escondida em mobile) */}
          <div className={styles.desktopNav}>
            <NavigationMenu user={user} handlers={navHandlers} />
          </div>

          <div className={styles.rightIcons}>
            <button
              onClick={onLogout}
              className={styles.iconButton}
              title="Sair"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
            {/* BOTÃO HAMBÚRGUER (escondido em desktop) */}
            <button
              onClick={toggleSidebar}
              className={`${styles.iconButton} ${styles.menuButton}`}
              title="Menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR PARA MOBILE */}
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
        <div className={styles.sidebarNavContent}>
          <p>Olá {user.nome}</p>
          <NavigationMenu user={user} handlers={sidebarHandlers} />
        </div>
      </aside>
    </>
  );
};

export default AdminHeader;
