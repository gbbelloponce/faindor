import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";

import db from "@shared/db";
import { Likes } from "@shared/db/tables/likes";
import { Posts } from "@shared/db/tables/posts";
import { SavedPosts } from "@shared/db/tables/savedPosts";
import { Users } from "@shared/db/tables/users";
import { checkDBError } from "@shared/utils/errors";
import type { CreatePostParams, UpdatePostParams } from "./types/request";

/**
 * Given a postId and an organizationId, this function will throw an error if the post's user is not from the organizationId given.
 * @param postId
 * @param organizationId
 */
export const validatePostsUserIsFromOrganizationId = async (
	postId: number,
	organizationId: number,
) => {
	try {
		const result = await db
			.select({
				id: Posts.id,
			})
			.from(Posts)
			.innerJoin(Users, eq(Posts.userId, Users.id))
			.where(
				and(eq(Posts.id, postId), eq(Users.organizationId, organizationId)),
			);

		if (!result.length) {
			throw new TRPCError({
				message: `You are not allowed to access post with id: ${postId}`,
				code: "UNAUTHORIZED",
			});
		}
	} catch (error) {
		throw checkDBError(error);
	}
};

export const getPostById = async (id: number, organizationId: number) => {
	try {
		const result = await db
			.select({
				id: Posts.id,
				content: Posts.content,
				likesCount: count(Likes.id),
				user: {
					id: Users.id,
					organizationId: Users.organizationId,
				},
			})
			.from(Posts)
			.innerJoin(Users, eq(Posts.userId, Users.id))
			.leftJoin(Likes, eq(Posts.id, Likes.postId))
			.where(and(eq(Posts.id, id), eq(Users.organizationId, organizationId)));

		if (!result.length) {
			throw new TRPCError({
				message: `There is no post with the id: ${id}`,
				code: "NOT_FOUND",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const getLatestsPostsByUserId = async (
	userId: number,
	organizationId: number,
	page = 1,
) => {
	try {
		const result = await db
			.select({
				id: Posts.id,
				content: Posts.content,
				likesCount: count(Likes.id),
				user: {
					id: Users.id,
					name: Users.name,
				},
				createdAt: Posts.createdAt,
				updatedAt: Posts.updatedAt,
				deletedAt: Posts.deletedAt,
			})
			.from(Posts)
			.innerJoin(Users, eq(Posts.userId, Users.id))
			.leftJoin(Likes, eq(Posts.id, Likes.postId))
			.where(
				and(eq(Users.id, userId), eq(Users.organizationId, organizationId)),
			)
			.groupBy(
				Posts.id,
				Posts.content,
				Users.id,
				Users.name,
				Posts.createdAt,
				Posts.updatedAt,
				Posts.deletedAt,
			)
			.orderBy(desc(Posts.createdAt))
			.offset((page - 1) * 10) // Get 10 posts per page, skip the other ones
			.limit(10);

		return result;
	} catch (error) {
		throw checkDBError(error);
	}
};

export const getLatestsPostsByOrganizationId = async (
	organizationId: number,
	page = 1,
) => {
	try {
		const result = await db
			.select({
				id: Posts.id,
				content: Posts.content,
				likesCount: count(Likes.id),
				user: {
					id: Users.id,
					name: Users.name,
				},
				createdAt: Posts.createdAt,
				updatedAt: Posts.updatedAt,
				deletedAt: Posts.deletedAt,
			})
			.from(Posts)
			.innerJoin(Users, eq(Posts.userId, Users.id))
			.leftJoin(Likes, eq(Posts.id, Likes.postId))
			.where(eq(Users.organizationId, organizationId))
			.orderBy(desc(Posts.createdAt))
			.groupBy(
				Posts.id,
				Posts.content,
				Users.id,
				Users.name,
				Posts.createdAt,
				Posts.updatedAt,
				Posts.deletedAt,
			)
			.offset((page - 1) * 10) // Get 10 posts per page, skip the other ones
			.limit(10);

		return result;
	} catch (error) {
		throw checkDBError(error);
	}
};

export const createPost = async (post: CreatePostParams) => {
	try {
		const result = await db
			.insert(Posts)
			.values({
				content: post.content,
				userId: post.userId,
			})
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to create post with content: ${post.content} for user: ${post.userId}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const updatePost = async (post: UpdatePostParams, userId: number) => {
	try {
		const result = await db
			.update(Posts)
			.set({
				content: post.content,
				updatedAt: new Date(),
			})
			.where(and(eq(Posts.id, post.id), eq(Posts.userId, userId)))
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to update post with id: ${post.id}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const softDeletePost = async (postId: number, userId: number) => {
	try {
		const result = await db
			.update(Posts)
			.set({
				deletedAt: new Date(),
			})
			.where(and(eq(Posts.id, postId), eq(Posts.userId, userId)))
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to soft delete post with id: ${postId}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const savePostById = async (
	postId: number,
	userId: number,
	organizationId: number,
) => {
	try {
		await validatePostsUserIsFromOrganizationId(postId, organizationId);

		const result = await db
			.insert(SavedPosts)
			.values({ postId, userId })
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to save post with id: ${postId}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};
