FROM node:18-slim

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY . .
RUN yarn prisma generate
RUN yarn run build

EXPOSE 8080
CMD ["node", "./dist/main.js"]
