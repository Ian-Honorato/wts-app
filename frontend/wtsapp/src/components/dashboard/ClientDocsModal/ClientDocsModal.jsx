import React, { useState } from "react";
import styles from "./ClientDocsModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes, // Ícone para fechar
  faSpinner, // Ícone de carregamento
  faTrash, // Ícone de lixeira
  faDownload, // Ícone de download/visualização
  faFilePdf, // Ícone para PDF
  faFileImage, // Ícone para Imagem
  faFileAlt, // Ícone genérico de arquivo
  faUpload, // Ícone de upload (no botão)
} from "@fortawesome/free-solid-svg-icons";

// Importa os hooks que você criou
import {
  useClientDocs,
  useAddClientDocMutation,
  useDeleteClientDocMutation,
} from "../../../hooks/useDocMutations";

import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal"; // Importa o modal de confirmação

const ClientDocsModal = ({
  isOpen,
  onClose,
  clientId,
  clienteNome,
  onFeedback, // Recebe a função de feedback
}) => {
  const queryClient = useQueryClient();

  // --- Estados Locais ---
  const [arquivo, setArquivo] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null); // Para o modal de confirmação

  // --- React Query Hooks ---

  // 1. Hook para BUSCAR documentos (useQuery)
  const {
    data: documentos = [], // Garante que 'documentos' seja sempre um array
    isLoading,
    error,
  } = useClientDocs(clientId, isOpen);

  // 2. Hook para ADICIONAR documentos (useMutation)
  const addDocMutation = useAddClientDocMutation();

  // 3. Hook para DELETAR documentos (useMutation)
  const deleteDocMutation = useDeleteClientDocMutation();

  // --- Handlers ---

  const handleFileChange = (e) => {
    setArquivo(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!arquivo) return;

    const formData = new FormData();
    formData.append("arquivo", arquivo); // 'arquivo' deve bater com o docsUpload.single("arquivo")

    addDocMutation.mutate(
      { clienteId, formData },
      {
        onSuccess: () => {
          onFeedback("success", "Documento enviado com sucesso!");
          setArquivo(null); // Limpa o input
          e.target.reset(); // Limpa o formulário
          // A invalidação do query [clientDocs] já está no hook
        },
        onError: () => {
          onFeedback("error", "Falha no upload. Verifique o tipo/tamanho.");
        },
      }
    );
  };

  // Abre o modal de confirmação
  const handleDeleteClick = (documento) => {
    setDocToDelete(documento);
  };

  // Confirma a exclusão
  const handleConfirmDelete = () => {
    if (!docToDelete) return;

    deleteDocMutation.mutate(docToDelete.id, {
      onSuccess: () => {
        onFeedback("success", "Documento excluído com sucesso.");
        // Invalida o cache específico deste cliente (melhor que invalidar tudo)
        queryClient.invalidateQueries({ queryKey: ["clientDocs", clientId] });
        setDocToDelete(null); // Fecha o modal de confirmação
      },
      onError: () => {
        onFeedback("error", "Não foi possível excluir o documento.");
        setDocToDelete(null);
      },
    });
  };

  /**
   * Monta a URL para visualização/download.
   * Usamos um link relativo para /files/... que é a rota estática
   * definida no seu app.js.
   */
  const getFileUrl = (caminho) => {
    // Ex: /files/documentos_clientes/abc-contrato.pdf
    return `/files/documentos_clientes/${caminho}`;
  };

  // Helper para mostrar o ícone correto com base no nome do arquivo
  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".pdf")) {
      return faFilePdf;
    }
    if (fileName.match(/\.(jpeg|jpg|png|gif)$/i)) {
      return faFileImage;
    }
    return faFileAlt;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2>Documentos de: {clienteNome}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.modalBody}>
            {/* --- Seção de Upload --- */}
            <div className={styles.uploadSection}>
              <h4>Adicionar Novo Documento</h4>
              <form className={styles.uploadForm} onSubmit={handleUpload}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  required
                />
                <button
                  type="submit"
                  className={styles.uploadButton}
                  disabled={!arquivo || addDocMutation.isPending}
                >
                  {addDocMutation.isPending ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUpload} /> Enviar
                    </>
                  )}
                </button>
              </form>
              <p className={styles.uploadHint}>
                Permitidos: PDF, JPG, PNG (Máx 5MB).
              </p>
            </div>

            {/* --- Seção da Lista de Documentos --- */}
            <div className={styles.listSection}>
              <h4>Documentos Salvos</h4>
              {isLoading && (
                <p className={styles.loading}>
                  <FontAwesomeIcon icon={faSpinner} spin /> Carregando...
                </p>
              )}
              {error && (
                <p className={styles.error}>Erro ao carregar documentos.</p>
              )}
              {!isLoading && !error && documentos.length === 0 && (
                <p className={styles.noDocs}>Nenhum documento encontrado.</p>
              )}

              <ul className={styles.docList}>
                {documentos.map((doc) => (
                  <li key={doc.id} className={styles.docItem}>
                    <FontAwesomeIcon
                      icon={getFileIcon(doc.nome_arquivo)}
                      className={styles.docIcon}
                    />
                    <span className={styles.docName} title={doc.nome_arquivo}>
                      {doc.nome_arquivo}
                    </span>
                    <div className={styles.docActions}>
                      <a
                        href={getFileUrl(doc.caminho_do_arquivo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionButton}
                        title="Visualizar / Baixar"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </a>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDeleteClick(doc)}
                        title="Excluir"
                        disabled={deleteDocMutation.isPending}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modal de Confirmação --- */}
      <ConfirmationModal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir o documento "${docToDelete?.nome_arquivo}"?`}
      />
    </>
  );
};

export default ClientDocsModal;
