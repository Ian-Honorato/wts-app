# --- Estágio 1: Builder ---
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
# Instala somente as dependências de produção para o build
RUN npm install --omit=dev
COPY . .
# Se houver um passo de build no seu backend (ex: TypeScript), adicione aqui.
# Ex: RUN npm run build

# --- Estágio 2: Production ---
FROM node:20-alpine
WORKDIR /app

# Copia as dependências de produção do estágio 'builder'
COPY --from=builder /app/node_modules ./node_modules
# Copia o código-fonte da aplicação
COPY --from=builder /app ./

# CORREÇÃO: Cria o usuário 'node' de uma forma mais segura e robusta
RUN addgroup -S node && adduser -S -G node node

# Define o proprietário dos arquivos para o usuário 'node'
RUN chown -R node:node /app

# Muda para o usuário não-root
USER node

# Expõe a porta que a aplicação usa
EXPOSE 3000

# O comando para iniciar a aplicação
CMD [ "npm", "start" ]

