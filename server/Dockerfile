FROM node:20-alpine as base
WORKDIR /home/node/app
RUN mkdir ./server
RUN mkdir ./shared
COPY ./server/package.json ./server
COPY ./server/tsconfig.json ./server
COPY ./server/src ./server/src
COPY ./shared ./shared
COPY ./package.json ./
COPY ./tsconfig.json ./
RUN yarn
WORKDIR /home/node/app/server

FROM base as production
ENV NODE_PATH=./dist
WORKDIR /home/node/app
RUN yarn
WORKDIR /home/node/app/server
RUN yarn run build
