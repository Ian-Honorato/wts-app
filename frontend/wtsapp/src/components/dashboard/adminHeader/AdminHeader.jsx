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

// --- Componente de Navegação para MOBILE (com <details>) ---
const MobileNavigation = ({ user, handlers }) => (
  <nav className={styles.mobileNav}>
    <ul>
      <li>
        <details>
          <summary>
            <FontAwesomeIcon icon={faUsers} className={styles.menuIcon} />{" "}
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
            <FontAwesomeIcon icon={faHandshake} className={styles.menuIcon} />{" "}
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
              />{" "}
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
            <FontAwesomeIcon icon={faUserCircle} className={styles.menuIcon} />{" "}
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

// --- Componente de Navegação para DESKTOP (com <li> e hover) ---
const DesktopNavigation = ({ user, handlers }) => (
  <nav className={styles.desktopNav}>
    <ul>
      <li>
        <div className={styles.navItem}>Clientes</div>
        <ul className={styles.dropdownMenu}>
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
      </li>
      <li>
        <div className={styles.navItem}>Parceiros</div>
        <ul className={styles.dropdownMenu}>
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
      </li>
      {user && user.tipo_usuario === "admin" && (
        <li>
          <div className={styles.navItem}>Financeiro</div>
          <ul className={styles.dropdownMenu}>
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
        </li>
      )}
      <li>
        <div className={styles.navItem}>Usuários</div>
        <ul className={styles.dropdownMenu}>
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
      </li>
    </ul>
  </nav>
);

const AdminHeader = ({ user, onLogout, ...props }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Handlers para Desktop (não fecham o menu)
  const navHandlers = {
    handleCadastrarUserClick: (e) => {
      e.preventDefault();
      props.onOpenUserModal();
    },
    handleListarUserClick: (e) => {
      e.preventDefault();
      props.onOpenListUserModal();
    },
    handleCadastrarClienteClick: (e) => {
      e.preventDefault();
      props.onOpenClientModal();
    },
    handleListarClienteClick: (e) => {
      e.preventDefault();
      props.onOpenListClientsModal();
    },
    handleImportClick: (e) => {
      e.preventDefault();
      props.onOpenImportModal();
    },
    handleCadastrarParceiro: (e) => {
      e.preventDefault();
      props.onOpenParceiroModal();
    },
    handleListarParceiro: (e) => {
      e.preventDefault();
      props.onOpenListParceiroModal();
    },
    handleOpenFinanceiro: (e) => {
      e.preventDefault();
      props.onOpenFinanceiroModal();
    },
    handleOpenListarFinanceiro: (e) => {
      e.preventDefault();
      props.onOpenListarFianceiroModal();
    },
  };

  // Handlers para Sidebar (fecham o menu após o clique)
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

          {/* NAVEGAÇÃO DESKTOP: Renderizada aqui, mas visível apenas em telas grandes via CSS */}
          <DesktopNavigation user={user} handlers={navHandlers} />

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
          {/* NAVEGAÇÃO MOBILE: Renderizada dentro da sidebar */}
          <MobileNavigation user={user} handlers={sidebarHandlers} />
        </div>
      </aside>
    </>
  );
};

export default AdminHeader;
