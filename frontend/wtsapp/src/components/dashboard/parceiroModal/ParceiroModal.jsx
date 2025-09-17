import React, { useState, useEffect } from "react";
import styles from "./parceiroModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  useAddParceiroMutation,
  useUpdateParceiroMutation,
} from "../../../hooks/useParceiroMutation.js";

// 1. RECEBER A PROP 'editingParceiro'
const ParceiroModal = ({ isOpen, onClose, onFeedback, editingParceiro }) => {
  const [nomeEscritorio, setNomeEscritorio] = useState("");
  const [error, setError] = useState("");

  const createMutation = useAddParceiroMutation();
  const updateMutation = useUpdateParceiroMutation();

  const isEditing = !!editingParceiro;

  //console.log("é edição:", isEditing);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setNomeEscritorio(editingParceiro.nome_escritorio);
      } else {
        setNomeEscritorio("");
      }
      setError("");
    }
  }, [isOpen, editingParceiro, isEditing]);
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!nomeEscritorio.trim()) {
      setError("Por favor, preencha o nome do escritório.");
      return;
    }
    const mutationOptions = {
      onSuccess: () => {
        onFeedback(
          "success",
          `Parceiro ${isEditing ? "atualizado" : "cadastrado"} com sucesso!`
        );
        onClose();
      },
      onError: (error) => {
        const apiError = error.response?.data?.errors?.[0];
        onFeedback(
          "error",
          apiError ||
            `Não foi possível ${
              isEditing ? "atualizar" : "cadastrar"
            } o parceiro.`
        );
      },
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: editingParceiro.id, data: { nome_escritorio: nomeEscritorio } },
        mutationOptions
      );
    } else {
      createMutation.mutate(
        { nome_escritorio: nomeEscritorio },
        mutationOptions
      );
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {/* 5. TÍTULO E BOTÃO DINÂMICOS */}
          <h2>{isEditing ? "Editar Parceiro" : "Cadastrar Novo Parceiro"}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="nome_escritorio">Nome do Escritório</label>
            <input
              id="nome_escritorio"
              type="text"
              value={nomeEscritorio}
              onChange={(e) => setNomeEscritorio(e.target.value)}
              placeholder="Digite o nome do escritório parceiro"
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading
              ? "Salvando..."
              : isEditing
              ? "Atualizar Parceiro"
              : "Salvar Parceiro"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParceiroModal;
