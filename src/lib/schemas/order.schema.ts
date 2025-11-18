import {z} from "zod";
import {parseArray} from "@/lib/utils/helper";
import {ALL_GIG_DELIVERY_MIMES, NegotiationType} from "@/lib/constants/constant";

const fileSchema = z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {message: "Maximum file size is 10MB"})
    .refine(
        (file) => ALL_GIG_DELIVERY_MIMES.includes(file.type),
        {message: "File format not supported"}
    );

export const submitOrderRequirementsSchema = z
    .object({
        requirements: z.preprocess(
            parseArray,
            z
                .array(
                    z.object({
                        requirementId: z.string().min(1, {message: "requirementId is required"}),
                        question: z.string().min(1, {message: "Question is required"}).max(500),
                        answerText: z.string().max(2500).optional(),
                        answered: z.boolean().default(false),
                        hasFile: z.boolean().default(false),
                        required: z.boolean().default(false),
                    })
                )
                .min(1, {message: "At least one requirement must be submitted"})
        ),

        requirementFiles: z.array(fileSchema).max(10, {message: "Maximum 10 files allowed"}).optional(),
    })
    .superRefine((data, ctx) => {
        const {requirements, requirementFiles} = data;
        const uploadedCount = requirementFiles?.length ?? 0;
        const requiredWithFile = requirements.filter((r) => r.required && r.hasFile);

        for (const req of requirements) {
            if (req.required && !req.hasFile && (!req.answerText || req.answerText.trim() === "")) {
                ctx.addIssue({
                    path: ["requirements", req.requirementId],
                    message: "Missing answer for required question",
                    code: 'custom',
                });
            }
        }

        if (uploadedCount < requiredWithFile.length) {
            const missingFileReqs = requiredWithFile.slice(uploadedCount);
            missingFileReqs.forEach((req) => {
                ctx.addIssue({
                    path: ["requirements", req.requirementId],
                    message: "Missing file for required question",
                    code: 'custom',
                });
            });
        }
    });

export const deliveryOrderSchema = z.object({
    message: z.string().min(5, {message: "Delivery message must be at least 5 characters"}).max(500, {message: "Delivery message cannot exceed 500 characters"}),
    deliveryFiles: z.array(fileSchema).min(1, {message: "Please provide least 1 file"}).max(5, {message: "Maximum 5 files allowed"}).optional(),
});


const negotiationTypeEnum = z.enum(Object.values(NegotiationType));
const requesterRoleEnum = z.enum(['seller', 'buyer']);

export const extendDeliveryPayloadSchema = z.object({
    newDeliveryDays: z.number().int().positive('New delivery days must be a positive integer.'),
    originalDeliveryDate: z.union([z.string().datetime(), z.date()]).optional(),
});

export const cancelOrderPayloadSchema = z.object({
    reason: z.string().min(10, 'Cancellation reason must be at least 10 characters long.'),
});

export const modifyOrderPayloadSchema = z
    .object({
        newPrice: z.number().positive('New price must be a positive number.').optional(),
        newScopeDescription: z.string().min(20, 'New scope description must be more detailed.').optional(),
    })
    .refine(
        (data) => data.newPrice !== undefined || data.newScopeDescription !== undefined,
        {
            message: 'You must provide either a new price or a new scope description.',
        }
    );

export const createNegotiationSchema = z.object({
    orderId: z.string({message: 'orderId is required'}),
    type: negotiationTypeEnum,
    requesterId: z.string({message: 'requesterId is required'}),
    requesterRole: requesterRoleEnum,
    message: z
        .string()
        .min(5, 'Please provide a message with at least 5 characters.')
        .max(2000, 'Your message cannot exceed 2000 characters.'),
    payload: z.any(),
}).superRefine((data, ctx) => {

    let validationSchema: z.ZodSchema | null = null;

    // 1. Dựa vào Type, chọn Schema Payload tương ứng
    switch (data.type) {
        case NegotiationType.EXTEND_DELIVERY:
            validationSchema = extendDeliveryPayloadSchema;
            break;
        case NegotiationType.CANCEL_ORDER:
            validationSchema = cancelOrderPayloadSchema;
            break;
        case NegotiationType.MODIFY_ORDER:
            validationSchema = modifyOrderPayloadSchema;
            break;
        default:
            return;
    }

    const result = validationSchema.safeParse(data.payload);

    if (!result.success) {
        result.error.issues.forEach(issue => {
            const path = ['payload', ...issue.path];
            ctx.addIssue({
                code: 'custom',
                message: issue.message,
                path: path,
            });
        });
    }
});
