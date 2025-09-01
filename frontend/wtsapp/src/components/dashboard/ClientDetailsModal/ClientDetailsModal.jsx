import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./clientDetailsModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const ClientDetailsModal = ({
  isOpen,
  onClose,
  clientId,
  onOpenUpdateModal,
}) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Busca os dados apenas se o modal estiver aberto e um ID for fornecido
    if (isOpen && clientId) {
      const fetchClientDetails = async () => {
        setIsLoading(true);
        setError("");
        setDetails(null);
        try {
          const token = sessionStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:3001/clientes/${clientId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setDetails(response.data);
        } catch (err) {
          console.error("Erro ao buscar detalhes do cliente:", err);
          setError("Não foi possível carregar os dados do cliente.");
        }
        setIsLoading(false);
      };
      fetchClientDetails();
    }
  }, [isOpen, clientId]); // Roda o efeito quando o modal abre ou o ID muda

  const handleAlterar = () => {
    onClose(); // Fecha o modal de detalhes
    setTimeout(() => {
      onOpenUpdateModal(details);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Detalhes do Cliente</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.detailsBody}>
          {isLoading && <p>Carregando...</p>}
          {error && <p className={styles.error}>{error}</p>}
          {details && (
            <div className={styles.detailsGrid}>
              {/* Bloco de Dados do Cliente */}
              <div className={styles.infoBlock}>
                <h4>Dados Pessoais</h4>
                <p>
                  <strong>Nome:</strong> {details.nome}
                </p>
                <p>
                  <strong>CPF/CNPJ:</strong> {details.cpf_cnpj}
                </p>
                <p>
                  <strong>Tipo:</strong> {details.tipo_cliente}
                </p>
                <p>
                  <strong>Representante:</strong>{" "}
                  {details.representante || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {details.email || "N/A"}
                </p>
                <p>
                  <strong>Telefone:</strong> {details.telefone}
                </p>
              </div>

              {/* Bloco de Dados do Contrato */}
              {details.contratos && details.contratos[0] && (
                <div className={styles.infoBlock}>
                  <h4>Dados do Contrato</h4>
                  <p>
                    <strong>Nº Contrato:</strong>{" "}
                    {details.contratos[0].numero_contrato}
                  </p>
                  <p>
                    <strong>Certificado:</strong>{" "}
                    {details.contratos[0].certificado.nome_certificado}
                  </p>
                  <p>
                    <strong>Status:</strong> {details.contratos[0].status}
                  </p>
                  <p>
                    <strong>Vencimento:</strong>{" "}
                    {new Date(
                      details.contratos[0].data_vencimento
                    ).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}

              {/* Bloco do Parceiro */}
              {details.parceiro_indicador && (
                <div className={styles.infoBlockFull}>
                  <h4>Parceiro</h4>
                  <p>
                    <strong>Escritório:</strong>{" "}
                    {details.parceiro_indicador.nome_escritorio}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footerActions}>
          <button className={`${styles.actionButton} ${styles.delete}`}>
            Remover
          </button>
          <button
            className={`${styles.actionButton} ${styles.update}`}
            onClick={handleAlterar}
          >
            Alterar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
