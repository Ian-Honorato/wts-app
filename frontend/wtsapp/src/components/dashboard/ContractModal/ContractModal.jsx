import React, { useState, useEffect } from "react";
import styles from "./ContractModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

// *** CORREÇÃO 1: Importar o hook 'useQueryClient' ***
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateContractMutation,
  useUpdateContractMutation,
} from "../../../hooks/useMutation";
import { extractErrorMessage } from "../../../hooks/util/errorHandler.js";

const statusEnumValidos = [
  "Agendado",
  "Em contato",
  "ESC Agendado",
  "Não vai renovar",
  "Sem dados CNTT",
  "Vence em outro mês",
  "Tickets",
  "Ativo",
  "Não identificado",
  "Renovado",
  "Cancelado",
];
const certificados = [
  "e-CNPJ A1",
  "e-CNPJ A3",
  "e-CNPJ A3 cartão",
  "e-CNPJ A3 token",
  "e-CPF",
  "e-CPF A1",
  "e-CPF A3",
  "e-CPF A3 cartão",
  "e-CPF A3 token",
];

const initialState = {
  numero_contrato: "",
  nome_certificado: "",
  status: "",
  data_renovacao: "",
  data_vencimento: "",
};

const ContractModal = ({
  isOpen,
  onClose,
  contractToEdit,
  clientId,
  onFeedback,
}) => {
  // *** CORREÇÃO 2: Chamar o hook para obter a instância do client ***
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const createContractMutation = useCreateContractMutation();
  const updateContractMutation = useUpdateContractMutation();

  const isUpdateMode = Boolean(contractToEdit);

  useEffect(() => {
    if (isOpen) {
      if (isUpdateMode && contractToEdit) {
        setFormData({
          numero_contrato: contractToEdit.numero_contrato || "",
          nome_certificado: contractToEdit.certificado?.nome_certificado || "",
          status: contractToEdit.status || "",
          data_renovacao: contractToEdit.data_renovacao
            ? new Date(contractToEdit.data_renovacao)
                .toISOString()
                .split("T")[0]
            : "",
          data_vencimento: contractToEdit.data_vencimento
            ? new Date(contractToEdit.data_vencimento)
                .toISOString()
                .split("T")[0]
            : "",
        });
      } else {
        setFormData(initialState);
      }
      setErrors({});
    }
  }, [isOpen, contractToEdit, isUpdateMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // *** CORREÇÃO 3: Implementação da função de validação ***
  const validate = () => {
    const newErrors = {};
    if (!formData.numero_contrato.trim()) {
      newErrors.numero_contrato = "O número do contrato/ticket é obrigatório.";
    }
    if (!formData.status) {
      newErrors.status = "O status é obrigatório.";
    }
    if (!formData.nome_certificado) {
      newErrors.nome_certificado = "O certificado é obrigatório.";
    }
    if (!formData.data_vencimento) {
      newErrors.data_vencimento = "A data de vencimento é obrigatória.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const mutationData = {
      ...formData,
      cliente_id: clientId,
      data_renovacao: formData.data_renovacao || null,
    };

    const mutationCallbacks = (successMessage) => ({
      onSuccess: () => {
        onFeedback("success", successMessage);
        onClose();
        // A lógica de invalidação agora funcionará corretamente
        console.log("Invalidando queries: criticalClients e client details...");
        queryClient.invalidateQueries({ queryKey: ["criticalClients"] });
        queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      },
      onError: (error) => {
        onFeedback("error", extractErrorMessage(error));
        const fieldErrors = error?.response?.data?.errors;
        if (fieldErrors) setErrors(fieldErrors);
      },
    });

    if (isUpdateMode) {
      // Verificação de segurança para o ID
      if (!contractToEdit?.id) {
        onFeedback("error", "Erro fatal: ID do contrato não encontrado.");
        return;
      }
      updateContractMutation.mutate(
        { ...mutationData, id: contractToEdit.id },
        mutationCallbacks("Contrato atualizado com sucesso!")
      );
    } else {
      createContractMutation.mutate(
        mutationData,
        mutationCallbacks("Contrato adicionado com sucesso!")
      );
    }
  };

  const isLoading =
    createContractMutation.isPending || updateContractMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>
            {isUpdateMode ? "Atualizar Contrato" : "Adicionar Novo Contrato"}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="numero_contrato">Nº Contrato / Ticket *</label>
              <input
                type="text"
                id="numero_contrato"
                name="numero_contrato"
                value={formData.numero_contrato}
                onChange={handleChange}
                className={
                  errors.numero_contrato ? styles.inputError : styles.input
                }
              />
              {errors.numero_contrato && (
                <p className={styles.errorMessage}>{errors.numero_contrato}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={errors.status ? styles.inputError : styles.input}
              >
                <option value="" disabled>
                  Selecione um status
                </option>
                {statusEnumValidos.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className={styles.errorMessage}>{errors.status}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="nome_certificado">Certificado *</label>
              <select
                id="nome_certificado"
                name="nome_certificado"
                value={formData.nome_certificado}
                onChange={handleChange}
                className={
                  errors.nome_certificado ? styles.inputError : styles.input
                }
              >
                <option value="" disabled>
                  Selecione um certificado
                </option>
                {certificados.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.nome_certificado && (
                <p className={styles.errorMessage}>{errors.nome_certificado}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="data_renovacao">Data de Renovação</label>
              <input
                type="date"
                id="data_renovacao"
                name="data_renovacao"
                value={formData.data_renovacao}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="data_vencimento">Data de Vencimento *</label>
              <input
                type="date"
                id="data_vencimento"
                name="data_vencimento"
                value={formData.data_vencimento}
                onChange={handleChange}
                className={
                  errors.data_vencimento ? styles.inputError : styles.input
                }
              />
              {errors.data_vencimento && (
                <p className={styles.errorMessage}>{errors.data_vencimento}</p>
              )}
            </div>
          </div>
          <div className={styles.footerActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading
                ? "Salvando..."
                : isUpdateMode
                ? "Salvar Alterações"
                : "Adicionar Contrato"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ContractModal);
