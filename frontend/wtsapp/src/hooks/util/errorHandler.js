export const extractErrorDetails = (error) => {
  if (
    error.response?.data?.details &&
    Array.isArray(error.response.data.details)
  ) {
    return error.response.data.details; // Retorna o array completo, ex: [{ field, message }]
  }

  // Se tiver apenas uma mensagem 'error', crie um array no formato padrão
  if (error.response?.data?.error) {
    // 'field' genérico para mostrar o erro em algum lugar
    return [{ field: "api", message: error.response.data.error }];
  }

  // Fallback final
  return [
    { field: "api", message: "Ocorreu um erro inesperado. Tente novamente." },
  ];
};
