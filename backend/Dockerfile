# --- Estágio 1: Builder ---
# Utiliza uma imagem Node.js completa para instalar dependências e fazer o build.
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
# Instala somente as dependências de produção para o build.
RUN npm install --omit=dev
COPY . .
# Se houver um passo de build no seu backend (ex: TypeScript), adicione aqui.
# Ex: RUN npm run build

# --- Estágio 2: Production ---
# Utiliza uma imagem Alpine, muito mais leve e segura para produção.
FROM node:20-alpine
WORKDIR /app

# Copia as dependências de produção do estágio 'builder'.
COPY --from=builder /app/node_modules ./node_modules
# Copia o código-fonte da aplicação.
COPY --from=builder /app ./

# --- CORREÇÃO FINAL ---
# Cria o utilizador 'node', mas não o grupo se ele já existir.
# Este comando é mais resiliente a diferentes imagens base.
RUN adduser -S -G node node

# Define o proprietário dos ficheiros para o utilizador 'node'.
RUN chown -R node:node /app

# Muda para o utilizador não-root para maior segurança.
USER node

# Expõe a porta que a aplicação usa.
EXPOSE 3000

# O comando para iniciar a aplicação.
CMD [ "npm", "start" ]

