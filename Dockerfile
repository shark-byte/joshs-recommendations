FROM node:8.10

RUN mkdir -p /src/app

WORKDIR /src/app

COPY . /src/app

RUN npm install
RUN ./node_modules/.bin/webpack

EXPOSE 3004

CMD [ "npm", "run", "docker" ]