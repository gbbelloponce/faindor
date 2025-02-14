import { z } from "zod";

export const createOrganizationSchema = z.object({
	name: z.string(),
	domain: z.string(),
});

export type CreateOrganizationParams = z.infer<typeof createOrganizationSchema>;
