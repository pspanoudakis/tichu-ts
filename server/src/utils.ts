import { ERROR_TYPES, ErrorType } from "@tichu-ts/shared/schemas/API";
import { ZodError } from "zod";

export class BusinessError extends Error {
    constructor(message: string) {
        super(message);
    }

    override toString() {
        return `Business Error: ${this.message}`;
    }
}

export function extractErrorInfo(error: any) {
    let errorType: ErrorType;
    let message: string;
    if (error instanceof BusinessError) {
        errorType = ERROR_TYPES.BUSINESS_ERROR;
        message = error.toString();
    } else if (error instanceof ZodError) {
        errorType = ERROR_TYPES.VALIDATION_ERROR;
        message = JSON.stringify(error);
    } else {
        errorType = ERROR_TYPES.INTERNAL_ERROR;
        message = error?.toString?.() ?? JSON.stringify(error);
    }
    return {
        errorType,
        message,
    };
}