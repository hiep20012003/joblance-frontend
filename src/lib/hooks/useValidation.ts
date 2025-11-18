import {useState} from 'react';
import {z} from 'zod';

// Thêm import logger
import {logInfo, logError, logWithTrace} from "@/lib/utils/devLogger";

export interface ValidationFlattenErrors {
    [key: string]: string[];
}

interface FieldErrors {
    errors: string[];
}

// Array item error structure with generic properties
export interface ArrayItemErrors<TProperties extends Record<string, unknown> = Record<string, unknown>> {
    errors: string[];
    properties?: {
        [K in keyof TProperties]?: FieldErrors;
    };
}

// Generic validation error response
export interface ValidationTreeifyErrors<T extends Record<string, unknown> = Record<string, unknown>> {
    errors?: string[];
    properties?: {
        [K in keyof T]?: T[K] extends Array<infer U>
            ? ArrayItemErrors & {
            items?: U extends Record<string, unknown>
                ? ArrayItemErrors<U>[]
                : ArrayItemErrors[]
        }
            : ArrayItemErrors;
    };
}

export const useValidation = <T extends z.ZodTypeAny>(
    schema: T
) => {
    // 1. Hook Initialization
    logInfo('Validation', 'Initializing useValidation hook');

    const [errors, setErrors] = useState<ValidationFlattenErrors>({});
    const [treeifyError, setTreeifyError] = useState<ValidationTreeifyErrors>({properties: {}, errors: []});

    const validate = (data: z.infer<T>): boolean => {
        // 2. Validation Attempt
        logWithTrace('Validation', 'Attempting validation (useValidation)', {data});

        const result = schema.safeParse(data);

        if (!result.success) {
            const tree = z.treeifyError(result.error);
            const flattened = z.flattenError(result.error);

            // 4. Validation Failure
            logError('Validation', 'Validation failed (useValidation)', {
                zodError: result.error,
                flattenedErrors: flattened.fieldErrors,
                treeifiedErrors: tree,
            });

            setErrors(flattened.fieldErrors as ValidationFlattenErrors);
            setTreeifyError(tree as ValidationTreeifyErrors);
            return false;
        }

        // 3. Validation Success
        logInfo('Validation', 'Validation successful (useValidation)');

        setErrors({});
        return true;
    };

    return [validate, errors, treeifyError] as const;
};

export const useDirectValidation = <T extends z.ZodTypeAny>(schema: T) => {
    // 1. Hook Initialization
    logInfo('Validation', 'Initializing useDirectValidation hook');

    const parse = (data: z.infer<T>) => {
        // 2. Validation Attempt
        logWithTrace('Validation', 'Attempting validation (useDirectValidation)', {data});

        const result = schema.safeParse(data);

        if (!result.success) {
            const tree = z.treeifyError(result.error);
            const flattened = z.flattenError(result.error);
            const fieldErrors = flattened.fieldErrors as ValidationFlattenErrors;

            // 4. Validation Failure
            logError('Validation', 'Validation failed (useDirectValidation)', {
                zodError: result.error,
                flattenedErrors: fieldErrors,
                treeifiedErrors: tree,
            });

            return {
                valid: false,
                errors: fieldErrors,
                treeifyError: tree as ValidationTreeifyErrors,
            };
        }

        // 3. Validation Success
        logInfo('Validation', 'Validation successful (useDirectValidation)');

        return {
            valid: true,
            errors: {},
            treeifyError: {properties: {}, errors: []} as ValidationTreeifyErrors,
        };
    };

    return {parse};
};