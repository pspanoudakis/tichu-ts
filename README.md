# Tichu-TS

A simulation of the famous
[Tichu card game](https://en.wikipedia.org/wiki/Tichu),
which has many rule variations. This particular implementation rules are described
[here](http://www.gamecabinet.com/rules/Tichu.html).

## Tech Stack
- Game Server: Node.js, [Express](https://expressjs.com/), TypeScript
- Game Client: React.js, [Vite](https://vite.dev/), TypeScript
- Event-driven implementation using [Socket.IO](https://socket.io/)
- [zod](https://zod.dev/) as runtime type-checker
- [yarn](https://yarnpkg.com/) as package manager
- [yarn workspaces](https://yarnpkg.com/features/workspaces) to share business
logic and schemas between server and client
- Docker

## Project Structure
The project uses a monorepo structure.
Each subproject is defined as yarn workspace:
- `client`: Game Client app (React) code
- `server`: Game Server app (Node.js) code
- `shared`: Yarn workspace with business logic and definitions used
both by client and server

## Build & Deployment process
- In project root folder, run `docker-compose up`
- This will create 2 separate containers:
    - `tichu-ts-server`, exposed on port 8080
    - `tichu-ts-client`, exposed on port 3000
- In your browser, visit http://localhost:3000 to play

## Previous projects
Initially, client and server were separate repositories:
- Client: [tichu-js](https://github.com/pspanoudakis/tichu-js)
The client app started as a single-player simulation, without server.
It is currently deployed on [Netlify](https://www.netlify.com/),
you can check it out [here](https://lucid-williams-1b1e7c.netlify.app/).
The look and feel of the UI has not changed in this project.
- Server: [tichu-ts-server](https://github.com/pspanoudakis/tichu-ts-server)

## Development & Testing
- Developed in WSL2, using Visual Studio Code & Node.js 22.11.0,
- Tested in Firefox Developer Edition ~133 & Microsoft Edge ~130
- Build & Deployment process tested using Docker v27.3.1, build ce12230
and Docker Compose v2.29.7-desktop.1
