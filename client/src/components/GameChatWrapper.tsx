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

type MessageInfo = {
    data: MessageData,
    isSentByThisUser: boolean,
}

const MessageTile: React.FC<{
    msg: MessageInfo
}> = ({ msg }) => {

    const dateText = useMemo(() => {
        return new Date(Date.parse(msg.data.sentOn)).toLocaleTimeString();
    }, [msg.data.sentOn])

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                color: 'black',
                width: '100%',
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
                style={{
                    borderRadius: '1vh',
                    backgroundColor: msg.isSentByThisUser ? '#282c34' : 'rgb(114 138 188)',
                    paddingTop: '0.5ch',
                    paddingBottom: '0.5ch',
                    paddingLeft: '0.85ch',
                    paddingRight: '0.85ch',
                    color: msg.isSentByThisUser ? "white" : 'black',
                    width: 'max-content',
                    maxWidth: '15ch',
                    overflowWrap: 'break-word',
                    minHeight: '2vh'
                }}
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
        <div
            style={{
                fontSize: '1.7vh',
                position: 'absolute',
                backgroundColor: '#becbe4',
                bottom: '5ch',
                right: '1ch',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                borderRadius: '10px',
                overflow: 'hidden',
                height: '35ch',
                width: 'max(20ch, 30vw)'
            }}
        >
            <div
                style={{
                    backgroundColor: 'rgb(80, 80, 80)',
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center',
                    paddingTop: '1ch',
                    paddingBottom: '1ch',
                }}
            >
                Game Chat
            </div>
            <div
                ref={domMsgContainer}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'scroll',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'end',
                        height: 'max-content',
                        padding: '1ch',
                        rowGap: '1ch',
                    }}
                >{
                    messages.map((m, i) => <MessageTile key={i} msg={m}/>)
                }</div>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'stretch',
                    padding: '0.5ch'
                }}
            >
                <input
                    style={{
                        width: '100%',
                        height: '3vh'
                    }}
                    value={text}
                    onChange={onTextChange}
                />
                <button
                    onClick={onSendMessage}
                >
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
            eventType: ClientEventType.SEND_MESSAGE,
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
            <button onClick={toggleChat}>
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
