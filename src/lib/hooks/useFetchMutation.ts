'use client';
import {useState, useCallback} from 'react';
import {parseFetchError} from '@/lib/utils/helper';
import {useToast} from '@/context/ToastContext';
import {ApiError} from '@/lib/utils/api';

type FetchOptions<T> = {
    successMessage?: string;
    redirectOnUnauthorized?: boolean;
    onSuccess?: (result: T) => void;
    onError?: (err: { status: number; data: ApiError }) => void;
    disableToast?: boolean;
};

/**
 * Generic fetch-mutation hook that wraps async API calls.
 * Handles loading, toasts, error parsing, and unauthorized redirects.
 */
export function useFetchMutation<T, A = void>(
    action: (args: A) => Promise<T>,
    options: FetchOptions<T>
) {
    const {addToastByType, addToastByStatus} = useToast();
    const [loading, setLoading] = useState(false);

    const mutate = useCallback(
        async (args?: A): Promise<T | null> => {

            setLoading(true);
            try {
                const result = await action(args as A);


                if (!options.disableToast) {
                    addToastByType(options.successMessage ?? 'Success', 'success');
                }

                options.onSuccess?.(result);
                return result;
            } catch (err) {
                const {status, data} = parseFetchError(err);

                if (!options.disableToast) {
                    addToastByStatus(data?.message, status);
                }

                if (options.redirectOnUnauthorized && status === 401) {
                    return null;
                }

                options.onError?.({status, data});
                return null;
            } finally {
                setLoading(false);
            }
        },
        [action, addToastByType, addToastByStatus, options]
    );

    return {mutate, loading};
}
