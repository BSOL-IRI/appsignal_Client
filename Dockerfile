FROM node:18.2.0


WORKDIR /app

COPY package*.json ./
COPY .env ./
COPY src ./src
COPY public ./public
COPY tailwind.config.js ./

RUN npm install --f


RUN export HOST=0.0.0.0 && export PORT=443

EXPOSE 443

CMD [ "npm", "start" ]
