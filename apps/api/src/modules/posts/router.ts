import { z } from "zod";

import { authenticatedProcedure, router } from "@shared/trpc";
import { positiveNumberSchema } from "@shared/types/schemas";
import {
	createPost,
	getLatestsPostsByOrganizationId,
	getLatestsPostsByUserId,
	getPostById,
	savePostById,
	softDeletePost,
	updatePost,
} from "./service";

export const postsRouter = router({
	getPostById: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.query(async ({ input, ctx }) => {
			const post = await getPostById(input.postId, ctx.user.organizationId);

			return post;
		}),
	getLatestsPostsByOrganizationId: authenticatedProcedure
		.input(z.object({ page: positiveNumberSchema }))
		.query(async ({ input, ctx }) => {
			return await getLatestsPostsByOrganizationId(
				ctx.user.organizationId,
				input.page,
			);
		}),
	getLatestsPostsByUserId: authenticatedProcedure
		.input(
			z.object({
				userId: positiveNumberSchema,
				page: positiveNumberSchema,
			}),
		)
		.query(async ({ input, ctx }) => {
			return await getLatestsPostsByUserId(
				input.userId,
				ctx.user.organizationId,
				input.page,
			);
		}),
	createPost: authenticatedProcedure
		.input(z.object({ content: z.string().min(1) }))
		.mutation(async ({ input, ctx }) => {
			return await createPost({
				content: input.content,
				userId: ctx.user.id,
			});
		}),
	updatePost: authenticatedProcedure
		.input(
			z.object({ postId: positiveNumberSchema, content: z.string().min(1) }),
		)
		.mutation(async ({ input, ctx }) => {
			return await updatePost(
				{
					id: input.postId,
					content: input.content,
				},
				ctx.user.organizationId,
			);
		}),
	softDeletePost: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			return await softDeletePost(input.postId, ctx.user.id);
		}),
	savePostById: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			return await savePostById(
				input.postId,
				ctx.user.id,
				ctx.user.organizationId,
			);
		}),
});
