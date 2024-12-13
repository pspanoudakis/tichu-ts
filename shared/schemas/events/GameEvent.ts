import { z } from "zod";
import { PlayerKey, zPlayerKey } from "../../game_logic/PlayerKeys";

export function createGameEventSchema<
    DataType extends z.ZodTypeAny,
    PlayerKeyType extends typeof zPlayerKey | z.ZodUndefined,
>(
    dataTypeSchema: DataType = z.undefined() as DataType,
    playerKeySchema: PlayerKeyType = z.undefined() as PlayerKeyType,
) {
    return z.object({
        playerKey: playerKeySchema,
        data: dataTypeSchema,
    });
};

export type GameEvent<D = void> = {
    playerKey?: PlayerKey,
} & (
    D extends void ? { data?: never } : { data: D }
);
