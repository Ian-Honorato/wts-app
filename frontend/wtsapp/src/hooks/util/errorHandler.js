export const extractErrorMessage = (error) => {
  // Erro de validação estruturado do backend (com o novo padrão)
  if (
    error.response?.data?.details &&
    Array.isArray(error.response.data.details)
  ) {
    return error.response.data.details[0].message;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
};
