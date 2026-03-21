import { positiveNumberSchema } from "@/shared/types/schemas";
import { z } from "zod";

export const createPostSchema = z.object({
	content: z.string().min(1).max(5000).trim(),
	groupId: z.number().optional(),
	imageUrl: z.string().url({ error: "Invalid URL" }).optional().nullable(),
});

export const updatePostSchema = z.object({
	id: positiveNumberSchema,
	content: z.string().min(1).max(5000).trim(),
});

export type CreatePostBody = {
	content: string;
	groupId?: number;
	imageUrl?: string | null;
	organizationId: number;
	userId: number;
};

export type UpdatePostBody = {
	id: number;
	content: string;
};

export type PostWithAuthorAndCounts = {
	id: number;
	content: string;
	imageUrl: string | null;
	organizationId: number;
	authorId: number;
	groupId: number | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	author: {
		id: number;
		name: string;
		email: string;
		role: string;
		active: boolean;
		organizationId: number;
		createdAt: Date;
		deletedAt: Date | null;
	};
	_count: {
		likes: number;
		comments: number;
	};
	isLikedByUser: boolean;
};
