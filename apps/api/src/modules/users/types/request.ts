import { z } from "zod";

export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(1, { error: "Name is required" })
		.max(100)
		.trim()
		.optional(),
	bio: z.string().max(300).trim().optional(),
	avatarUrl: z.string().url({ error: "Invalid URL" }).optional().nullable(),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
