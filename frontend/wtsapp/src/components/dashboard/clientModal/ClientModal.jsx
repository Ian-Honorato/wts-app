import React, { useState, useEffect, useCallback } from "react";
import styles from "./clientModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useQueryClient } from "@tanstack/react-query";

// Hooks
import {
  useUpdateClientMutation,
  useCreateClientMutation,
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
  nome_cliente: "",
  cpf_cnpj: "",
  representante: "",
  email_cliente: "",
  ddi: "55",
  ddd: "",
  telefoneNumero: "",
  nome_parceiro: "",
  nome_certificado: "",
  numero_contrato: "",
  data_renovacao: "",
  data_vencimento: "",
  status: "",
};

const ClientModal = ({ isOpen, onClose, onFeedback, clientToEdit }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation();

  const isUpdateMode = Boolean(clientToEdit);

  useEffect(() => {
    if (isOpen) {
      if (isUpdateMode && clientToEdit) {
        let ddi = "55",
          ddd = "",
          telefoneNumero = "";
        const fullPhone = clientToEdit.telefone || "";
        if (fullPhone.length >= 12) {
          ddi = fullPhone.substring(0, 2);
          ddd = fullPhone.substring(2, 4);
          telefoneNumero = fullPhone.substring(4);
        }
        setFormData({
          nome_cliente: clientToEdit.nome,
          cpf_cnpj: clientToEdit.cpf_cnpj,
          representante: clientToEdit.representante || "",
          email_cliente: clientToEdit.email || "",
          ddi,
          ddd,
          telefoneNumero,
          nome_parceiro: clientToEdit.parceiro_indicador?.nome_escritorio || "",
          nome_certificado:
            clientToEdit.contratos?.[0]?.certificado.nome_certificado || "",
          numero_contrato: clientToEdit.contratos?.[0]?.numero_contrato || "",
          data_renovacao: clientToEdit.contratos?.[0]?.data_renovacao
            ? new Date(clientToEdit.contratos[0].data_renovacao)
                .toISOString()
                .split("T")[0]
            : "",
          data_vencimento: clientToEdit.contratos?.[0]?.data_vencimento
            ? new Date(clientToEdit.contratos[0].data_vencimento)
                .toISOString()
                .split("T")[0]
            : "",
          status: clientToEdit.contratos?.[0]?.status || "",
        });
      } else {
        setFormData(initialState);
      }

      // A lógica de reset foi movida para DENTRO do if(isOpen)
      setErrors({});
      createMutation.reset();
      updateMutation.reset();
    }
  }, [isOpen, clientToEdit]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.nome_cliente)
      newErrors.nome_cliente = "O nome do cliente é obrigatório.";
    if (!formData.cpf_cnpj) newErrors.cpf_cnpj = "O CPF/CNPJ é obrigatório.";
    if (!formData.ddi || !formData.ddd || !formData.telefoneNumero) {
      newErrors.telefone = "O telefone completo é obrigatório.";
    } else if (formData.telefoneNumero.length < 8) {
      newErrors.telefone = "O número de telefone parece curto demais.";
    }
    if (!formData.status) newErrors.status = "O status é obrigatório.";
    if (!formData.nome_parceiro)
      newErrors.nome_parceiro = "O nome do parceiro é obrigatório.";
    if (!formData.nome_certificado)
      newErrors.nome_certificado = "O nome do certificado é obrigatório.";
    if (!formData.numero_contrato)
      newErrors.numero_contrato = "O número do contrato é obrigatório.";
    if (
      formData.email_cliente &&
      !/\S+@\S+\.\S+/.test(formData.email_cliente)
    ) {
      newErrors.email_cliente = "O formato do e-mail é inválido.";
    }
    return newErrors;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["ddi", "ddd", "telefoneNumero"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value.replace(/[^0-9]/g, ""),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const getMutationCallbacks = (successMessage) => ({
    onSuccess: () => {
      onFeedback("success", successMessage);
      onClose();
    },
    onError: (error) => {
      onFeedback("error", extractErrorMessage(error));
      const fieldErrors = error?.response?.data?.errors;
      if (fieldErrors && Array.isArray(fieldErrors)) {
        const newErrors = {};
        fieldErrors.forEach((err) => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const telefoneCompleto = `${formData.ddi}${formData.ddd}${formData.telefoneNumero}`;
    const mutationData = {
      ...formData,
      telefone: telefoneCompleto,
      data_renovacao: formData.data_renovacao || null,
      data_vencimento: formData.data_vencimento || null,
    };
    delete mutationData.ddi;
    delete mutationData.ddd;
    delete mutationData.telefoneNumero;

    if (isUpdateMode) {
      updateMutation.mutate(
        { ...mutationData, id: clientToEdit.id },
        getMutationCallbacks("Cliente atualizado com sucesso!")
      );
    } else {
      createMutation.mutate(
        mutationData,
        getMutationCallbacks("Cliente cadastrado com sucesso!")
      );
    }
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {isUpdateMode ? "Atualizar Cliente" : "Cadastrar Novo Cliente"}
        </h2>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="nome_cliente">Nome / Razão Social *</label>
              <input
                type="text"
                id="nome_cliente"
                name="nome_cliente"
                value={formData.nome_cliente}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.nome_cliente && (
                <p className={styles.errorMessage}>{errors.nome_cliente}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cpf_cnpj">CPF / CNPJ *</label>
              <input
                type="text"
                id="cpf_cnpj"
                name="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.cpf_cnpj && (
                <p className={styles.errorMessage}>{errors.cpf_cnpj}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Telefone *</label>
              <div className={styles.phoneInputGroup}>
                <input
                  type="text"
                  name="ddi"
                  placeholder="55"
                  value={formData.ddi}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.phoneDDI}`}
                  maxLength="2"
                />
                <input
                  type="text"
                  name="ddd"
                  placeholder="DDD"
                  value={formData.ddd}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.phoneDDD}`}
                  maxLength="2"
                />
                <input
                  type="text"
                  name="telefoneNumero"
                  placeholder="Número"
                  value={formData.telefoneNumero}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.phoneNumber}`}
                  maxLength="9"
                />
              </div>
              {errors.telefone && (
                <p className={styles.errorMessage}>{errors.telefone}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email_cliente">E-mail</label>
              <input
                type="email"
                id="email_cliente"
                name="email_cliente"
                value={formData.email_cliente}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.email_cliente && (
                <p className={styles.errorMessage}>{errors.email_cliente}</p>
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
                {statusEnumValidos.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className={styles.errorMessage}>{errors.status}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nome_parceiro">Nome do Parceiro *</label>
              <input
                type="text"
                id="nome_parceiro"
                name="nome_parceiro"
                value={formData.nome_parceiro}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.nome_parceiro && (
                <p className={styles.errorMessage}>{errors.nome_parceiro}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nome_certificado">Nome do Certificado *</label>
              <select
                id="nome_certificado"
                name="nome_certificado"
                value={formData.nome_certificado}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="" disabled>
                  Selecione um Certificado
                </option>
                {certificados.map((certificado) => (
                  <option key={certificado} value={certificado}>
                    {certificado}
                  </option>
                ))}
              </select>
              {errors.nome_certificado && (
                <p className={styles.errorMessage}>{errors.nome_certificado}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="numero_contrato">Ticket *</label>
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
              <label htmlFor="data_vencimento">Data de Vencimento</label>
              <input
                type="date"
                id="data_vencimento"
                name="data_vencimento"
                value={formData.data_vencimento}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="representante">Representante</label>
              <input
                type="text"
                id="representante"
                name="representante"
                value={formData.representante}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading
              ? "Salvando..."
              : isUpdateMode
              ? "Salvar Alterações"
              : "Cadastrar Cliente"}
          </button>
        </form>
        <button className={styles.closeButton} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default ClientModal;
