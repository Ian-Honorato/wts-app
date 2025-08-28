import React from "react";
import styles from "./serviceModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const ServiceModal = ({ isOpen, onClose, serviceData }) => {
  // Não renderiza nada se não estiver aberto ou se não tiver dados
  if (!isOpen || !serviceData) {
    return null;
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.serviceTitle}>{serviceData.title}</h2>
        <p className={styles.serviceDescription}>{serviceData.description}</p>
        <p>Aqui poderíamos adicionar mais detalhes.</p>
        <button className={styles.closeButton} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default ServiceModal;
