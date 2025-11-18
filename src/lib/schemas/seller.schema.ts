import {z} from 'zod';
import {parseNumber} from "@/lib/utils/helper";

export const sellerCreateSchema = z.object({
    fullName: z.string().min(1, {message: 'Full name is required'}),
    description: z.string().min(1, {message: 'Seller description is required'}),
    oneliner: z.string().min(1, {message: 'Oneliner is required'}),

    skills: z.array(z.string()).min(1, {message: 'Please add at least one skill'}).max(10, {message: 'Maximum 10 tags skills allowed'}),

    languages: z.array(
        z.object({
            language: z.string().min(1, {message: 'Language is required'}),
            level: z.string().min(1, {message: 'Level is required'}),
        })
    ).min(1, {message: 'Please add at least one language'}),

    responseTime: z.preprocess(
        parseNumber,
        z.number()
            .min(1, {message: 'Response time must be at least 1 hour'})
            .max(168, {message: 'Response time cannot exceed 168 hours'}),
    ),

    experience: z.array(
        z.object({
            _id: z.string().optional(),
            company: z.string().min(1, {message: 'Company is required'}),
            title: z.string().min(1, {message: 'Title is required'}),
            startDate: z.string().min(1, {message: 'Start date is required'}),
            endDate: z.string().min(1, {message: 'End date is required'}).optional(),
            description: z.string().min(1, {message: 'Description is required'}),
            currentlyWorkingHere: z.boolean(),
        })).min(1, {message: 'Please add at least one work experience'}),

    education: z.array(
        z.object({
            _id: z.string().optional(),
            country: z.string().min(1, {message: 'Country is required'}),
            university: z.string().min(1, {message: 'University is required'}),
            title: z.string().min(1, {message: 'Title is required'}),
            major: z.string().min(1, {message: 'Major is required'}),
            year: z.number({message: 'Year is required'}).min(1900, {message: 'Year is required'}).max(new Date().getFullYear()),
        })).min(1, {message: 'Please add at least one education'}),

    socialLinks: z.array(z.url()),
    certificates: z.array(
        z.object({
            _id: z.string().optional(),
            name: z.string().min(1, {message: 'Certificate name is required'}),
            from: z.string().min(1, {message: 'Certificate issuer is required'}),
            year: z.number({message: 'Year is required'}).min(1900, {message: 'Certificate Year is required'}).max(new Date().getFullYear()),
        })
    ),
});

export const sellerUpdateSchema = sellerCreateSchema
    .pick({
        fullName: true,
        description: true,
        oneliner: true,
        skills: true,
        languages: true,
        responseTime: true,
        experience: true,
        education: true,
        socialLinks: true,
        certificates: true,
    })

export const sellerBasicInfoSchema = sellerCreateSchema
    .pick({
        fullName: true,
        description: true,
        oneliner: true,
        responseTime: true,
    })
    .partial();

export type SellerCreatePayload = z.infer<typeof sellerCreateSchema>;
export type SellerUpdatePayload = z.infer<typeof sellerUpdateSchema>;
export type SellerBasicInfoPayload = z.infer<typeof sellerBasicInfoSchema>;