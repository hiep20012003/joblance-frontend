'use client'

import React, {ReactNode, useEffect} from 'react';
import ToastContainer from "@/components/shared/ToastContainer";
import {SessionProvider} from "next-auth/react";
import {IAuthDocument} from "@/types/auth";
import {useStatus} from "@/lib/hooks/useStatus";
import {logInfo} from "@/lib/utils/devLogger";
import {useUserContext} from "@/context/UserContext";


function StatusManager() {

    logInfo('AppProvider', 'StatusManager rendering');

    return null;
}

export default function AppProvider({
                                        children,
                                        initialUser,
                                    }: {
    children: ReactNode;
    initialUser: IAuthDocument;
}) {
    const {setUser, user} = useUserContext();

    useEffect(() => {
        if (initialUser && !user) {
            setUser(initialUser);
        }
    }, [initialUser, setUser, user]);

    useStatus();

    return (
        <SessionProvider>
            <StatusManager/>
            <ToastContainer/>
            {children}
        </SessionProvider>
    );
}