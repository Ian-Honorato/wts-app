import React, { useState, useEffect } from "react";
import styles from "./clientModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useQueryClient } from "@tanstack/react-query";

//hooks
import {
  useUpdateClientMutation,
  useCreateClientMutation,
} from "../../../hooks/useMutation";

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

const ClientModal = ({ isOpen, onClose, onFeedback, clientToEdit }) => {
  const queryClient = useQueryClient();
  // Estado inicial com todos os campos do formulário
  const [formData, setFormData] = useState({
    nome_cliente: "",
    cpf_cnpj: "",
    representante: "",
    email_cliente: "",
    telefone: "",
    nome_parceiro: "",
    nome_certificado: "",
    numero_contrato: "",
    data_renovacao: "",
    data_vencimento: "",
    status: "",
  });
  const [errors, setErrors] = useState({});

  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation();

  const isUpdateMode = Boolean(clientToEdit);

  useEffect(() => {
    if (isOpen) {
      if (isUpdateMode) {
        setFormData({
          nome_cliente: clientToEdit.nome,
          cpf_cnpj: clientToEdit.cpf_cnpj,
          representante: clientToEdit.representante || "",
          email_cliente: clientToEdit.email || "",
          telefone: clientToEdit.telefone,
          nome_parceiro: clientToEdit.parceiro_indicador?.nome_escritorio || "",
          nome_certificado:
            clientToEdit.contratos?.[0]?.certificado.nome_certificado || "",
          numero_contrato: clientToEdit.contratos?.[0]?.numero_contrato || "",
          // Lógica de formatação já está correta
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
        setFormData({
          nome_cliente: "",
          cpf_cnpj: "",
          representante: "",
          email_cliente: "",
          telefone: "",
          nome_parceiro: "",
          nome_certificado: "",
          numero_contrato: "",
          data_renovacao: "",
          data_vencimento: "",
          status: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, clientToEdit, isUpdateMode]);

  const validate = () => {
    //console.log("Validando dados do formulário:", formData);
    const newErrors = {};
    if (!formData.nome_cliente)
      newErrors.nome_cliente = "O nome do cliente é obrigatório.";
    if (!formData.cpf_cnpj) newErrors.cpf_cnpj = "O CPF/CNPJ é obrigatório.";
    if (!formData.telefone) newErrors.telefone = "O telefone é obrigatório.";
    if (!formData.status) newErrors.status = "O status é obrigatório.";
    if (!formData.nome_parceiro)
      newErrors.nome_parceiro = "O nome do parceiro é obrigatório.";
    if (!formData.nome_certificado)
      newErrors.nome_certificado = "O nome do certificado é obrigatório.";
    if (!formData.numero_contrato)
      newErrors.numero_contrato = "O número do contrato é obrigatório.";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const mutationData = {
      ...formData,

      data_renovacao: formData.data_renovacao || null,
      data_vencimento: formData.data_vencimento || null,
    };

    if (isUpdateMode) {
      updateMutation.mutate(
        { ...mutationData, id: clientToEdit.id },
        {
          onSuccess: () => {
            onFeedback("success", "Cliente atualizado com sucesso!");
            onClose();
            queryClient.invalidateQueries({ queryKey: ["clients"] });
          },
          onError: (error) => {
            const errorMessage =
              error.details.message || "Erro ao atualizar o cliente.";
            onFeedback(errorMessage, "error");
          },
        }
      );
    } else {
      createMutation.mutate(mutationData, {
        onSuccess: () => {
          onFeedback("success", "Cliente cadastrado com sucesso!");
          onClose();
          queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: (error) => {
          const errorMessage =
            error.details.message || "Erro ao cadastrar o cliente.";
          onFeedback(errorMessage, "error");
        },
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isLoading || updateMutation.isLoading;
  const apiError = createMutation.error || updateMutation.error;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {isUpdateMode ? "Atualizar Cliente" : "Cadastrar Novo Cliente"}
        </h2>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            {/* Campos existentes... (Nome, CPF/CNPJ, etc.) */}
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
              <label htmlFor="telefone">Telefone *</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.telefone && (
                <p className={styles.errorMessage}>{errors.telefone}</p>
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

          {apiError && <p className={styles.apiErrorMessage}>{apiError}</p>}
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
