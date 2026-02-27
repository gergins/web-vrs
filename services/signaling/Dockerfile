FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY services/signaling ./services/signaling

ENV SIGNALING_PORT=7070
EXPOSE 7070

CMD ["node", "services/signaling/src/server.js"]
