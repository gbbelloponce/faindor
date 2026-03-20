import { db } from "@/shared/db";
import type { NotificationType } from "@/shared/db/generated/prisma/client";
import { handleError } from "@/shared/utils/errors";
import { getPaginationArgs } from "@/shared/utils/pagination";

type CreateNotificationParams = {
	type: NotificationType;
	recipientId: number;
	actorId: number;
	postId?: number;
	commentId?: number;
};

export const createNotification = async ({
	type,
	recipientId,
	actorId,
	postId,
	commentId,
}: CreateNotificationParams): Promise<void> => {
	if (recipientId === actorId) return;

	await db.notification.create({
		data: { type, recipientId, actorId, postId, commentId },
	});
};

export const getNotificationsForUser = async (userId: number, page = 1) => {
	try {
		return await db.notification.findMany({
			where: { recipientId: userId },
			include: {
				actor: { select: { id: true, name: true } },
			},
			orderBy: { createdAt: "desc" },
			...getPaginationArgs(page),
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get notifications for user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getUnreadNotificationsCount = async (
	userId: number,
): Promise<number> => {
	try {
		return await db.notification.count({
			where: { recipientId: userId, readAt: null },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get unread notifications count for user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const markAllNotificationsAsRead = async (
	userId: number,
): Promise<void> => {
	try {
		await db.notification.updateMany({
			where: { recipientId: userId, readAt: null },
			data: { readAt: new Date() },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to mark notifications as read for user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
