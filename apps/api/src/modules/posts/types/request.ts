import { positiveNumberSchema } from "@/shared/types/schemas";
import { z } from "zod";

export const createPostSchema = z.object({
	content: z.string().min(1).max(5000).trim(),
	groupId: z.number().optional(),
});

export const updatePostSchema = z.object({
	id: positiveNumberSchema,
	content: z.string().min(1).max(5000).trim(),
});

export type CreatePostBody = {
	content: string;
	groupId?: number;
	organizationId: number;
	userId: number;
};

export type UpdatePostBody = {
	id: number;
	content: string;
};
