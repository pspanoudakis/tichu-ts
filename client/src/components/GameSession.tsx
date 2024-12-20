import React, { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { createSessionSocketURI } from "../API/coreAPI";
import {
    ServerEventType,
    zBetPlacedEvent,
    zGameEndedEvent,
    zPlayerJoinedEvent,
    zPlayerLeftEvent,
    zWaitingForJoinEvent
} from "@tichu-ts/shared/schemas/events/ServerEvents";
import { Scoreboard } from "./Scoreboard";

import styles from "../styles/Components.module.css";
import {
    AppContext,
    appContextInitState,
    handleBetPlacedEvent,
    handleGameEndedEvent,
    handleGameStartedEvent,
    handlePlayerJoinedEvent,
    handlePlayerLeftEvent,
    handleWaitingForJoinEvent
} from "../AppContext";
import { ClientEventType } from "@tichu-ts/shared/schemas/events/ClientEvents";
import {
    errorEventListeners,
    eventHandlerWrapper,
    registerEventListenersHelper
} from "../utils/eventUtils";
import { GameRound } from "./GameRound";
import { TEAM_PLAYERS } from "@tichu-ts/shared/game_logic/PlayerKeys";
import { GameChatWrapper } from "./GameChatWrapper";
import { noValidator } from "@tichu-ts/shared/schemas/events/SocketEvents";
import { Flex } from "@chakra-ui/react";
import { GenericButton } from "./ui/GenericButton";
import { SessionDetailsButton } from "./SessionDetailsButton";
import { LoadingScreen } from "./LoadingScreen";

type GameSessionProps = {
    sessionId: string,
    playerNickname: string,
    exitSession?: () => void,
};

export const GameSession: React.FC<GameSessionProps> = ({
    sessionId, playerNickname, exitSession,
}) => {

    const [appContextState, setAppContextState] = useState(appContextInitState);
    const [connectingToSession, setConnectingToSession] = useState(true);
    const [isGameInProgress, setIsGameInProgress] = useState(false);
    const [startGamePressed, setStartGamePressed] = useState(false);

    useEffect(() => {
        setConnectingToSession(true);

        // Init socket, without auto connecting
        const socket = io(createSessionSocketURI(sessionId), {
            autoConnect: false,
        });

        // Register event listeners
        const cleanupListeners = registerEventListenersHelper({
            connect: () => {
                console.log(
                    `SocketIO connection established. Socket ID: ${socket.id}`
                );
            },
            disconnect: (
                reason: Socket.DisconnectReason,
                description?: any
            ) => {
                alert(`Server disconnected. See console for more details.`);
                console.error('Server Disconnected. Reason: ', reason);
                console.error('Server disconnection description: ', description);
                exitSession?.();
            },
            [ServerEventType.WAITING_4_JOIN]: eventHandlerWrapper(
                zWaitingForJoinEvent.parse, e => {
                    setAppContextState(s => handleWaitingForJoinEvent(s, e));
                    socket.emit(
                        ClientEventType.JOIN_GAME, {
                            data: {
                                playerNickname: playerNickname,
                            }
                        }
                    );
                }
            ),
            [ServerEventType.PLAYER_JOINED]: eventHandlerWrapper(
                zPlayerJoinedEvent.parse, e => {
                    setAppContextState(s => handlePlayerJoinedEvent(s, e));
                }
            ),
            [ServerEventType.BET_PLACED]: eventHandlerWrapper(
                zBetPlacedEvent.parse, e => {
                    setAppContextState(s => handleBetPlacedEvent(s, e));
                }
            ),
            [ServerEventType.GAME_STARTED]: eventHandlerWrapper(
                noValidator, () => {
                    setAppContextState(s => handleGameStartedEvent(s));
                    setIsGameInProgress(true);
                }                
            ),
            [ServerEventType.PLAYER_LEFT]: eventHandlerWrapper(
                zPlayerLeftEvent.parse, e => {
                    if(e.data.gameOver) alert(`A player has left the game.`);
                    setAppContextState(s => handlePlayerLeftEvent(s, e));
                }                
            ),
            ...errorEventListeners,
        }, socket);

        setAppContextState(s => ({
            ...s,
            socket: socket,
        }));

        // Connect after listeners registered
        socket.connect();

        // On unmount, cleanup
        return () => {
            cleanupListeners();
            socket.disconnect();
        }
    }, [sessionId, playerNickname, exitSession]);

    const thisPlayerTeam = useMemo(() => {
        const playerKey = appContextState.gameContext.thisPlayer?.playerKey;
        if (playerKey)
            return Object.entries(TEAM_PLAYERS).find(
                ([_, players]) => players.includes(playerKey)
            )?.[0];
    }, [appContextState.gameContext.thisPlayer?.playerKey]);

    useEffect(() => registerEventListenersHelper({
        [ServerEventType.GAME_ENDED]: eventHandlerWrapper(
            zGameEndedEvent.parse, e => {
                let resultMsg;
                switch (e.data.result) {
                    case 'TIE':
                        resultMsg = 'TIE';
                        break;
                    case thisPlayerTeam:
                        resultMsg = 'Your Team won.';
                        break;
                    default:
                        resultMsg = 'Your Team lost.';
                        break;
                }
                alert(`Game Over. Result: ${resultMsg}`);
                setAppContextState(s => handleGameEndedEvent(s, e));
                setIsGameInProgress(false);
                setStartGamePressed(false);
            }                
        ),
    }, appContextState.socket), [appContextState.socket, thisPlayerTeam]);

    useEffect(() => {
        if (appContextState.gameContext.thisPlayer?.playerKey) {
            setConnectingToSession(false);
        }
    }, [appContextState.gameContext.thisPlayer?.playerKey]);

    const onGameExit = useCallback(() => {
        if (!isGameInProgress || window.confirm(
            'Are you sure? Your team will lose if you exit the game.'
        )) {
            exitSession?.();
            setStartGamePressed(false);
        }        
    }, [exitSession, isGameInProgress]);

    const onStartGame = useCallback(() => {
        appContextState.socket?.emit(
            ClientEventType.START_GAME, () => setStartGamePressed(true)
        );
    }, [appContextState.socket]);

    return (
        <AppContext.Provider 
			value={{
				state: appContextState,
				setState: setAppContextState,
			}}
		>{
            connectingToSession ?
            <LoadingScreen label="Connecting to session..."/>
            :
            <div className={styles.gameContainer}>
                <Scoreboard
                    scores={appContextState.gameContext.previousGames}
                    current={{
                        team02: appContextState.gameContext.previousGames.reduce(
                            (sum, { team02 }) => sum + team02, 0
                        ),
                        team13: appContextState.gameContext.previousGames.reduce(
                            (sum, { team13 }) => sum + team13, 0
                        )
                    }}
                />
                <GameRound/>
                <Flex
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                    paddingX='1ch'
                >
                    <GenericButton onClick={onGameExit}>
                        ⬅ Exit Game
                    </GenericButton>
                    {
                        !isGameInProgress && 
                        <GenericButton
                            onClick={onStartGame}
                            disabled={startGamePressed}
                        >
                            ▶ Start Game
                        </GenericButton>
                    }
                    <Flex columnGap='0.2em'>
                        <SessionDetailsButton
                            roomId={sessionId}
                            winningScore={appContextState.gameContext.winningScore}
                        />
                        <GameChatWrapper/>
                    </Flex>
                </Flex>
            </div>
        }</AppContext.Provider>
    );
}
