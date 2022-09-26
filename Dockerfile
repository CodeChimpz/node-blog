FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . ./

ENV PORT 1000

EXPOSE ${PORT}

VOLUME [ "/app/public" ]

CMD ["node","server.js"]

