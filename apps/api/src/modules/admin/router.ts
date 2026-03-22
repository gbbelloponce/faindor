import { adminProcedure, router } from "@/shared/trpc";
import { positiveNumberSchema } from "@/shared/types/schemas";
import { handleError } from "@/shared/utils/errors";
import { z } from "zod";
import {
	activateUser,
	adminDeletePost,
	deleteUser,
	getOrgPostsForModeration,
	getOrgUsers,
	promoteToAdmin,
	revokeAdmin,
	suspendUser,
	updateOrganization,
} from "./service";
import {
	postIdSchema,
	updateOrganizationSchema,
	userIdSchema,
} from "./types/request";

export const adminRouter = router({
	getUsers: adminProcedure
		.input(z.object({ page: z.number().int().positive().optional() }))
		.query(async ({ ctx, input }) => {
			try {
				return await getOrgUsers(ctx.user.organizationId, input.page);
			} catch (error) {
				throw handleError(error);
			}
		}),

	suspendUser: adminProcedure
		.input(userIdSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await suspendUser(
					ctx.user.id,
					input.userId,
					ctx.user.organizationId,
				);
			} catch (error) {
				throw handleError(error);
			}
		}),

	activateUser: adminProcedure
		.input(userIdSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await activateUser(input.userId, ctx.user.organizationId);
			} catch (error) {
				throw handleError(error);
			}
		}),

	deleteUser: adminProcedure
		.input(userIdSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await deleteUser(
					ctx.user.id,
					input.userId,
					ctx.user.organizationId,
				);
			} catch (error) {
				throw handleError(error);
			}
		}),

	promoteToAdmin: adminProcedure
		.input(userIdSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await promoteToAdmin(input.userId, ctx.user.organizationId);
			} catch (error) {
				throw handleError(error);
			}
		}),

	revokeAdmin: adminProcedure
		.input(userIdSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await revokeAdmin(
					ctx.user.id,
					input.userId,
					ctx.user.organizationId,
				);
			} catch (error) {
				throw handleError(error);
			}
		}),

	updateOrganization: adminProcedure
		.input(updateOrganizationSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await updateOrganization(ctx.user.organizationId, input);
			} catch (error) {
				throw handleError(error);
			}
		}),

	getPosts: adminProcedure
		.input(z.object({ page: z.number().int().positive().optional() }))
		.query(async ({ ctx, input }) => {
			try {
				return await getOrgPostsForModeration(
					ctx.user.organizationId,
					input.page,
				);
			} catch (error) {
				throw handleError(error);
			}
		}),

	deletePost: adminProcedure
		.input(postIdSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await adminDeletePost(input.postId, ctx.user.organizationId);
			} catch (error) {
				throw handleError(error);
			}
		}),
});
