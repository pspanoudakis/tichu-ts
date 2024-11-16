FROM node:20-alpine as base
WORKDIR /home/node/app
COPY package.json ./
COPY tsconfig.json ./
RUN yarn
COPY ./src ./

FROM base as production
ENV NODE_PATH=./dist
RUN yarn run build
