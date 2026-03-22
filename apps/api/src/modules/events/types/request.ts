import { z } from "zod";

import { positiveNumberSchema } from "@/shared/types/schemas";

export const createEventSchema = z.object({
	title: z.string().trim().min(1, { error: "Title is required." }).max(100),
	description: z.string().trim().max(2000).optional(),
	startsAt: z.coerce.date(),
	endsAt: z.coerce.date().optional(),
	location: z.string().trim().max(255).optional(),
	onlineUrl: z
		.string()
		.trim()
		.url({ error: "Must be a valid URL." })
		.max(255)
		.optional(),
});

export const rsvpSchema = z.object({
	eventId: positiveNumberSchema,
	status: z.enum(["GOING", "NOT_GOING"]),
});

export type CreateEventBody = z.infer<typeof createEventSchema>;
export type RsvpBody = z.infer<typeof rsvpSchema>;
