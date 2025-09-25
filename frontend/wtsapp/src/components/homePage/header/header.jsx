import React, { useState } from "react";
import styles from "./header.module.css";

//ico
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
//logo
import logo from "../../../assets/logo.png";
const Header = ({ onLoginClick, onUserIconClick }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLoginClick = (e) => {
    console.log("acionou o botao");
    e.preventDefault();
    setIsSidebarOpen(false);
    onLoginClick();
  };

  return (
    <>
      {isSidebarOpen && (
        <div className={styles.backdrop} onClick={toggleSidebar}></div>
      )}

      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.brand_container}>
            <img src={logo} alt="Logo da Marca" className={styles.logoImage} />
            <a href="#" className={styles.brand}>
              ValideJá
            </a>
          </div>

          <div className={styles.links_container_desktop}>
            <ul className={styles.navMenu}>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#servicos">Serviços</a>
              </li>
              <li>
                <a href="#contatos">Contato</a>
              </li>
            </ul>
          </div>
          <div className={styles.login_container_desktop}>
            <a
              href="#"
              className={styles.loginIcon}
              title="Login / Acessar conta"
              onClick={onUserIconClick}
            >
              <FontAwesomeIcon icon={faUser} />
            </a>
          </div>

          <div className={styles.icons_container_mobile}>
            <a
              href="#"
              className={styles.loginIcon}
              title="Login / Acessar conta"
              onClick={handleLoginClick}
            >
              <FontAwesomeIcon icon={faUser} />
            </a>
            <button className={styles.menu_button} onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </nav>
      </header>

      <nav
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <button className={styles.closeButton} onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <ul className={styles.sidebarMenu}>
          <li>
            <a href="#" onClick={toggleSidebar}>
              Home
            </a>
          </li>
          <li>
            <a href="#servicos" onClick={toggleSidebar}>
              Serviços
            </a>
          </li>
          <li>
            <a href="#contatos" onClick={toggleSidebar}>
              Contato
            </a>
          </li>
        </ul>
        <div className={styles.sidebarLogin}>
          <a
            href="#"
            className={styles.loginIcon}
            title="Login"
            onClick={handleLoginClick}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Acessar Conta</span>
          </a>
        </div>
      </nav>
    </>
  );
};

export default Header;
