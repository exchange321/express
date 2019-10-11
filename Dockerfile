FROM node:12-alpine

WORKDIR /var/task

COPY package.json yarn.lock ./

RUN npm install

COPY . .

EXPOSE 8888

CMD [ "yarn", "start" ]
