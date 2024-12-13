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
                <input
                    style={{
                        width: '100%',
                        height: '3vh'
                    }}
                    value={text}
                    onChange={onTextChange}
                />
                <button onClick={onSendMessage}>
                    Send
                </button>
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
            <button
                onClick={toggleChat}
                style={{
                    width: '14ch',
                    minWidth: 'max-content',
                }}
            >
                {`✉ ${isChatOpen ? 'Hide Chat' : 'Show Chat'}`}
            </button>
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
