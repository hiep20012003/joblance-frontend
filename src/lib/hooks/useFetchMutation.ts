'use client';
import {useState, useCallback} from 'react';
import {parseFetchError} from '@/lib/utils/helper';
import {useToast} from '@/context/ToastContext';
import {ApiError} from '@/lib/utils/api';
import {logInfo, logError, logWithTrace} from '@/lib/utils/devLogger';

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
            logWithTrace('FetchMutation', 'Starting mutation', {args});

            setLoading(true);
            try {
                const result = await action(args as A);

                // 🔹 Log successful mutation
                logInfo('FetchMutation', 'Mutation successful', {result});

                if (!options.disableToast) {
                    addToastByType(options.successMessage ?? 'Success', 'success');
                }

                options.onSuccess?.(result);
                return result;
            } catch (err) {
                const {status, data} = parseFetchError(err);

                // 🔹 Log mutation failure
                logError('FetchMutation', 'Mutation failed', {status, data, error: err});

                if (!options.disableToast) {
                    addToastByStatus(data?.message, status);
                }

                // 🔹 Log unauthorized redirect
                if (options.redirectOnUnauthorized && status === 401) {
                    logInfo('FetchMutation', 'Unauthorized, redirecting', {status});
                    // await logout({ redirectUrl: '/logout' });
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
