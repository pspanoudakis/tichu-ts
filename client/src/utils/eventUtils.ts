import { Socket } from "socket.io-client";
import { EventsMap } from "@socket.io/component-emitter";
import { zErrorEvent, zMessageSentEvent } from "@tichu-ts/shared/schemas/events/ServerEvents";
import { ERROR_TYPES } from "@tichu-ts/shared/schemas/API";
import { z } from "zod";
import { ServerEventParams, ServerEvents } from "@tichu-ts/shared/schemas/events/SocketEvents";

export function logError(msg?: any, ...optionals: any[]) {
    console.error(msg, ...optionals);
    alert(`${msg}. See console.`);
}

export function eventHandlerWrapper<
    EventType extends keyof ServerEvents,
    EventParams extends ServerEventParams<EventType>
>(
    validator: (e: EventParams[0]) => EventParams[0],
    eventHandler: (...e: EventParams) => void,
) {
    return (...args: EventParams) => {
        try {
            // Validate first arg (event data)
            validator(args[0]);
        } catch (error) {
            return logError('Validation Error', error);
        }
        try {
            // Provide all args to event handler (including ACK callbacks)
            eventHandler(...args);
        } catch (error) {
            return logError('Error in event handler', error);
        }
    };
}

export function registerEventListenersHelper<
    ListenEvents extends EventsMap,
    EmitEvents extends EventsMap,
>(
    eventListeners: Partial<ListenEvents>,
    socket?: Socket<ListenEvents, EmitEvents>
) {
    if (!socket) return () => {};
    for (const eventName in eventListeners) {
        const l = eventListeners[eventName];
        if (l) socket.on(eventName, l);
    }
    return () => {
        for (const eventName in eventListeners) {
            socket.off(eventName, eventListeners[eventName]);
        }
    };
}

const errorEventListener = eventHandlerWrapper(
    zErrorEvent.parse, e => {
        console.error(e);
        alert(`Error event received. See console for details.`);
    }
);

export const errorEventListeners: {
    [et in keyof typeof ERROR_TYPES]: ServerEvents[et]
} = {
    [ERROR_TYPES.BUSINESS_ERROR]: eventHandlerWrapper(
        zErrorEvent.parse, e => {
            console.error(e);
            alert(e.data.message);
        }
    ),
    [ERROR_TYPES.INTERNAL_ERROR]: errorEventListener,
    [ERROR_TYPES.VALIDATION_ERROR]: errorEventListener,
};

const zMessageData = zMessageSentEvent.pick({ data: true });
export type MessageData = z.infer<typeof zMessageData>['data'];
