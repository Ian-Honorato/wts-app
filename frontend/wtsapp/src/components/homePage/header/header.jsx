import React from "react";
import styles from "./header.module.css";

//ico
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const Header = ({ onLoginClick }) => {
  const handleLoginClick = (e) => {
    e.preventDefault();
    onLoginClick();
  };
  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.brand_container}>
            <a href="#" className={styles.brand}>
              Marca
            </a>
          </div>

          <div className={styles.links_container}>
            <ul className={styles.navMenu}>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">Sobre</a>
              </li>
              <li>
                <a href="#">Contato</a>
              </li>
            </ul>
          </div>

          <div className={styles.login_container}>
            <a
              href="#"
              className={styles.loginIcon}
              title="Login / Acessar conta"
              onClick={handleLoginClick}
            >
              <FontAwesomeIcon icon={faUser} />
            </a>
          </div>

          <button className={styles.menu_button}>Menu</button>
        </nav>
      </header>
    </>
  );
};

export default Header;
