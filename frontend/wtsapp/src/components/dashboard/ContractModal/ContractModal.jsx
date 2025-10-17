import React, { useState, useEffect } from "react";
import styles from "./ContractModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

// *** CORREÇÃO 1: Importar os hooks de mutação e o error handler ***
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
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  // Instanciando os hooks de mutação
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
  }, [isOpen, contractToEdit, isUpdateMode]); // *** CORREÇÃO 2: Adicionada a dependência 'isUpdateMode' ***

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    /* ... (sua função de validação está correta) ... */
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

    const getMutationCallbacks = (successMessage) => ({
      onSuccess: () => {
        onFeedback("success", successMessage);
        onClose();
      },
      onError: (error) => {
        onFeedback("error", extractErrorMessage(error));
        const fieldErrors = error?.response?.data?.errors;
        if (fieldErrors) setErrors(fieldErrors);
      },
    });

    if (isUpdateMode) {
      updateContractMutation.mutate(
        { ...mutationData, id: contractToEdit.id },
        getMutationCallbacks("Contrato atualizado com sucesso!")
      );
    } else {
      createContractMutation.mutate(
        mutationData,
        getMutationCallbacks("Contrato adicionado com sucesso!")
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
              {/* *** CORREÇÃO 3: Adicionado o onChange *** */}
              <input
                type="text"
                id="numero_contrato"
                name="numero_contrato"
                value={formData.numero_contrato}
                onChange={handleChange}
                className={styles.input}
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
                className={styles.input}
              >
                <option value="" disabled>
                  Selecione um status
                </option>
                {/* *** CORREÇÃO 4: Usando o .map para gerar as options *** */}
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
                className={styles.input}
              >
                <option value="" disabled>
                  Selecione um certificado
                </option>
                {/* *** CORREÇÃO 5: Usando o .map para gerar as options *** */}
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
            <div className={styles.formGroup}></div>
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
                className={styles.input}
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
