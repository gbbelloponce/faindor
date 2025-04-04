import { and, desc, eq, isNull } from "drizzle-orm";

import { validatePostsUserIsFromOrganizationId } from "@/modules/posts/service";
import db from "@/shared/db";
import { Comments } from "@/shared/db/tables/comments";
import { Users } from "@/shared/db/tables/users";
import { checkDBError } from "@/shared/utils/errors";
import { TRPCError } from "@trpc/server";
import type { CreateCommentParams } from "./types/request";

export const getCommentsByPostId = async (
	postId: number,
	organizationId: number,
	page = 1,
) => {
	try {
		const result = db
			.select({
				id: Comments.id,
				content: Comments.content,
				user: {
					id: Users.id,
					name: Users.name,
				},
				createdAt: Comments.createdAt,
				updatedAt: Comments.updatedAt,
			})
			.from(Comments)
			.innerJoin(Users, eq(Comments.userId, Users.id))
			.where(
				and(
					eq(Comments.postId, postId),
					eq(Users.organizationId, organizationId),
					isNull(Comments.repliesTo), // Only get comments and not replies
				),
			)
			.orderBy(desc(Comments.createdAt))
			.groupBy(
				Comments.id,
				Comments.content,
				Users.id,
				Users.name,
				Comments.createdAt,
				Comments.updatedAt,
			)
			.offset((page - 1) * 10)
			.limit(10);

		return result;
	} catch (error) {
		throw checkDBError(error);
	}
};

export const createComment = async (
	{ content, commentId, postId, userId }: CreateCommentParams,
	organizationId: number,
) => {
	try {
		await validatePostsUserIsFromOrganizationId(postId, organizationId);

		const result = await db
			.insert(Comments)
			.values({
				content: content,
				postId: postId,
				userId: userId,
				repliesTo: commentId,
			})
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to create comment with content: ${content}.`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const getRepliesFromComment = async (
	commentId: number,
	organizationId: number,
	page = 1,
) => {
	try {
		const result = db
			.select({
				id: Comments.id,
				content: Comments.content,
				user: {
					id: Users.id,
					name: Users.name,
				},
				createdAt: Comments.createdAt,
				updatedAt: Comments.updatedAt,
			})
			.from(Comments)
			.innerJoin(Users, eq(Comments.userId, Users.id))
			.where(
				and(
					eq(Users.organizationId, organizationId),
					eq(Comments.repliesTo, commentId),
				),
			)
			.orderBy(desc(Comments.createdAt))
			.groupBy(
				Comments.id,
				Comments.content,
				Users.id,
				Users.name,
				Comments.createdAt,
				Comments.updatedAt,
			)
			.offset((page - 1) * 10)
			.limit(10);

		return result;
	} catch (error) {
		throw checkDBError(error);
	}
};
