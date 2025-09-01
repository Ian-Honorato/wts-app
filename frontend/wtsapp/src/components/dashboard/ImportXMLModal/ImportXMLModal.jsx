import React, { useState } from "react";
import axios from "axios";
import styles from "./importXMLModal.module.css";

const ImportXMLModal = ({ isOpen, onClose, onFeedback }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onFeedback("error", "Por favor, selecione um arquivo XML.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("xmlFile", selectedFile); // O nome 'xmlFile' deve bater com o do multer

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/upload/clientes",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { report } = response.data;
      const successMessage = `Importação finalizada! ${report.successCount} clientes importados.`;
      onFeedback("success", successMessage);
    } catch (error) {
      console.error("Erro na importação:", error);
      const errorMessage =
        error.response?.data?.error || "Falha na importação do arquivo.";
      onFeedback("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Importar Clientes via XML</h2>
        <div className={styles.uploadArea}>
          <input
            type="file"
            id="xml-upload"
            accept=".xml,text/xml"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          <label htmlFor="xml-upload" className={styles.fileLabel}>
            {selectedFile
              ? selectedFile.name
              : "Clique para selecionar o arquivo XML"}
          </label>
        </div>
        {isLoading ? (
          <p>Enviando e processando... Por favor, aguarde.</p>
        ) : (
          <button onClick={handleUpload} className={styles.uploadButton}>
            Importar
          </button>
        )}
      </div>
    </div>
  );
};

export default ImportXMLModal;
