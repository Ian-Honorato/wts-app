# --- Estágio Único e Simplificado ---
# Utiliza a imagem oficial e completa do Node.js.
FROM node:20

# Define o diretório de trabalho.
WORKDIR /app

# Copia os ficheiros de manifesto e instala TODAS as dependências.
COPY package*.json ./
RUN npm install

# Copia o resto do código-fonte.
COPY . .

# Executa o build do Vite para gerar os ficheiros estáticos na pasta 'dist'.
RUN npm run build

# Instala um servidor estático simples de forma global.
RUN npm install -g serve

# Expõe a porta 3000, que é a porta padrão do 'serve'.
EXPOSE 3000

# O comando para iniciar o servidor, servindo o conteúdo da pasta 'dist'.
CMD ["serve", "-s", "dist", "-l", "3000"]

