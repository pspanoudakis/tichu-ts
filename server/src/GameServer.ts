import http from "http";
import { Server } from "socket.io";
import cors from "cors"
import { GameSession } from "./GameSession";
import express, { Response as ExpressResponse } from "express";
import {
    CreateRoomRequest,
    ERROR_TYPES,
    SessionIdResponse,
    zCreateRoomRequest
} from "@tichu-ts/shared/schemas/API";
import { BusinessError, extractErrorInfo } from "./utils/errors";
import { z } from "zod";

export class GameServer {

    private static instance: GameServer | null = null;

    express = express();
    httpServer: http.Server;
    socketServer: Server;
    sessions = new Map<string, GameSession>();
    private sessionIdSeq = 0;

    private constructor() {
        this.express.use(cors());
        this.express.use(express.json());
        this.express.post('/session', (req, res) => {
            GameServer.responseCreator(res, () => 
                this.handleCreateRoomRequest(zCreateRoomRequest.parse(req.body))
            );
        });
        this.express.get('/openSession', (_, res) => {
            GameServer.responseCreator(res, () => 
                this.handleGetOpenRoomRequest()
            );
        });
        this.express.get('/isSessionOpen', (req, res) => {
            GameServer.responseCreator(res, () =>
                this.handleCheckOpenSessionByIdRequest(
                    z.string().parse(req.query['id'])
                )
            );
        });
        this.express.get('/', (_, res) => {
            res.send('Hello from Node TS!');
        });
        this.httpServer = http.createServer(this.express);
        this.socketServer = new Server(
            this.httpServer, {
                cors: {
                    origin: '*'
                },
                connectionStateRecovery: {
                    maxDisconnectionDuration: 1 * 60 * 1000,
                    skipMiddlewares: true,
                },
            }
        );
    }

    private generateSessionId() {
        // return `session_${this.sessionIdSeq++}_${new Date().toISOString()}`;
        return `session_${this.sessionIdSeq++}`;
    }

    static getInstance() {
        return (GameServer.instance ??= new GameServer());
    }

    static responseCreator(res: ExpressResponse, bodyCreator: () => any) {
        try {
            res.status(200).json(bodyCreator());
        } catch (err) {
            const { errorType, message } = extractErrorInfo(err);
            if (errorType === ERROR_TYPES.INTERNAL_ERROR) {
                res.status(500);
                console.log(message);
            } else {
                res.status(400);
            }
            res.json({
                errorType,
                message,
            });
        }
    }

    listen(port: number, callback: () => any) {
        this.httpServer.listen(port, callback);
    }

    handleCreateRoomRequest(req: CreateRoomRequest): SessionIdResponse {
        // Create new session
        const sessionId = this.generateSessionId();
        const session = new GameSession(
            sessionId, this.socketServer, req.winningScore
        );
        if (this.sessions.has(sessionId))
            throw new Error(`Regenerated existing session id: '${sessionId}'`);
        this.sessions.set(sessionId, session);
        // Player will be added in session as soon as socket connection is established.
        return {
            sessionId,
        };
    }

    handleGetOpenRoomRequest(): SessionIdResponse {
        for (const session of this.sessions.values()) {
            if (!session.isFull()) {
                return {
                    sessionId: session.id,
                };
            }
        }
        throw new BusinessError(
            `No sessions that can be joined were found.`
        );
    }

    handleCheckOpenSessionByIdRequest(id: string): true {
        const s = this.sessions.get(id);
        if (!s || s.isFull())
            throw new BusinessError(
                `No session with this ID was found or session is full`
            );
        return true;
    }
}
