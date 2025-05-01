import { isPostFromOrganization } from "@/modules/posts/service";
import { PAGE_SIZE } from "@/shared/constants";
import { db } from "@/shared/db";
import { handleError } from "@/shared/utils/errors";
import { TRPCError } from "@trpc/server";
import type { CreateCommentBody } from "./types/request";

export const getCommentsByPostId = async (
	postId: number,
	organizationId: number,
	page = 1,
) => {
	try {
		const comments = await db.comment.findMany({
			include: {
				replies: true,
			},
			where: {
				postId,
				post: {
					organizationId,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: PAGE_SIZE,
			skip: (page - 1) * PAGE_SIZE,
		});

		return comments;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get comments by post id: ${postId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const createComment = async (
	body: CreateCommentBody,
	organizationId: number,
) => {
	try {
		await isPostFromOrganization(body.postId, organizationId);

		const comment = await db.comment.create({
			data: {
				content: body.content,
				postId: body.postId,
				authorId: body.userId,
				...(body.commentId && { repliesToId: body.commentId }),
			},
		});

		if (!comment) {
			throw new TRPCError({
				message: `Failed to create comment with content: ${body.content}.`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return comment;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to create comment with content: ${body.content} for post id: ${body.postId}.`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
