FROM node:20

WORKDIR /app

COPY package*.json ./

# Instala apenas dependências de produção
RUN npm install --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
