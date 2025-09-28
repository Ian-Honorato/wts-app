# --- Estágio 1: Builder ---
# Utiliza uma imagem Node.js completa para instalar dependências.
FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./

# Instala SOMENTE as dependências de produção.
RUN npm install --only=production

COPY . .

# --- Estágio 2: Production ---
# Utiliza uma imagem Alpine, muito mais leve e segura.
FROM node:20-alpine

WORKDIR /app

# Copia as dependências e o código do estágio 'builder'.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# A imagem base 'alpine' já tem um utilizador 'node'. Vamos apenas usá-lo.
# Define o proprietário dos ficheiros para o utilizador 'node'.
RUN chown -R node:node /app

# Muda para o utilizador não-root para maior segurança.
USER node

# Expõe a porta que a aplicação usa.
EXPOSE 3000

# O comando para iniciar a aplicação.
CMD [ "npm", "start" ]

