FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]