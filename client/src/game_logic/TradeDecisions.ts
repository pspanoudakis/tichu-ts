import { UICardInfo } from "./UICardInfo";

export type TradeDecisions = {
    teammate?: UICardInfo,
    leftOp?: UICardInfo,
    rightOp?: UICardInfo,
};

export const getEmptyTradeDesicions: () => TradeDecisions = () => ({
    teammate: undefined,
    leftOp: undefined,
    rightOp: undefined,
});
