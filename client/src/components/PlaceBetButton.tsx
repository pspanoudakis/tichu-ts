import React, { useCallback, useContext, useMemo } from "react";
import {
    ClientEventType,
    PlaceBetEvent
} from "@tichu-ts/shared/schemas/events/ClientEvents";
import { AppContext } from "../AppContext";
import { PlayerBet } from "@tichu-ts/shared/game_logic/PlayerBet";
import { GenericButton } from "./ui/GenericButton";

type AllowedBet = PlayerBet.TICHU | PlayerBet.GRAND_TICHU

export const PlaceBetButton: React.FC<{
    bet: AllowedBet,
    className?: string,
}> = (props) => {

    const {state: ctxState} = useContext(AppContext);

    const onBetPlaced = useCallback(() => {
        const e: PlaceBetEvent = {
            data: {
                betPoints: props.bet,
            } ,
        }
        ctxState.socket?.emit(ClientEventType.PLACE_BET, e);
        
    }, [ctxState.socket, props.bet]);

    const label = useMemo(() => {
        switch (props.bet) {
            case PlayerBet.GRAND_TICHU:
                return 'Grand Tichu';
            case PlayerBet.TICHU:
                return 'Tichu';
            default:
                throw new Error(`Unexpected bet: '${props.bet}'`);
        }
    }, [props.bet])

    return (
        <GenericButton
            className={props.className}
            onClick={onBetPlaced}
        >
            {label}
        </GenericButton>
    );
}