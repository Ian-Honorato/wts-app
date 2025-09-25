import React from "react";
import styles from "./footer.module.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>&copy; {currentYear} Ian Honorato. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
