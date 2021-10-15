FROM node:12.22.3-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . .

RUN npm install --only=prod

EXPOSE 3789 2112

CMD [ "npm", "start" ]
