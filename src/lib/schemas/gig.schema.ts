import {z} from 'zod';
import {parseArray, parseNumber} from "@/lib/utils/helper";

export const requirementQuestionSchema = z.preprocess(
    parseArray,
    z.array(
        z.object({
            question: z.string()
                .min(1, {message: 'Question is required'})
                .max(500, {message: 'Question must be at most 500 characters'}),
            hasFile: z.boolean().default(false),
            required: z.boolean().default(false),
        })
    )
        .min(1, {message: 'At least one requirement must be submitted'})
)
    .refine((arr) => {
        if (arr.length === 1) {
            return arr[0].required;
        }
        return true;
    }, {
        message: 'If there is only one requirement, it must be required',
        path: [0, 'required'],
    });

export const gigCreateSchema = z.object({
    sellerId: z.string().nonempty({message: 'User is required'}),
    email: z.string().nonempty({message: 'User is required'}),
    username: z.string().nonempty({message: 'User is required'}),

    profilePicture: z.string().nonempty({message: 'Profile picture is required'}),
    title: z.string().nonempty({message: 'Gig title is required'}),
    description: z.string().nonempty({message: 'Gig description is required'}),
    categories: z.string().nonempty({message: 'Gig category is required'}),

    subCategories: z.preprocess(
        parseArray,
        z.array(z.string()).min(1, {message: 'Please add at least one subcategory'})
    ),

    tags: z.preprocess(
        parseArray,
        z.array(z.string()).min(1, {message: 'Please add at least one tag'})),

    requirements: requirementQuestionSchema,

    // currency: z.string().min(3, {message: 'Currency must be required.'}).max(3),

    price: z.preprocess(
        parseNumber,
        z.number().gt(4.99, {message: 'Gig price must be greater than $4.99'})
    ),

    coverImageFile: z
        .file({message: 'Cover image is required'})
        .min(1, {message: 'File is required'})
        .max(10 * 1024 * 1024, {message: 'Maximum file size is 10MB'})
        .mime(['image/png', 'image/jpg', 'image/jpeg', 'image/webp'], {
            message: 'Only PNG, JPG, JPEG, or WEBP formats are allowed',
        }),


    expectedDeliveryDays: z.preprocess(
        parseNumber,
        z.number()
            .min(1, {message: 'Expected delivery must be at least 1 day'})
            .max(365, {message: 'Expected delivery cannot exceed 365 days'}),
    ),
    basicTitle: z.string().nonempty({message: 'Gig basic title is required'}),
    basicDescription: z.string().nonempty({message: 'Gig basic description is required'}),
});

export const gigUpdateSchema = gigCreateSchema
    .pick({
        title: true,
        description: true,
        categories: true,
        subCategories: true,
        tags: true,
        price: true,
        coverImageFile: true,
        expectedDeliveryDays: true,
        basicTitle: true,
        basicDescription: true,
        requirements: true,
    }).partial();

export type GigCreatePayload = z.infer<typeof gigCreateSchema>;
export type GigUpdatePayload = z.infer<typeof gigUpdateSchema>;
