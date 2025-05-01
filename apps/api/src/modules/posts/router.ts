import { z } from "zod";

import { authenticatedProcedure, router } from "@/shared/trpc";
import { positiveNumberSchema } from "@/shared/types/schemas";
import {
	createPost,
	getLatestsPostsByGroupId,
	getLatestsPostsByOrganizationId,
	getLatestsPostsByUserId,
	getPostById,
	savePostById,
	softDeletePost,
	updatePost,
} from "./service";
import { createPostSchema, updatePostSchema } from "./types/request";

export const postsRouter = router({
	getPostById: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.query(async ({ input, ctx }) => {
			const post = await getPostById(input.postId, ctx.user.organizationId);

			return post;
		}),
	getLatestsPosts: authenticatedProcedure
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
	getLatestsPostsByGroupId: authenticatedProcedure
		.input(
			z.object({
				groupId: positiveNumberSchema,
				page: positiveNumberSchema,
			}),
		)
		.query(async ({ input, ctx }) => {
			return await getLatestsPostsByGroupId(
				input.groupId,
				ctx.user.organizationId,
				input.page,
			);
		}),
	createPost: authenticatedProcedure
		.input(createPostSchema)
		.mutation(async ({ input, ctx }) => {
			return await createPost({
				content: input.content,
				groupId: input.groupId,
				organizationId: ctx.user.organizationId,
				userId: ctx.user.id,
			});
		}),
	updatePost: authenticatedProcedure
		.input(updatePostSchema)
		.mutation(async ({ input, ctx }) => {
			return await updatePost(
				{
					id: input.id,
					content: input.content,
				},
				ctx.user.id,
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
