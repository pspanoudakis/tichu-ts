import { z } from "zod";

export const zRoundScore = z.object({
    team02: z.number(),
    team13: z.number(),
});
export type RoundScore = z.infer<typeof zRoundScore>;
