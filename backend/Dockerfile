# --- Estágio 1: Builder ---
# Utiliza uma imagem Node.js completa para instalar dependências.
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

# --- Estágio 2: Production ---
# Utiliza uma imagem Alpine, muito mais leve e segura para produção.
FROM node:20-alpine
WORKDIR /app

# Copia as dependências de produção do estágio 'builder'.
COPY --from=builder /app/node_modules ./node_modules
# Copia o código-fonte da aplicação.
COPY --from=builder /app ./

# A imagem base 'node:20-alpine' já inclui um utilizador 'node' seguro.
# Não precisamos de o criar, apenas de o usar.

# Define o proprietário dos ficheiros para o utilizador 'node' existente.
RUN chown -R node:node /app

# Muda para o utilizador não-root para maior segurança.
USER node

# Expõe a porta que a aplicação usa.
EXPOSE 3000

# O comando para iniciar a aplicação.
CMD [ "npm", "start" ]

