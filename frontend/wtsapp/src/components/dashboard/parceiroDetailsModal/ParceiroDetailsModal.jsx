import React, { useMemo, useState } from "react";
import styles from "./ParceiroDetailsModal.module.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUsers,
  faUser,
  faBuilding,
  faCertificate,
} from "@fortawesome/free-solid-svg-icons";

// --- Helpers (Funções Auxiliares) ---
const formatCPF_CNPJ = (value) => {
  if (!value) return "";
  if (value.length === 11) {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

// --- Componente da Tabela (Reutilizável) ---
const ClientTable = ({ clients }) => (
  <div className={styles.clientTableContainer}>
    {clients.map((client) => (
      <div key={client.id} className={styles.clientRow}>
        <div className={styles.clientHeader}>
          <strong>{client.nome}</strong>
          <span>{formatCPF_CNPJ(client.cpf_cnpj)}</span>
        </div>
        {client.contratos.map((contrato) => (
          <div key={contrato.id} className={styles.contractDetails}>
            <p>
              <FontAwesomeIcon icon={faCertificate} />{" "}
              {contrato.certificado.nome_certificado}
            </p>
            <p>Vencimento: {formatDate(contrato.data_vencimento)}</p>
            <p>Status: {contrato.status}</p>
          </div>
        ))}
      </div>
    ))}
  </div>
);

// --- Componente Principal do Modal ---
const fetchParceiroDetails = async (parceiroId) => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get(`/api/parceiros/${parceiroId}/contratos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const ParceiroDetailsModal = ({ isOpen, onClose, parceiroId }) => {
  const [visibleList, setVisibleList] = useState(null); // 'pf', 'pj', ou null

  const { data, isLoading, isError } = useQuery({
    queryKey: ["parceiroDetails", parceiroId],
    queryFn: () => fetchParceiroDetails(parceiroId),
    enabled: !!parceiroId && isOpen,
  });

  // Usememo para processar os dados apenas quando 'data' mudar
  const processedData = useMemo(() => {
    if (!data) return null;

    const clientesPF = [];
    const clientesPJ = [];
    const contagemCertificados = {};

    data.clientes_indicados.forEach((cliente) => {
      if (cliente.cpf_cnpj && cliente.cpf_cnpj.length === 11) {
        clientesPF.push(cliente);
      } else {
        clientesPJ.push(cliente);
      }
      cliente.contratos.forEach((contrato) => {
        const nomeCert = contrato.certificado.nome_certificado;
        contagemCertificados[nomeCert] =
          (contagemCertificados[nomeCert] || 0) + 1;
      });
    });

    return {
      nomeEscritorio: data.nome_escritorio,
      clientesPF,
      clientesPJ,
      contagemCertificados,
      totalPF: clientesPF.length,
      totalPJ: clientesPJ.length,
      totalClientes: data.clientes_indicados.length,
    };
  }, [data]);

  const handleToggleList = (listType) => {
    setVisibleList((current) => (current === listType ? null : listType));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            Detalhes do Parceiro:{" "}
            <strong>{processedData?.nomeEscritorio || "..."}</strong>
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.detailsContainer}>
          {isLoading && <p>Carregando detalhes...</p>}
          {isError && <p className={styles.error}>Erro ao buscar detalhes.</p>}

          {processedData && (
            <>
              {/* Seção de Resumo (Cards) */}
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <FontAwesomeIcon icon={faUsers} size="2x" />
                  <div>
                    <h3>{processedData.totalClientes}</h3>
                    <p>Total de Clientes</p>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <FontAwesomeIcon icon={faUser} size="2x" />
                  <div>
                    <h3>{processedData.totalPF}</h3>
                    <p>Pessoas Físicas</p>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <FontAwesomeIcon icon={faBuilding} size="2x" />
                  <div>
                    <h3>{processedData.totalPJ}</h3>
                    <p>Pessoas Jurídicas</p>
                  </div>
                </div>
              </div>

              {/* Seção de Certificados */}
              <div className={styles.certificatesSection}>
                <h4>Tipos de Certificados</h4>
                <ul>
                  {Object.entries(processedData.contagemCertificados).map(
                    ([nome, count]) => (
                      <li key={nome}>
                        {nome}: <strong>{count}</strong>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Botões de Toggle */}
              <div className={styles.toggleButtons}>
                <button
                  className={`${styles.toggleButton} ${
                    visibleList === "pf" ? styles.active : ""
                  }`}
                  onClick={() => handleToggleList("pf")}
                >
                  Visualizar Clientes PF ({processedData.totalPF})
                </button>
                <button
                  className={`${styles.toggleButton} ${
                    visibleList === "pj" ? styles.active : ""
                  }`}
                  onClick={() => handleToggleList("pj")}
                >
                  Visualizar Clientes PJ ({processedData.totalPJ})
                </button>
              </div>

              {/* Container para a Lista de Clientes */}
              <div className={styles.clientListWrapper}>
                {visibleList === "pf" && (
                  <ClientTable clients={processedData.clientesPF} />
                )}
                {visibleList === "pj" && (
                  <ClientTable clients={processedData.clientesPJ} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParceiroDetailsModal;
