import React, { useState } from "react";
import styles from "./ImportXMLModal.module.css";

import { useImportClientMutation } from "../../../hooks/useMutation";

const ImportXMLModal = ({ isOpen, onClose, onFeedback }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const { mutate, isLoading } = useImportClientMutation();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo XML.");
      return;
    }

    const formData = new FormData();
    formData.append("xmlFile", selectedFile);

    mutate(formData, {
      onSuccess: (data) => {
        const { report } = data;
        console.log("Importação concluída:", report);
        const successMessage = `
        Importação finalizada!
          - Total de novos registros: ${report.successCount}
          - Total de registros atualizados: ${report.updateCount}
          - Total de erros: ${report.errorCount}
        `;
        onFeedback("success", successMessage);
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error || "Falha na importação do arquivo.";
        onFeedback("error", errorMessage);
      },
    });
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
            // Desabilita o input durante o upload
            disabled={isLoading}
          />
          <label htmlFor="xml-upload" className={styles.fileLabel}>
            {selectedFile
              ? selectedFile.name
              : "Clique para selecionar o arquivo XML"}
          </label>
        </div>
        {isLoading ? (
          <p className={styles.loadingText}>
            Enviando e processando... Por favor, aguarde.
          </p>
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
