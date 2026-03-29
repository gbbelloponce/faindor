import { z } from "zod";
import { positiveNumberSchema } from "@/shared/types/schemas";

export const createCommentSchema = z.object({
	content: z.string().min(1).max(2000).trim(),
	commentId: positiveNumberSchema.optional(),
	postId: positiveNumberSchema,
});

export type CreateCommentBody = z.infer<typeof createCommentSchema>;
