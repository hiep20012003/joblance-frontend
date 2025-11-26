'use client'

import React, {ReactNode, useEffect} from 'react';
import ToastContainer from "@/components/shared/ToastContainer";
import {SessionProvider} from "next-auth/react";
import {IAuthDocument} from "@/types/auth";
import {useStatus} from "@/lib/hooks/useStatus";
import {useUserContext} from "@/context/UserContext";
import {useConfig} from "@/lib/hooks/useConfig";

export default function AppProvider({
                                        children,
                                        initialUser,
                                    }: {
    children: ReactNode;
    initialUser: IAuthDocument;
}) {
    useConfig();
    const {setUser, user} = useUserContext();

    useEffect(() => {
        if (initialUser && !user) {
            setUser(initialUser);
        }
    }, [initialUser, setUser, user]);

    useStatus();

    return (
        <SessionProvider>
            <ToastContainer/>
            {children}
        </SessionProvider>
    );
}