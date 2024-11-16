import { CardCombinationType, PlayerKey } from "@tichu-ts/shared";

export type TableState = {
    currentCardKeys?: string[],
    combinationType?: CardCombinationType,
    pendingDragonSelection: boolean,
    pendingBomb: boolean,
    currentCardsOwner?: PlayerKey,
};
