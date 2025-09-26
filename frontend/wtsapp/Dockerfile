# --- Estágio 1: Builder ---
# Usamos uma imagem Node completa para ter acesso ao npm e às ferramentas de build.
# Nomeamos este estágio como 'builder' para poder referenciá-lo mais tarde.
FROM nginx:stable-alpine

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de manifesto de pacotes para aproveitar o cache do Docker.
# Isso evita reinstalar tudo a cada pequena mudança no código.
COPY package*.json ./

# Instala todas as dependências, incluindo as de desenvolvimento (como o Vite)
# que são necessárias para o processo de build.
RUN npm install

# Copia o restante do código-fonte do frontend.
COPY . .

# Executa o comando de build do Vite para gerar os arquivos estáticos.
# Isso criará uma pasta '/app/dist' com o resultado.
RUN npm run build

# --- Estágio 2: Production ---
# Agora, usamos uma imagem super leve do Nginx para servir os arquivos.
# 'alpine' é uma distribuição Linux minúscula, ideal para produção.
FROM nginx:stable-alpine

# Copia os arquivos estáticos gerados no estágio 'builder'
# da pasta '/app/dist' para o diretório padrão onde o Nginx serve arquivos.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx.
# A conexão com o mundo exterior será gerenciada pelo Nginx principal no docker-compose.
EXPOSE 80

# O comando para iniciar o Nginx já está incluído na imagem base,
# então não precisamos de um CMD aqui.
