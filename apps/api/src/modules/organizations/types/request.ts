import { z } from "zod";

export const createOrganizationSchema = z.object({
	name: z.string().min(1).max(100).trim(),
	domain: z.string().min(1).max(255).trim(),
});

export type CreateOrganizationBody = z.infer<typeof createOrganizationSchema>;
