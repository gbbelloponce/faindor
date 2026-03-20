import { z } from "zod";

export const createOrganizationSchema = z.object({
	name: z.string().min(1).max(100).trim(),
	domain: z
		.string()
		.min(1)
		.max(255)
		.trim()
		.regex(
			/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
			{
				error: "Must be a valid domain (e.g. company.com)",
			},
		),
});

export type CreateOrganizationBody = z.infer<typeof createOrganizationSchema>;
