FROM node:14-alpine

COPY package*.json ./

RUN npm i --production

COPY ./build ./build

EXPOSE 8080
CMD [ "node", "." ]
