# --- Estágio 1: Builder ---
# Usamos a imagem completa do Node para instalar dependências e copiar o código
FROM node:20 AS builder

# Define o fuso horário
ENV TZ=America/Sao_Paulo

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de manifesto de pacotes
COPY package*.json ./

# Instala SOMENTE as dependências de produção
RUN npm install --omit=dev

# Copia o restante do código-fonte
COPY . .

# --- Estágio 2: Production ---
# Usamos uma imagem "slim", que é menor e mais segura
FROM node:20-slim

# Define o diretório de trabalho
WORKDIR /app

# Cria um usuário não-root chamado 'node' para executar a aplicação
# Isso é uma prática de segurança fundamental para contêineres
RUN addgroup --system --gid 1001 node && \
    adduser --system --uid 1001 node

# Copia as dependências instaladas e o código do estágio 'builder'
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Cria o diretório de uploads e define o usuário 'node' como proprietário
RUN mkdir -p /app/uploads/xml && \
    chown -R node:node /app

# Muda para o usuário não-root 'node'
USER node

# Expõe a porta em que a aplicação roda
EXPOSE 3000

# Define um healthcheck para que o Docker saiba se a aplicação está saudável
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD [ "node", "-e", "require('http').get('http://localhost:3000', (res) => process.exit(res.statusCode == 200 ? 0 : 1))" ]

# Comando para iniciar a aplicação
CMD [ "npm", "start" ]
