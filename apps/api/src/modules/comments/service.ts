import { TRPCError } from "@trpc/server";
import { createNotification } from "@/modules/notifications/service";
import { isPostFromOrganization } from "@/modules/posts/service";
import { db } from "@/shared/db";
import { NotificationType } from "@/shared/db/generated/prisma/client";
import { handleError } from "@/shared/utils/errors";
import { getPaginationArgs } from "@/shared/utils/pagination";
import type { CreateCommentBody } from "./types/request";

export const getCommentsByPostId = async (
	postId: number,
	organizationId: number,
	page = 1,
) => {
	try {
		const comments = await db.comment.findMany({
			include: {
				author: { select: { id: true, name: true } },
				replies: {
					include: { author: { select: { id: true, name: true } } },
					where: { deletedAt: null },
				},
			},
			where: {
				postId,
				deletedAt: null,
				post: {
					organizationId,
					deletedAt: null,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			...getPaginationArgs(page),
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
	userId: number,
	organizationId: number,
) => {
	try {
		const post = await isPostFromOrganization(body.postId, organizationId);

		const comment = await db.comment.create({
			data: {
				content: body.content,
				postId: body.postId,
				authorId: userId,
				...(body.commentId && { repliesToId: body.commentId }),
			},
			include: { author: { select: { id: true, name: true } } },
		});

		if (!comment) {
			throw new TRPCError({
				message: `Failed to create comment with content: ${body.content}.`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		if (body.commentId) {
			// Reply — notify the parent comment's author
			const parentComment = await db.comment.findUnique({
				where: { id: body.commentId },
				select: { authorId: true },
			});
			if (parentComment) {
				void createNotification({
					type: NotificationType.REPLY,
					recipientId: parentComment.authorId,
					actorId: userId,
					postId: body.postId,
					commentId: comment.id,
				});
			}
		} else {
			// Top-level comment — notify the post author
			void createNotification({
				type: NotificationType.COMMENT,
				recipientId: post.authorId,
				actorId: userId,
				postId: body.postId,
				commentId: comment.id,
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
