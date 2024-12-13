import { PlayerKey } from "@tichu-ts/shared/game_logic/PlayerKeys"
import { DefaultEventsMap, Namespace, Server, Socket } from "socket.io"
import { ClientEventParams, ClientEvents, ServerEvents } from "@tichu-ts/shared/schemas/events/SocketEvents"

type SocketData = {
    playerKey: PlayerKey,
};

export type SocketIONamespace = Namespace<
    ClientEvents,
    ServerEvents,
    DefaultEventsMap,
    SocketData
>;

export type SocketIOServer = Server<
    ClientEvents,
    ServerEvents,
    DefaultEventsMap,
    SocketData
>;

export type SocketIOSocket = Socket<
    ClientEvents,
    ServerEvents,
    DefaultEventsMap,
    SocketData
>;

export type ClientEventData<T extends keyof ClientEvents>
    = ClientEventParams<T>[0];
