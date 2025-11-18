/* ---------------------- Email Verification ----------------------- */
import {fetchApi} from "@/lib/utils/api";
import {ChangePasswordPayload, ResetPasswordPayload, SignUpPayload} from "@/lib/schemas/auth.schema";
import {IAuthDocument} from "@/types/auth";

/* -------------------------- Auth -------------------------- */
export async function signUp(payload: SignUpPayload) {
    return fetchApi("/users", {
        method: 'POST',
        body: JSON.stringify(payload),
        credentials: 'include'
    });
}

export async function verifyEmail(token: string) {
    return fetchApi(`/users/email/verify`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({token}),
    });
}

export async function resendVerificationEmail(email: string) {
    return fetchApi("/users/email/resend", {
        method: 'POST',
        body: JSON.stringify({email}),
        credentials: 'include'
    });
}

/* -------------------------- Password Reset ----------------------- */
export async function forgotPassword(email: string) {
    return fetchApi("/users/security/forgot-password", {
        method: 'POST',
        body: JSON.stringify({email}),
        credentials: 'include'
    });
}

export async function validateResetPasswordToken(token: string) {
    return fetchApi(`/users/security/reset-password/validate`, {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({token}),
    });
}

export async function resetPassword(payload: ResetPasswordPayload) {
    return fetchApi("/users/security/reset-password", {
        method: 'POST',
        body: JSON.stringify(payload),
        credentials: 'include'
    });
}

/* -------------------------- Profile / Session -------------------- */
export async function changePassword(payload: ChangePasswordPayload) {
    return fetchApi("/users/security/change-password", {
        method: 'POST',
        body: JSON.stringify(payload),
        credentials: 'include'
    });
}


export async function getUserById(id: string) {
    return fetchApi<{ user: IAuthDocument }>(`/users/${id}`, {
        credentials: 'include'
    });
}

