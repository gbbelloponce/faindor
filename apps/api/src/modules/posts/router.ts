import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { getUserById } from "@modules/users/service";
import { AuthorizationError, NotFoundError } from "@shared/types/errors";
import { UserRoles } from "@shared/types/roles";
import { positiveNumberSchema } from "@shared/types/schemas";
import {
	createPost,
	getLatestsPosts,
	getLatestsPostsByDomain,
	getLatestsPostsByUserId,
	getPostById,
	softDeletePost,
	updatePost,
} from "./service";

const t = initTRPC.create();

export const postsRouter = t.router({
	getPostById: t.procedure
		.input(z.object({ postId: positiveNumberSchema }))
		.query(async ({ input }) => {
			return await getPostById(input.postId);
		}),
	getAdminFeed: t.procedure
		.input(z.object({ page: positiveNumberSchema }))
		.query(async ({ input }) => {
			// TODO: Get role from logged user
			const role = undefined;
			if (role !== UserRoles.APP_ADMIN) {
				throw new AuthorizationError(
					"You are not allowed to see posts from another organization",
				);
			}

			return await getLatestsPosts(input.page);
		}),
	getFeed: t.procedure
		.input(z.object({ page: positiveNumberSchema }))
		.query(async ({ input }) => {
			// TODO: Get domain from logged user
			const domain = undefined;

			return await getLatestsPostsByDomain(domain ?? "TODO", input.page);
		}),
	getLatestsPostsByUserId: t.procedure
		.input(
			z.object({
				userId: positiveNumberSchema,
				page: positiveNumberSchema,
			}),
		)
		.query(async ({ input }) => {
			const userParam = await getUserById(input.userId);
			if (!userParam) {
				throw new NotFoundError(`User not found with id: ${input.userId}`);
			}

			// TODO: Get domain and role from logged user
			const domain = undefined;
			const role = undefined;
			if (
				userParam.organization.domain !== domain &&
				role !== UserRoles.APP_ADMIN
			) {
				throw new AuthorizationError(
					"You are not allowed to see the posts from another organization's user",
				);
			}

			return await getLatestsPostsByUserId(input.userId, input.page);
		}),
	createPost: t.procedure
		.input(z.object({ content: z.string().min(1) }))
		.mutation(async ({ input }) => {
			// TODO: Get id from logged user

			return await createPost({
				content: input.content,
				userId: -1,
			});
		}),
	updatePost: t.procedure
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
	softDeletePost: t.procedure
		.input(z.object({ postId: positiveNumberSchema }))
		.mutation(async ({ input }) => {
			// TODO: Check if logged user is owner or admin

			return await softDeletePost(input.postId);
		}),
});
