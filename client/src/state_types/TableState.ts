import { CardCombinationType } from "@tichu-ts/shared/game_logic/CardCombinations";
import { PlayerKey } from "@tichu-ts/shared/game_logic/PlayerKeys";

export type TableState = {
    currentCardKeys?: string[],
    combinationType?: CardCombinationType,
    pendingDragonSelection: boolean,
    pendingBomb: boolean,
    currentCardsOwner?: PlayerKey,
};
