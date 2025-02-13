import { z } from "zod";

import { authenticatedProcedure, router } from "@shared/trpc";
import { positiveNumberSchema } from "@shared/types/schemas";
import { getCommentsByPostId } from "./service";

export const commentsRouter = router({
	getPostComments: authenticatedProcedure
		.input(
			z.object({ postId: positiveNumberSchema, page: positiveNumberSchema }),
		)
		.query(async ({ input, ctx }) => {
			return await getCommentsByPostId(
				input.postId,
				ctx.user.organizationId,
				input.page,
			);
		}),
});
