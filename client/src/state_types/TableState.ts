import { CardCombination, CardCombinationType } from "@tichu-ts/shared/game_logic/CardCombinations";
import { PlayerKey } from "@tichu-ts/shared/game_logic/PlayerKeys";
import { UICardInfo } from "../game_logic/UICardInfo";

export type TableState = {
    currentCards: UICardInfo[],
    combinationType?: CardCombinationType,
    pendingDragonSelection: boolean,
    pendingBomb: boolean,
    currentCardsOwner?: PlayerKey,
    currentCombination?: CardCombination,
};
