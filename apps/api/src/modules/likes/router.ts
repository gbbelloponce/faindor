import { z } from "zod";

import { authenticatedProcedure, router } from "@/shared/trpc";
import { positiveNumberSchema } from "@/shared/types/schemas";
import { createLike, deleteLike, getLikesByPostId } from "./service";

export const likesRouter = router({
	createLike: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			return await createLike(
				input.postId,
				ctx.user.id,
				ctx.user.organizationId,
			);
		}),
	deleteLike: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			return await deleteLike(input.postId, ctx.user.id);
		}),
	getLikesByPostId: authenticatedProcedure
		.input(
			z.object({ postId: positiveNumberSchema, page: positiveNumberSchema }),
		)
		.query(async ({ input, ctx }) => {
			return await getLikesByPostId(
				input.postId,
				ctx.user.organizationId,
				input.page,
			);
		}),
});
