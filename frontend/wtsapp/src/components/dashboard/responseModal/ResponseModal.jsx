import React from "react";
import styles from "./responseModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const ResponseModal = ({ isOpen, onClose, type, message }) => {
  if (!isOpen) {
    return null;
  }

  const isSuccess = type === "success";
  const icon = isSuccess ? faCheckCircle : faTimesCircle;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${
          isSuccess ? styles.success : styles.error
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <FontAwesomeIcon icon={icon} className={styles.icon} />
        <p className={styles.message}>{message}</p>
        <button className={styles.closeButton} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default ResponseModal;
