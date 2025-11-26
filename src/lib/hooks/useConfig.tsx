'use client'

import {getConfig} from "@/lib/services/server/env.server";
import {useEffect} from "react";

export const appConfig : Record<string, any> = {};

export function useConfig() {

    useEffect(() => {
        async function fetchConfig() {
            const result = await getConfig();
            for (const [key, value] of Object.entries(result)) {
                appConfig[key] = value;
            }
        }

        fetchConfig();
        console.log(appConfig);
    }, [])
}