import {
    SignInPayload,
} from "@/lib/schemas/auth.schema";
import {signIn as nextAuthSignIn} from 'next-auth/react';
import {redirect} from "next/navigation";
import {fetchApi} from "@/lib/utils/api";

export async function signIn(payload: SignInPayload) {
    const result = await nextAuthSignIn("credentials", {
        ...payload,
        redirect: false,
    });

    if (result?.error) {
        throw new Error(result.code);
    }

    return result;
}

export async function logout({redirectUrl}: { redirectUrl: string }): Promise<void> {
    try {
        await fetchApi("/auth/logout", {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.log(error);
    } finally {
        if (redirectUrl) {
            redirect(redirectUrl);
        }
    }
}
