# --- Estágio 1: Builder ---
# Utiliza a imagem oficial do Node.js para instalar dependências e "buildar" o projeto.
FROM node:20 AS builder

# Define o diretório de trabalho dentro do contentor.
WORKDIR /app

# Copia os ficheiros de manifesto de pacotes para aproveitar o cache do Docker.
COPY package*.json ./

# Instala todas as dependências (incluindo as de desenvolvimento para o build).
RUN npm install

# Copia todo o código-fonte do frontend para o contentor.
COPY . .

# Executa o comando de build do Vite para gerar os ficheiros estáticos.
RUN npm run build

# --- Estágio 2: Production ---
# Utiliza uma imagem Nginx super leve e segura para servir os ficheiros.
FROM nginx:stable-alpine

# Copia os ficheiros estáticos gerados no estágio 'builder' (referenciado pelo índice 0)
# para o diretório padrão onde o Nginx serve arquivos.
COPY --from=0 /app/dist /usr/share/nginx/html # <-- CORREÇÃO: Usamos o índice 0

# Expõe a porta 80, que é a porta padrão do Nginx.
EXPOSE 80

# O comando padrão do Nginx para iniciar o servidor.
CMD ["nginx", "-g", "daemon off;"]

