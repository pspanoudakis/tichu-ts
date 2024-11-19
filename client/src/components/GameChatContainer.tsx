import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import { ServerEventType, zMessageSentEvent } from "@tichu-ts/shared";
import { z } from "zod";
import {
    eventHandlerWrapper,
    registerEventListenersHelper,
} from "../utils/eventUtils";

const zMessageType = zMessageSentEvent.pick({ data: true });
type MessageType = z.infer<typeof zMessageType>['data'];

export const GameChatContainer: React.FC<{}> = () => {

    const { state: ctxState } = useContext(AppContext);

    const [ messages, setMessages ] = useState<MessageType[]>([]);

    useEffect(() => registerEventListenersHelper({
        [ServerEventType.MESSAGE_SENT]: eventHandlerWrapper(
            zMessageSentEvent.parse, e => {
                setMessages(messages => [...messages, e.data])
            }
        )
    }, ctxState.socket), [ctxState.socket]);

    return null;
}
