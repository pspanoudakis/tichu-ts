import { z } from "zod";
import { zTeamKeySchema } from "./PlayerKeys";

export const zGameWinnerResult = z.union([
    zTeamKeySchema, z.literal('TIE')
]);
export type GameWinnerResult = z.infer<typeof zGameWinnerResult>;
