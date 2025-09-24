const limparNumero = (value) => {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
};

const formatarCpf = (cpf) => {
  const cpfLimpo = limparNumero(cpf);
  if (cpfLimpo.length !== 11) {
    return cpf;
  }
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatarCnpj = (cnpj) => {
  const cnpjLimpo = limparNumero(cnpj);
  if (cnpjLimpo.length !== 14) {
    return cnpj;
  }
  return cnpjLimpo.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
};

export const formatarCpfCnpj = (documento) => {
  if (!documento) return "";
  const documentoLimpo = limparNumero(documento);

  if (documentoLimpo.length === 11) {
    return formatarCpf(documentoLimpo);
  }

  if (documentoLimpo.length === 14) {
    return formatarCnpj(documentoLimpo);
  }

  return documento;
};

export const formatarTelefone = (telefone) => {
  if (!telefone) return "";
  const telefoneLimpo = limparNumero(telefone);

  // Formato: +55 (14) 99724-3855 (Código País + DDD + Celular com 9 dígitos)
  if (telefoneLimpo.length === 13) {
    return telefoneLimpo.replace(
      /(\d{2})(\d{2})(\d{5})(\d{4})/,
      "+$1 ($2) $3-$4"
    );
  }

  // Formato: +55 (14) 3522-1234 (Código País + DDD + Fixo com 8 dígitos)
  if (telefoneLimpo.length === 12) {
    return telefoneLimpo.replace(
      /(\d{2})(\d{2})(\d{4})(\d{4})/,
      "+$1 ($2) $3-$4"
    );
  }

  // Formato: (14) 99724-3855 (DDD + Celular com 9 dígitos)
  if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  // Formato: (14) 3522-1234 (DDD + Fixo com 8 dígitos)
  if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  // Se não corresponder a nenhum formato, retorna o número original.
  return telefone;
};
