import { z } from "zod";

import { getUserById } from "@modules/users/service";
import { authenticatedProcedure, router } from "@shared/trpc";
import { UserRoles } from "@shared/types/roles";
import { positiveNumberSchema } from "@shared/types/schemas";
import { TRPCError } from "@trpc/server";
import {
	createPost,
	getLatestsPostsByOrganizationId,
	getLatestsPostsByUserId,
	getPostById,
	getPostLikes,
	likePost,
	softDeletePost,
	updatePost,
} from "./service";

export const postsRouter = router({
	getPostById: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.query(async ({ input, ctx }) => {
			const post = await getPostById(input.postId);

			if (
				post.user.organizationId !== ctx.user.organizationId &&
				ctx.user.role !== UserRoles.APP_ADMIN
			) {
				throw new TRPCError({
					message: "You are not allowed to see this post.",
					code: "UNAUTHORIZED",
				});
			}

			return post;
		}),
	getFeed: authenticatedProcedure
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
			const userParam = await getUserById(input.userId);

			const organizationId = ctx.user.organizationId;
			const role = ctx.user.role;
			if (
				userParam.organization.id !== organizationId &&
				role !== UserRoles.APP_ADMIN
			) {
				throw new TRPCError({
					message:
						"You are not allowed to see the posts from another organization's user.",
					code: "UNAUTHORIZED",
				});
			}

			return await getLatestsPostsByUserId(input.userId, input.page);
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
			const existingPost = await getPostById(input.postId);
			if (existingPost.user.id !== ctx.user.id) {
				throw new TRPCError({
					message: "You are not allowed to update this post.",
					code: "UNAUTHORIZED",
				});
			}

			return await updatePost({
				id: input.postId,
				content: input.content,
			});
		}),
	softDeletePost: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			const existingPost = await getPostById(input.postId);
			if (
				existingPost.user.id !== ctx.user.id &&
				ctx.user.role !== UserRoles.APP_ADMIN
			) {
				throw new TRPCError({
					message: "You are not allowed to delete this post.",
					code: "UNAUTHORIZED",
				});
			}

			return await softDeletePost(input.postId);
		}),
	likePost: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			const existingPost = await getPostById(input.postId);
			if (existingPost.user.organizationId !== ctx.user.organizationId) {
				throw new TRPCError({
					message: "You are not allowed to like this post.",
					code: "UNAUTHORIZED",
				});
			}

			return await likePost(input.postId, ctx.user.id);
		}),
	getPostLikes: authenticatedProcedure
		.input(
			z.object({ postId: positiveNumberSchema, page: positiveNumberSchema }),
		)
		.query(async ({ input }) => {
			return await getPostLikes(input.postId, input.page);
		}),
});
