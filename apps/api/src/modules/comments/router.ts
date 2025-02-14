import { z } from "zod";

import { authenticatedProcedure, router } from "@shared/trpc";
import { positiveNumberSchema } from "@shared/types/schemas";
import {
	createComment,
	getCommentsByPostId,
	getRepliesFromComment,
} from "./service";
import { createCommentSchema } from "./types/request";

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
	createComment: authenticatedProcedure
		.input(createCommentSchema)
		.mutation(async ({ input, ctx }) => {
			return await createComment(input, ctx.user.organizationId);
		}),
	getCommentReplies: authenticatedProcedure
		.input(
			z.object({ commentId: positiveNumberSchema, page: positiveNumberSchema }),
		)
		.query(async ({ input, ctx }) => {
			return await getRepliesFromComment(
				input.commentId,
				ctx.user.organizationId,
				input.page,
			);
		}),
});
