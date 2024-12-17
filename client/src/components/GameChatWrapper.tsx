import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { AppContext } from "../AppContext";
import {
    ClientEventType,
    SendMessageEvent,
    ServerEventType,
    zMessageSentEvent
} from "@tichu-ts/shared";
import {
    eventHandlerWrapper,
    MessageData,
    registerEventListenersHelper,
} from "../utils/eventUtils";

import styles from "../styles/Components.module.css";
import { GenericButton } from "./ui/GenericButton";
import { Input } from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";

type MessageInfo = {
    data: MessageData,
    isSentByThisUser: boolean,
}

const MessageTile: React.FC<{
    msg: MessageInfo
}> = ({ msg }) => {

    const dateText = useMemo(() => {
        return new Date(Date.parse(msg.data.sentOn)).toLocaleTimeString();
    }, [msg.data.sentOn]);

    return (
        <div
            className={styles.messageTile}
            style={{
                alignItems: msg.isSentByThisUser ? 'flex-end' : 'flex-start',
            }}
        >
            <span
                style={{
                    fontSize: '1.45vh'
                }}
            >
            { msg.data.sentBy } - {dateText}
            </span>
            <div
                className={styles.messageTileTextContainer}
                style={
                    msg.isSentByThisUser ? {
                        backgroundColor: '#282c34',
                        color: 'white'
                    } : {
                        backgroundColor: 'rgb(114 138 188)',
                        color: 'black'
                    }
                }
            >{
                msg.data.text
            }</div>
        </div>
    );
}

const ChatContainer: React.FC<{
    messages: MessageInfo[],
    onSend?: (txt: string) => void
}> = ({ messages, onSend }) => {

    const [text, setText] = useState('');

    const domMsgContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (domMsgContainer.current) {
            domMsgContainer.current.scrollTop =
                domMsgContainer.current.scrollHeight;
        }
    }, [messages.length]);

    const onTextChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value), []);

    const onSendMessage = useCallback(() => {
        setText(s => {
            if (s) onSend?.(s);
            return '';
        });
    }, [onSend]);

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                Game Chat
            </div>
            <div
                ref={domMsgContainer}
                className={styles.chatMessagesContainer}
            >
                <div className={styles.chatMessagesList}>
                { messages.map((m, i) => <MessageTile key={i} msg={m}/>) }
                </div>
            </div>
            <div className={styles.chatFooter}>
                <Input
                    color='black'
                    variant={'subtle'}
                    w='100%'
                    h='100%'
                    value={text}
                    onChange={onTextChange}
                />
                <GenericButton h='3.5em' onClick={onSendMessage}>
                    <LuSend/>
                </GenericButton>
            </div>
        </div>
    )
}

export const GameChatWrapper: React.FC<{}> = () => {

    const { state: ctxState } = useContext(AppContext);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [ messages, setMessages ] = useState<MessageInfo[]>([]);

    const thisUserKey = ctxState.gameContext.thisPlayer?.playerKey;

    useEffect(() => registerEventListenersHelper({
        [ServerEventType.MESSAGE_SENT]: eventHandlerWrapper(
            zMessageSentEvent.parse, e => {
                setMessages(messages => [
                    ...messages, {
                        data: e.data,
                        isSentByThisUser:
                            e.playerKey === thisUserKey,
                    }
                ])
            }
        )
    }, ctxState.socket), [ctxState.socket, thisUserKey]);

    const toggleChat = useCallback(() => setIsChatOpen(isOpen => !isOpen), []);

    const onSendMessage = useCallback((text: string) => {
        const e: SendMessageEvent = {
            data: { text },
        };
        ctxState.socket?.emit(ClientEventType.SEND_MESSAGE, e);
    }, [ctxState.socket]);

    return (
        <div
            style={{
                position: "relative",
                display: 'contents',
            }}
        >
            <GenericButton w='8em' onClick={toggleChat}>
                {`✉ ${isChatOpen ? 'Hide Chat' : 'Show Chat'}`}
            </GenericButton>
            {
                isChatOpen &&
                <ChatContainer
                    messages={messages}
                    onSend={onSendMessage}
                />
            }      
        </div>
    );
}
