import { positiveNumberSchema } from "@/shared/types/schemas";
import { z } from "zod";

export const createCommentSchema = z.object({
	content: z.string().min(1),
	commentId: positiveNumberSchema.optional(),
	postId: positiveNumberSchema,
	userId: positiveNumberSchema,
});

export type CreateCommentBody = z.infer<typeof createCommentSchema>;
