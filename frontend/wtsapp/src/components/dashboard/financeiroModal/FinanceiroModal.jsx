import React, { useState } from "react";
import styles from "./financeiroModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

// Hooks
import {
  useFetchParceiros,
  useCertificadosPendentes,
} from "../../../hooks/useFinanceiroMutation";

// Componentes Filhos
import ListaParceiros from "./ListaParceiros";
import DetalhesParceiro from "./DetalhesParceiro";

const FinanceiroModal = ({ isOpen, onClose }) => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [parceiroSelecionado, setParceiroSelecionado] = useState(null);

  // Busca a lista de parceiros para a primeira tela
  const { data: parceiros, isLoading: isLoadingParceiros } =
    useFetchParceiros(mes);

  // Busca os detalhes do parceiro selecionado (só executa quando um parceiro é selecionado)
  const { data: certificadosData, isLoading: isLoadingCertificados } =
    useCertificadosPendentes(mes, parceiroSelecionado?.id);

  const handleSelecionarParceiro = (parceiro) => {
    setParceiroSelecionado(parceiro);
  };

  const handleVoltar = () => {
    setParceiroSelecionado(null);
  };

  const handleMesChange = (e) => {
    setMes(Number(e.target.value));
    setParceiroSelecionado(null); // Reseta a visão ao trocar o mês
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {parceiroSelecionado && (
            <button onClick={handleVoltar} className={styles.backButton}>
              &larr; Voltar
            </button>
          )}
          <h2>
            {parceiroSelecionado
              ? `Comissão: ${parceiroSelecionado.nome_escritorio}`
              : "Financeiro - Parceiros"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Lógica de alternância de visualização */}
          {parceiroSelecionado ? (
            <DetalhesParceiro
              certificadosData={certificadosData}
              isLoading={isLoadingCertificados}
            />
          ) : (
            <ListaParceiros
              parceiros={parceiros}
              isLoading={isLoadingParceiros}
              mes={mes}
              onMesChange={handleMesChange}
              onParceiroSelect={handleSelecionarParceiro}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceiroModal;
