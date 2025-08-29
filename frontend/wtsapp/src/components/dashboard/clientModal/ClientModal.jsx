import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./clientModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

// Lista de status vinda do seu backend para o campo de seleção
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
  "e-CNPJ",
  "e-CNPJ A3",
  "e-CNPJ A3 cartão",
  "e-CNPJ A3 token",
  "e-CPF",
  "e-CPF A1",
  "e-CPF A3",
  "e-CPF A3 cartão",
  "e-CPF A3 token",
];

const ClientModal = ({ isOpen, onClose, onFeedback }) => {
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
    data_vencimento: "",
    status: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // Limpa o formulário quando o modal é fechado/reaberto
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome_cliente: "",
        cpf_cnpj: "",
        representante: "",
        email_cliente: "",
        telefone: "",
        nome_parceiro: "",
        nome_certificado: "",
        numero_contrato: "",
        data_vencimento: "",
        status: "",
      });
      setErrors({});
      setApiError("");
    }
  }, [isOpen]);

  const validate = () => {
    console.log("Validando dados do formulário:", formData);
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
    setApiError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/clientes/cadastrar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      //Testando retornos da API
      console.log("retorno completo:", response);
      console.log("Status:", response.status);
      console.log("Data:", response.data);

      onFeedback("success", "Cliente cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro ao cadastrar cliente:", err);
      if (err.response) {
        let errorMessage = "Não foi possível cadastrar o cliente.";
        // Erros de validação (400) ou conflito (409)
        const message = err.response.data.details
          ? err.response.data.details.join(", ")
          : err.response.data.error;
        setApiError(message || "Não foi possível cadastrar o cliente.");
        onFeedback("error", errorMessage);
      } else {
        setApiError("Erro de conexão. Tente novamente.");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {" "}
      {/* Clicando no overlay para fechar */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Cadastrar Novo Cliente</h2>
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

            {/* Campos opcionais */}
            <div className={styles.formGroup}>
              <label htmlFor="data_vencimento">
                Data de Vencimento (DD/MM/AAAA)
              </label>
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
          <button type="submit" className={styles.submitButton}>
            Cadastrar Cliente
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
