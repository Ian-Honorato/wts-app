import React, { useState, useEffect } from "react";
import styles from "../clientModal/clientModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { useAuth } from "../../../hooks/useAuth";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../hooks/userMutation";

const UserModal = ({ isOpen, onClose, onFeedback, userToEdit }) => {
  // Hook para pegar o usuário logado e verificar suas permissões
  const { user: loggedInUser } = useAuth();

  // Estado inicial para os campos do formulário de usuário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo_usuario: "user", // Padrão é 'user' para novos cadastros
  });
  const [errors, setErrors] = useState({});

  // Hooks de mutação para criar e atualizar usuários
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const isUpdateMode = Boolean(userToEdit);

  // Efeito para carregar ou limpar o formulário
  useEffect(() => {
    if (isOpen) {
      if (isUpdateMode) {
        // Modo de edição: preenche o formulário com dados do usuário
        setFormData({
          nome: userToEdit.nome || "",
          email: userToEdit.email || "",
          senha: "", // Deixamos a senha vazia por segurança
          tipo_usuario: userToEdit.tipo_usuario || "user",
        });
      } else {
        // Modo de criação: limpa o formulário
        setFormData({
          nome: "",
          email: "",
          senha: "",
          tipo_usuario: "user",
        });
      }
      setErrors({}); // Limpa os erros ao abrir o modal
    }
  }, [isOpen, userToEdit, isUpdateMode]);

  // Função de validação para os campos do usuário
  const validate = () => {
    const newErrors = {};
    if (!formData.nome) newErrors.nome = "O nome é obrigatório.";
    if (!formData.email) {
      newErrors.email = "O e-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "O formato do e-mail é inválido.";
    }
    // A senha só é obrigatória no modo de criação
    if (!isUpdateMode && !formData.senha) {
      newErrors.senha = "A senha é obrigatória.";
    }
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

    // Prepara os dados para o envio, tratando o campo de senha
    const dataToSend = { ...formData };
    if (isUpdateMode && !dataToSend.senha) {
      delete dataToSend.senha;
    }

    if (isUpdateMode) {
      updateMutation.mutate(
        { id: userToEdit.id, ...dataToSend },
        {
          onSuccess: () => {
            onFeedback("success", "Usuário atualizado com sucesso!");
            onClose();
          },
          onError: (error) => {
            const msg =
              error.response?.data?.errors?.[0] || "Erro ao atualizar usuário.";
            onFeedback("error", msg);
          },
        }
      );
    } else {
      createMutation.mutate(dataToSend, {
        onSuccess: () => {
          onFeedback("success", "Usuário cadastrado com sucesso!");
          onClose();
        },
        onError: (error) => {
          const msg =
            error.response.data.details[0].message ||
            "Erro ao cadastrar usuário.";
          onFeedback("error", msg);
        },
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Regra de permissão: Apenas admins podem alterar o tipo de usuário.
  const canChangeUserType = loggedInUser?.tipo_usuario === "admin";

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {isUpdateMode ? "Atualizar Usuário" : "Cadastrar Novo Usuário"}
        </h2>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="nome">Nome *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.nome && (
                <p className={styles.errorMessage}>{errors.nome}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.email && (
                <p className={styles.errorMessage}>{errors.email}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="senha">
                {isUpdateMode
                  ? "Nova Senha (deixe em branco para não alterar)"
                  : "Senha *"}
              </label>
              <input
                type="senha"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.senha && (
                <p className={styles.errorMessage}>{errors.senha}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tipo_usuario">Tipo de Usuário *</label>
              <select
                id="tipo_usuario"
                name="tipo_usuario"
                value={formData.tipo_usuario}
                onChange={handleChange}
                className={styles.input}
                disabled={!canChangeUserType}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
              {!canChangeUserType && (
                <small style={{ marginTop: "4px", fontSize: "0.75rem" }}>
                  Apenas administradores podem alterar o tipo.
                </small>
              )}
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
              : "Cadastrar Usuário"}
          </button>
        </form>
        <button className={styles.closeButton} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default UserModal;
