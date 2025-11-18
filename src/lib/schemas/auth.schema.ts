import {z} from 'zod';

export const signUpSchema = z.object({
    username: z
        .string()
        .min(3, {message: 'Username must be at least 3 characters long'})
        .max(30, {message: 'Username must not exceed 30 characters'})
        .regex(/^\S*$/, {message: 'Username cannot contain spaces'}),

    email: z.email('Invalid email address'),
    sex: z.enum(['male', 'female', 'other'], {message: 'Gender must be required'}),
    country: z.string().min(1, {message: 'Country must be required'}),
    password: z.string().min(6, {message: 'Password must be at least 6 characters long'}),
    confirmPassword: z.string().min(6, {message: 'Confirm password is required'})
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});

export const signInSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    browserName: z.string().optional().nullable(),
    deviceType: z.string().optional().nullable(),
});


export const resetPasswordSchema = z
    .object({
        token: z.string().min(1),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        confirmPassword: z.string().min(1, 'Confirm password is required')
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    });


export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
        confirmNewPassword: z.string().min(1, 'Confirm new password is required')
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'New passwords do not match',
        path: ['confirmNewPassword']
    });


export type SignUpPayload = z.infer<typeof signUpSchema>;
export type SignInPayload = z.infer<typeof signInSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;