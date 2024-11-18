import React, { useCallback, useContext } from 'react';

import styles from "../styles/Components.module.css"
import { NormalCardName, reversedNormalCardNames } from '@tichu-ts/shared/game-logic/CardConfig';
import { AppContext } from '../AppContext';
import { ClientEventType, RequestCardEvent } from '@tichu-ts/shared/events/ClientEvents';

export const RequestedCardSelector: React.FC<{}> = () => {

    const { state: ctxState } = useContext(AppContext);

    const onRequestedCardSelected = useCallback((cardName: NormalCardName) => {
        const e: RequestCardEvent = {
            eventType: ClientEventType.REQUEST_CARD,
            data: {
                requestedCardName: cardName
            }
        }
        ctxState.socket?.emit(
            ClientEventType.REQUEST_CARD, e
        );
    }, [ctxState.socket]);

    return (
        ctxState.gameContext.currentRoundState?.requestedCardName ?
        null
        :
        <div className={styles.selectionBoxStyle}>{
            reversedNormalCardNames.map(name => 
                <button
                    key={name} id={name}
                    className={styles.selectionButtonStyle}
                    onClick={() => onRequestedCardSelected(name)}
                >
                    {name}
                </button>
            )
        }</div>
    );
}
