FROM node:20-alpine AS base
WORKDIR /home/node/app
RUN mkdir ./client
RUN mkdir ./shared
COPY ./client ./client
COPY ./shared ./shared
COPY ./package.json ./
COPY ./tsconfig.json ./
RUN yarn
WORKDIR /home/node/app/client

FROM base AS production
ENV NODE_PATH=./dist
WORKDIR /home/node/app/client
RUN yarn run build
