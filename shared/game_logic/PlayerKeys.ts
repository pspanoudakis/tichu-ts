import { z } from "zod";

const _PLAYER_KEYS = {
    PLAYER1: 'player1',
    PLAYER2: 'player2',
    PLAYER3: 'player3',
    PLAYER4: 'player4',
} as const;

export const zPlayerKey = z.nativeEnum(_PLAYER_KEYS);
export type PlayerKey = z.infer<typeof zPlayerKey>;

export const TEAM_KEYS = {
    TEAM_02: 'TEAM_02',
    TEAM_13: 'TEAM_13',
} as const;

export const zTeamKeySchema = z.nativeEnum(TEAM_KEYS);

export const TEAM_PLAYERS = {
    [TEAM_KEYS.TEAM_02]:
        [_PLAYER_KEYS.PLAYER1, _PLAYER_KEYS.PLAYER3] as readonly PlayerKey[],
    [TEAM_KEYS.TEAM_13]:
        [_PLAYER_KEYS.PLAYER2, _PLAYER_KEYS.PLAYER4] as readonly PlayerKey[],
} as const;

export const PLAYER_KEYS = [
    ...Object.values(_PLAYER_KEYS)
] as const;
