import z from 'zod';
import {ALL_CHAT_FILE_MIMES, MessageType} from "@/lib/constants/constant";
import {parseArray, parseObject} from "@/lib/utils/helper";

const fileSchema = z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {message: "Maximum file size is 10MB"})
    .refine(
        (file) => ALL_CHAT_FILE_MIMES.includes(file.type),
        {message: "File format not supported"}
    );

export const createMessageSchema = z
    .object({
        senderId: z.string().min(1, 'senderId is required'),
        content: z.string().max(5000).optional(),
        type: z.enum(MessageType).optional().default(MessageType.TEXT),
        metadata: z.record(z.string(), z.any()).optional(),
        attachment: fileSchema.optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type !== MessageType.MEDIA && (!data.content || data.content.trim() === '')) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'content is required unless type is MEDIA',
            });
        }
        if (data.type === MessageType.MEDIA && !data.attachment) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'attachment is required when type is MEDIA',
            });
        }
    });

export const createConversationSchema = z.object({
    participants: z.preprocess(parseArray, z.array(z.string()).length(2)),
    message: z.preprocess(parseObject, createMessageSchema),
});


export type CreateConversationInput = z.infer<typeof createConversationSchema>;
