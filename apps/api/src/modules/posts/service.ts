import { desc, eq } from "drizzle-orm";

import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { Posts } from "@shared/db/tables/posts";
import { Users } from "@shared/db/tables/users";
import { parseDBError } from "@shared/utils/errors";
import { TRPCError } from "@trpc/server";
import type { CreatePostParams, UpdatePostParams } from "./types/request";

export const getPostById = async (id: number) => {
	try {
		const result = await db
			.select({
				id: Posts.id,
				content: Posts.content,
				userId: Posts.userId,
			})
			.from(Posts)
			.where(eq(Posts.id, id));

		if (!result.length) return null;

		return result[0];
	} catch (error) {
		throw parseDBError(error);
	}
};

export const getLatestsPosts = async (page = 1) => {
	try {
		const result = await db
			.select({
				id: Posts.id,
				content: Posts.content,
				user: {
					id: Users.id,
					name: Users.name,
					email: Users.email,
				},
				organization: {
					id: Organizations.id,
					domain: Organizations.domain,
				},
				createdAt: Posts.createdAt,
				updatedAt: Posts.updatedAt,
				deletedAt: Posts.deletedAt,
			})
			.from(Posts)
			.innerJoin(Users, eq(Posts.userId, Users.id))
			.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
			.orderBy(desc(Posts.createdAt))
			.offset((page - 1) * 10) // Get 10 posts per page, skip the other ones
			.limit(10);

		return result;
	} catch (error) {
		throw parseDBError(error);
	}
};

export const getLatestsPostsByUserId = async (userId: number, page = 1) => {
	try {
		const result = await db
			.select({
				id: Posts.id,
				content: Posts.content,
				user: {
					id: Users.id,
					name: Users.name,
					email: Users.email,
				},
				createdAt: Posts.createdAt,
				updatedAt: Posts.updatedAt,
				deletedAt: Posts.deletedAt,
			})
			.from(Posts)
			.innerJoin(Users, eq(Posts.userId, Users.id))
			.where(eq(Users.id, userId))
			.orderBy(desc(Posts.createdAt))
			.offset((page - 1) * 10) // Get 10 posts per page, skip the other ones
			.limit(10);

		return result;
	} catch (error) {
		throw parseDBError(error);
	}
};

export const getLatestsPostsByDomain = async (domain: string, page = 1) => {
	try {
		const result = await db
			.select({
				id: Posts.id,
				content: Posts.content,
				user: {
					id: Users.id,
					name: Users.name,
					email: Users.email,
				},
				createdAt: Posts.createdAt,
				updatedAt: Posts.updatedAt,
				deletedAt: Posts.deletedAt,
			})
			.from(Posts)
			.innerJoin(Users, eq(Posts.userId, Users.id))
			.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
			.where(eq(Organizations.domain, domain))
			.orderBy(desc(Posts.createdAt))
			.groupBy(
				Posts.id,
				Posts.content,
				Users.id,
				Users.name,
				Users.email,
				Posts.createdAt,
				Posts.updatedAt,
				Posts.deletedAt,
			)
			.offset((page - 1) * 10) // Get 10 posts per page, skip the other ones
			.limit(10);

		return result;
	} catch (error) {
		throw parseDBError(error);
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
		throw parseDBError(error);
	}
};

export const updatePost = async (post: UpdatePostParams) => {
	try {
		const result = await db
			.update(Posts)
			.set({
				content: post.content,
				updatedAt: new Date(),
			})
			.where(eq(Posts.id, post.id))
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to update post with id: ${post.id}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw parseDBError(error);
	}
};

export const softDeletePost = async (postId: number) => {
	try {
		const result = await db
			.update(Posts)
			.set({
				deletedAt: new Date(),
			})
			.where(eq(Posts.id, postId))
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to delete post with id: ${postId}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw parseDBError(error);
	}
};
