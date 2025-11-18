import {z} from 'zod';

export const updateProfileSchema = z.object({
    sex: z.enum(['male', 'female', 'other'], {message: 'Gender must be required'}),
    country: z.string().min(1, {message: 'Country must be required'}),
});


export const avatarSchema = z.object({
    profilePictureFile: z
        .file({message: 'No file selected'})
        .min(1, 'No file selected')
        .max(5 * 1024 * 1024, 'File is too large. Max size is 5MB.')
        .mime(['image/png', 'image/jpeg', 'image/jpg'], 'Invalid file type. Only PNG or JPEG allowed.')
        .nullable(),
});