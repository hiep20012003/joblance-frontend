import {z} from "zod";

export const addReviewSchema = z.object({
    orderId: z.string({message: 'orderId is required'}),
    gigId: z.string({message: 'gigId is required'}),
    reviewerId: z.string({message: 'reviewerId is required'}),
    reviewerUsername: z.string({message: 'reviewerUsername is required'}),
    reviewerPicture: z.string().optional(),
    targetId: z.string({message: 'targetId is required'}),
    targetUsername: z.string({message: 'targetUsername is required'}),
    targetPicture: z.string().optional(),
    review: z.string().min(10, 'Review cannot be empty.').max(2000, 'Review cannot exceed 2000 characters.'),
    rating: z.number().min(1, 'Rating must be at least 1.').max(5, 'Rating cannot be more than 5.'),
    isSeller: z.boolean(), // To determine if the reviewer is a seller or buyer
    country: z.string().optional(),
});
