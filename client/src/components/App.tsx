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

function checkNickname(n: string) {
    if (n) return true;
    alert('Please specify a nickname.');
    return false;
}

const App: React.FC<{}> = () => {

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

    return (
        <div className={styles.appRoot}>{
            loading ?
            <div>Loading...</div>
            : (
                currentSessionId ?
                <GameSession
                    sessionId={currentSessionId}
                    playerNickname={nickname}
                    exitSession={onSessionClosed}
                />
                :
                <div className={styles.enteringSceneContainer}>
                    <img src={tichuLogo} alt={"Tichu Logo"} className={styles.gameLogo}/>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        rowGap: '1ch'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            columnGap: '1ch',
                        }}>
                            <span>Nickname:</span>
                            <input
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            columnGap: '1ch',
                        }}>
                            <span>Room ID:</span>
                            <input
                                value={inputSessionId}
                                onChange={e => setInputSessionId(e.target.value)}
                            />
                            <button onClick={onJoinOpenSessionById}>Join Room</button>
                        </div>
                        <WinScoreSelector onSelected={onWinningScoreSelected}/>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                        }}>
                            <button onClick={onCreateSession}>Create New Room</button>
                            <button onClick={onJoinOpenSession}>Join Open Room</button>
                        </div>
                    </div>
                </div>
            )
        }</div>
    );
}

export default App;
