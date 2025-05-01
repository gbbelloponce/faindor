import { z } from "zod";

export const createOrganizationSchema = z.object({
	name: z.string(),
	domain: z.string(),
});

export type CreateOrganizationBody = z.infer<typeof createOrganizationSchema>;
