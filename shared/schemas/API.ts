import { z } from "zod";

export const zCreateRoomRequest = z.object({
    winningScore: z.number()
});
export type CreateRoomRequest = z.infer<typeof zCreateRoomRequest>;

export const zSessionIdResponse = z.object({
    sessionId: z.string(),
});
export type SessionIdResponse = z.infer<typeof zSessionIdResponse>;

export const ERROR_TYPES = {
    BUSINESS_ERROR: 'BUSINESS_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];

export const zErrorResponse = z.object({
    errorType: z.nativeEnum(ERROR_TYPES),
    message: z.string(),
});
export type ErrorResponse = z.infer<typeof zErrorResponse>;
