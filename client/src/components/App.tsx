import React, { useCallback, useState } from "react";
import {
    createSession,
    getOpenSession,
    isSessionWithIdOpen 
} from "../API/sessionAPI";
import { GameSession } from "./GameSession";
import { WinScoreSelector } from "./WinScoreSelector";

import styles from "../styles/Components.module.css";
import tichuLogo from "../assets/tichu_logo.png"
import {
    ChakraProvider,
    defaultSystem,
    Flex,
    Input,
    Tabs,
    Theme,
} from "@chakra-ui/react";
import { Field } from "./ui/field";
import { GenericButton } from "./ui/GenericButton";
import { LoadingScreen } from "./LoadingScreen";

function checkNickname(n: string) {
    if (n) return true;
    alert('Please specify a nickname.');
    return false;
}

export const App: React.FC<{}> = () => {

    const [loading, setLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
    const [inputSessionId, setInputSessionId] = useState('');
    const [nickname, setNickname] = useState('');
    const [winningScore, setWinningScore] = useState(0);

    const onCreateSession = useCallback(() => {
        if (!checkNickname(nickname)) return;
        setLoading(true);
        createSession(winningScore)
            .then(({ sessionId }) => {
                setCurrentSessionId(sessionId);
            })
            .catch(() => {
                alert('Failed to create new session.');
            })
            .finally(() => setLoading(false));
    }, [winningScore, nickname]);

    const onJoinOpenSession = useCallback(() => {
        if (!checkNickname(nickname)) return;
        setLoading(true);
        getOpenSession()
            .then(({ sessionId }) => {
                setCurrentSessionId(sessionId);
            })
            .catch(() => {
                alert('Failed to join open session.');
            })
            .finally(() => setLoading(false));
    }, [nickname]);
    
    const onJoinOpenSessionById = useCallback(() => {
        if (!checkNickname(nickname)) return;
        if (!inputSessionId) {
            alert('Please specify a room id.');
            return;
        }
        setLoading(true);
        isSessionWithIdOpen(inputSessionId)
            .then(() => {
                setCurrentSessionId(inputSessionId);
            })
            .catch(() => {
                alert('No session found with this ID or session is full.');
            })
            .finally(() => setLoading(false));
    }, [nickname, inputSessionId]);

    const onWinningScoreSelected = useCallback(
        (s: number) => setWinningScore(s), []
    );

    const onSessionClosed = useCallback(() => setCurrentSessionId(undefined), []);

    return <div className={styles.appRoot}><ChakraProvider value={defaultSystem}>{
        loading ? <LoadingScreen label="Loading..."/> : (
            currentSessionId ?
            <GameSession
                sessionId={currentSessionId}
                playerNickname={nickname}
                exitSession={onSessionClosed}
            />
            :
            <div className={styles.enteringSceneContainer}>
                <img src={tichuLogo} alt={"Tichu Logo"} className={styles.gameLogo}/>
                    <Theme appearance="dark" hasBackground={false}>
                        <Flex gap={'1ch'} alignItems={'center'}>
                            <Field label="Nickname">
                                <Input
                                    variant={'subtle'}
                                    value={nickname}
                                    onChange={e => setNickname(e.target.value)}
                                    placeholder="Enter nickname..."
                                />
                            </Field>
                        </Flex>
                        <Tabs.Root defaultValue="createRoom" variant={'line'}>
                            <Tabs.List>
                                <Tabs.Trigger value="createRoom">
                                    Create New Room
                                </Tabs.Trigger>
                                <Tabs.Trigger value="joinRoom">
                                    Join Room
                                </Tabs.Trigger>
                            </Tabs.List>
                            <Tabs.Content value="createRoom">
                                <Flex gap={'1ch'} alignItems={'end'}>
                                    <WinScoreSelector
                                        onSelected={onWinningScoreSelected}
                                        score={winningScore}
                                    />
                                    <GenericButton onClick={onCreateSession}>
                                        Create New Room
                                    </GenericButton>
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="joinRoom">
                                <Flex direction={'column'} gap='1ch'>
                                    <GenericButton onClick={onJoinOpenSession}>
                                        Join Open Room
                                    </GenericButton>
                                    <Flex gap='1ch'>
                                        <Input
                                            variant={'subtle'}
                                            value={inputSessionId}
                                            onChange={e => setInputSessionId(e.target.value)}
                                            placeholder="Enter a Room ID"
                                            maxW="20ch"
                                        />
                                        <GenericButton onClick={onJoinOpenSessionById}>
                                            Join Room
                                        </GenericButton>
                                    </Flex>
                                </Flex>
                            </Tabs.Content>
                        </Tabs.Root>
                    </Theme>
            </div>
        )
    }</ChakraProvider></div>;
}
