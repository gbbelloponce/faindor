import { z } from "zod";

import { getUserById } from "@modules/users/service";
import { authenticatedProcedure, router } from "@shared/trpc";
import { UserRoles } from "@shared/types/roles";
import { positiveNumberSchema } from "@shared/types/schemas";
import { TRPCError } from "@trpc/server";
import {
	createPost,
	getLatestsPosts,
	getLatestsPostsByDomain,
	getLatestsPostsByUserId,
	getPostById,
	softDeletePost,
	updatePost,
} from "./service";

export const postsRouter = router({
	getPostById: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.query(async ({ input }) => {
			return await getPostById(input.postId);
		}),
	getAdminFeed: authenticatedProcedure
		.input(z.object({ page: positiveNumberSchema }))
		.query(async ({ input }) => {
			// TODO: Get role from logged user
			const role = undefined;
			if (role !== UserRoles.APP_ADMIN) {
				throw new TRPCError({
					message: "You are not allowed to see posts from another organization",
					code: "UNAUTHORIZED",
				});
			}

			return await getLatestsPosts(input.page);
		}),
	getFeed: authenticatedProcedure
		.input(z.object({ page: positiveNumberSchema }))
		.query(async ({ input }) => {
			// TODO: Get domain from logged user
			const domain = undefined;

			return await getLatestsPostsByDomain(domain ?? "TODO", input.page);
		}),
	getLatestsPostsByUserId: authenticatedProcedure
		.input(
			z.object({
				userId: positiveNumberSchema,
				page: positiveNumberSchema,
			}),
		)
		.query(async ({ input }) => {
			const userParam = await getUserById(input.userId);
			if (!userParam) {
				throw new TRPCError({
					message: `User not found with id: ${input.userId}`,
					code: "NOT_FOUND",
				});
			}

			// TODO: Get domain and role from logged user
			const domain = undefined;
			const role = undefined;
			if (
				userParam.organization.domain !== domain &&
				role !== UserRoles.APP_ADMIN
			) {
				throw new TRPCError({
					message:
						"You are not allowed to see the posts from another organization's user",
					code: "UNAUTHORIZED",
				});
			}

			return await getLatestsPostsByUserId(input.userId, input.page);
		}),
	createPost: authenticatedProcedure
		.input(z.object({ content: z.string().min(1) }))
		.mutation(async ({ input }) => {
			// TODO: Get id from logged user

			return await createPost({
				content: input.content,
				userId: -1,
			});
		}),
	updatePost: authenticatedProcedure
		.input(
			z.object({ postId: positiveNumberSchema, content: z.string().min(1) }),
		)
		.mutation(async ({ input }) => {
			// TODO: Check if logged user is owner

			return await updatePost({
				id: input.postId,
				content: input.content,
			});
		}),
	softDeletePost: authenticatedProcedure
		.input(z.object({ postId: positiveNumberSchema }))
		.mutation(async ({ input }) => {
			// TODO: Check if logged user is owner or admin

			return await softDeletePost(input.postId);
		}),
});
