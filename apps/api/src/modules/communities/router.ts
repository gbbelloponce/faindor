import { authenticatedProcedure, router } from "@shared/trpc";
import { z } from "zod";

import { positiveNumberSchema } from "@shared/types/schemas";
import {
	createCommunity,
	getCommunityById,
	joinCommunity,
	leaveCommunity,
} from "./service";

export const communitiesRouter = router({
	getCommunityById: authenticatedProcedure
		.input(z.object({ communityId: positiveNumberSchema }))
		.query(async ({ input, ctx }) => {
			return await getCommunityById(input.communityId, ctx.user.organizationId);
		}),
	createCommunity: authenticatedProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ input, ctx }) => {
			return await createCommunity(
				input.name,
				ctx.user.id,
				ctx.user.organizationId,
			);
		}),
	joinCommunity: authenticatedProcedure
		.input(z.object({ communityId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			return await joinCommunity(
				input.communityId,
				ctx.user.id,
				ctx.user.organizationId,
			);
		}),
	leaveCommunity: authenticatedProcedure
		.input(z.object({ communityId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			return await leaveCommunity(input.communityId, ctx.user.id);
		}),
});
