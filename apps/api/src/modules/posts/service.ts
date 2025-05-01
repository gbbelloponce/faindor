import type { Post, SavedPost } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { db } from "@/shared/db";
import { handleError } from "@/shared/utils/errors";
import type { CreatePostBody, UpdatePostBody } from "./types/request";

/**
 * Given a postId and an organizationId, this function will throw an error if the post is not from the organizationId given.
 * This is mainly used to check if the user is allowed to perform certain actions on the post.
 * @param postId
 * @param organizationId
 */
export const isPostFromOrganization = async (
	postId: number,
	organizationId: number,
): Promise<Post> => {
	try {
		const post = await db.post.findFirst({
			where: {
				id: postId,
				organizationId,
			},
		});

		if (!post) {
			throw new TRPCError({
				message: `You are not allowed to access post with id: ${postId}`,
				code: "UNAUTHORIZED",
			});
		}

		return post;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to check if post with id: ${postId} is from organization with id: ${organizationId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getPostById = async (
	id: number,
	organizationId: number,
): Promise<Post> => {
	try {
		const result = await db.post.findFirst({
			where: {
				id,
				organizationId,
			},
		});

		if (!result) {
			throw new TRPCError({
				message: `There is no post with the id: ${id}`,
				code: "NOT_FOUND",
			});
		}

		return result;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get post by id: ${id}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getLatestsPostsByOrganizationId = async (
	organizationId: number,
	page = 1,
): Promise<Post[]> => {
	try {
		const posts = await db.post.findMany({
			where: {
				organizationId,
			},
			include: {
				author: true,
				likes: true,
				comments: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 10,
			skip: (page - 1) * 10,
		});

		return posts;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get latests posts by organization id: ${organizationId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getLatestsPostsByUserId = async (
	userId: number,
	organizationId: number,
	page = 1,
): Promise<Post[]> => {
	try {
		const posts = await db.post.findMany({
			where: {
				authorId: userId,
				organizationId,
			},
			include: {
				author: true,
				likes: true,
				comments: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 10,
			skip: (page - 1) * 10,
		});

		return posts;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get latests posts by user id: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getLatestsPostsByGroupId = async (
	groupId: number,
	organizationId: number,
	page = 1,
): Promise<Post[]> => {
	try {
		const posts = await db.post.findMany({
			where: {
				groupId,
				organizationId,
			},
			include: {
				author: true,
				likes: true,
				comments: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 10,
			skip: (page - 1) * 10,
		});

		return posts;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get latests posts by group id: ${groupId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const createPost = async (body: CreatePostBody): Promise<Post> => {
	try {
		const post = await db.post.create({
			data: {
				content: body.content,
				groupId: body.groupId,
				organizationId: body.organizationId,
				authorId: body.userId,
			},
		});

		return post;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to create post with content: ${body.content} for user: ${body.userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const updatePost = async (
	body: UpdatePostBody,
	userId: number,
): Promise<Post> => {
	try {
		const post = await db.post.update({
			where: {
				id: body.id,
				authorId: userId,
			},
			data: {
				content: body.content,
			},
		});

		return post;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to update post with id: ${body.id}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const softDeletePost = async (
	postId: number,
	userId: number,
): Promise<Post> => {
	try {
		const post = await db.post.update({
			where: {
				id: postId,
				authorId: userId,
			},
			data: {
				deletedAt: new Date(),
			},
		});

		return post;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to soft delete post with id: ${postId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const savePostById = async (
	postId: number,
	userId: number,
	organizationId: number,
): Promise<SavedPost> => {
	try {
		await isPostFromOrganization(postId, organizationId);

		const savedPost = await db.savedPost.create({
			data: {
				postId,
				userId,
			},
		});

		return savedPost;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to save post with id: ${postId} for user with id: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const unsavePostByPostAndUserId = async (
	postId: number,
	userId: number,
): Promise<SavedPost> => {
	try {
		const savedPost = await db.savedPost.delete({
			where: {
				postId_userId: {
					postId,
					userId,
				},
			},
		});

		return savedPost;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to unsave post with id: ${postId} for user with id: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
