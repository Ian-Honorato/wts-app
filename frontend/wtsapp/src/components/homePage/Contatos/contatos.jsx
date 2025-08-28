import React from "react";
// Importe o seu arquivo de estilos
import styles from "./contatos.module.css";

// ícones
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"; // Ícone de marca

const Contatos = () => {
  return (
    <section className={styles.contactSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Entre em Contato</h2>

        <div className={styles.contentWrapper}>
          {/* Coluna da Esquerda: Mapa */}
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14841.001142568648!2d-49.75841604149026!3d-21.57608129916668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9493f0b2fed55555%3A0x4a8755498e9a4198!2sLins%2C%20SP!5e0!3m2!1spt-BR!2sbr!4v1724781015181!5m2!1spt-BR!2sbr"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização do Escritório"
            ></iframe>
          </div>

          {/* Coluna da Direita: Informações */}
          <div className={styles.infoContainer}>
            <p className={styles.infoText}>
              Estamos prontos para atender você. Escolha o melhor canal de
              comunicação abaixo.
            </p>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                {/* 2. Use os ícones */}
                <FontAwesomeIcon
                  icon={faPhone}
                  className={styles.contactIcon}
                />
                <div>
                  <strong>Telefone Fixo:</strong>
                  <br />
                  <a href="tel:+551433334444" className={styles.contactLink}>
                    (14) 3333-4444
                  </a>
                </div>
              </li>
              <li className={styles.contactItem}>
                <FontAwesomeIcon
                  icon={faWhatsapp}
                  className={styles.contactIcon}
                />
                <div>
                  <strong>WhatsApp:</strong>
                  <br />
                  <a
                    href="https://wa.me/5514999998888"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    (14) 99999-8888
                  </a>
                </div>
              </li>
              <li className={styles.contactItem}>
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className={styles.contactIcon}
                />
                <div>
                  <strong>E-mail:</strong>
                  <br />
                  <a
                    href="mailto:contato@suacontabilidade.com"
                    className={styles.contactLink}
                  >
                    contato@suacontabilidade.com
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contatos;
