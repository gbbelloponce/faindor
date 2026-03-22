import { z } from "zod";

import { positiveNumberSchema } from "@/shared/types/schemas";

export const userIdSchema = z.object({
	userId: positiveNumberSchema,
});

export const postIdSchema = z.object({
	postId: positiveNumberSchema,
});

export const updateOrganizationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { error: "Name is required." })
		.max(100)
		.optional(),
	description: z.string().trim().max(500).optional(),
});

export type UserIdBody = z.infer<typeof userIdSchema>;
export type UpdateOrganizationBody = z.infer<typeof updateOrganizationSchema>;
