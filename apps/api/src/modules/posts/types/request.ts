import { z } from "zod";

export const createPostSchema = z.object({
	content: z.string().min(1),
});

export const updatePostSchema = z.object({
	content: z.string().min(1),
});

export type CreatePostParams = {
	content: string;
	communityId?: number;
	userId: number;
};

export type UpdatePostParams = {
	id: number;
	content: string;
};
