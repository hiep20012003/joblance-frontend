import {useState} from 'react';
import {z} from 'zod';

// Thêm import logger

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

    const [errors, setErrors] = useState<ValidationFlattenErrors>({});
    const [treeifyError, setTreeifyError] = useState<ValidationTreeifyErrors>({properties: {}, errors: []});

    const validate = (data: z.infer<T>): boolean => {

        const result = schema.safeParse(data);

        if (!result.success) {
            const tree = z.treeifyError(result.error);
            const flattened = z.flattenError(result.error);

            setErrors(flattened.fieldErrors as ValidationFlattenErrors);
            setTreeifyError(tree as ValidationTreeifyErrors);
            return false;
        }


        setErrors({});
        return true;
    };

    return [validate, errors, treeifyError] as const;
};

export const useDirectValidation = <T extends z.ZodTypeAny>(schema: T) => {

    const parse = (data: z.infer<T>) => {

        const result = schema.safeParse(data);

        if (!result.success) {
            const tree = z.treeifyError(result.error);
            const flattened = z.flattenError(result.error);
            const fieldErrors = flattened.fieldErrors as ValidationFlattenErrors;

            return {
                valid: false,
                errors: fieldErrors,
                treeifyError: tree as ValidationTreeifyErrors,
            };
        }

        return {
            valid: true,
            errors: {},
            treeifyError: {properties: {}, errors: []} as ValidationTreeifyErrors,
        };
    };

    return {parse};
};