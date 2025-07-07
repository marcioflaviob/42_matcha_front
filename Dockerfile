FROM node:22.15

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production && npm install esbuild@latest

COPY . .

EXPOSE 5173

ENV NODE_ENV=production

CMD ["npm", "run", "dev", "--", "--host"]