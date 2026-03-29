import { z } from "zod";
import { positiveNumberSchema } from "@/shared/types/schemas";

export const sendMessageSchema = z.object({
	receiverId: positiveNumberSchema,
	content: z
		.string()
		.trim()
		.min(1, { error: "Message cannot be empty." })
		.max(2000),
});

export const getMessagesSchema = z.object({
	partnerId: positiveNumberSchema,
});

export const markAsReadSchema = z.object({
	partnerId: positiveNumberSchema,
});
