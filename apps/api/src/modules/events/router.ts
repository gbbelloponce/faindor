import { z } from "zod";
import { adminProcedure, authenticatedProcedure, router } from "@/shared/trpc";
import { positiveNumberSchema } from "@/shared/types/schemas";
import { handleError } from "@/shared/utils/errors";
import {
	createEvent,
	getEventById,
	getEvents,
	getUserRsvpForEvent,
	rsvpToEvent,
} from "./service";
import { createEventSchema, rsvpSchema } from "./types/request";

export const eventsRouter = router({
	createEvent: adminProcedure
		.input(createEventSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await createEvent(ctx.user.id, ctx.user.organizationId, input);
			} catch (error) {
				throw handleError(error);
			}
		}),

	getEvents: authenticatedProcedure
		.input(z.object({ page: z.number().int().positive().optional() }))
		.query(async ({ ctx, input }) => {
			try {
				return await getEvents(ctx.user.organizationId, input.page);
			} catch (error) {
				throw handleError(error);
			}
		}),

	getEventById: authenticatedProcedure
		.input(z.object({ eventId: positiveNumberSchema }))
		.query(async ({ ctx, input }) => {
			try {
				return await getEventById(input.eventId, ctx.user.organizationId);
			} catch (error) {
				throw handleError(error);
			}
		}),

	rsvp: authenticatedProcedure
		.input(rsvpSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await rsvpToEvent(ctx.user.id, input);
			} catch (error) {
				throw handleError(error);
			}
		}),

	getMyRsvp: authenticatedProcedure
		.input(z.object({ eventId: positiveNumberSchema }))
		.query(async ({ ctx, input }) => {
			try {
				return await getUserRsvpForEvent(ctx.user.id, input.eventId);
			} catch (error) {
				throw handleError(error);
			}
		}),
});
