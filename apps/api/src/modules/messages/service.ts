import { db } from "@/shared/db";
import { handleError } from "@/shared/utils/errors";
import { TRPCError } from "@trpc/server";

const PARTNER_SELECT = {
	id: true,
	name: true,
	avatarUrl: true,
} as const;

export const getConversations = async (userId: number) => {
	try {
		// Get all messages involving this user, newest first
		const allMessages = await db.directMessage.findMany({
			where: { OR: [{ senderId: userId }, { receiverId: userId }] },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				content: true,
				createdAt: true,
				readAt: true,
				senderId: true,
				receiverId: true,
				sender: { select: PARTNER_SELECT },
				receiver: { select: PARTNER_SELECT },
			},
		});

		// Deduplicate — keep only the first (most recent) message per partner
		const seen = new Set<number>();
		const lastMessages: typeof allMessages = [];
		for (const msg of allMessages) {
			const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
			if (!seen.has(partnerId)) {
				seen.add(partnerId);
				lastMessages.push(msg);
			}
		}

		// Get unread count per sender
		const unreadAgg = await db.directMessage.groupBy({
			by: ["senderId"],
			where: { receiverId: userId, readAt: null },
			_count: { id: true },
		});
		const unreadMap = new Map(unreadAgg.map((u) => [u.senderId, u._count.id]));

		return lastMessages.map((msg) => {
			const partner = msg.senderId === userId ? msg.receiver : msg.sender;
			return {
				partner,
				lastMessage: msg.content,
				lastMessageAt: msg.createdAt,
				lastMessageIsMine: msg.senderId === userId,
				unreadCount: unreadMap.get(partner.id) ?? 0,
			};
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get conversations for user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getMessages = async (userId: number, partnerId: number) => {
	try {
		return await db.directMessage.findMany({
			where: {
				OR: [
					{ senderId: userId, receiverId: partnerId },
					{ senderId: partnerId, receiverId: userId },
				],
			},
			orderBy: { createdAt: "asc" },
			take: 100,
			select: {
				id: true,
				content: true,
				createdAt: true,
				readAt: true,
				senderId: true,
				receiverId: true,
			},
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get messages between users ${userId} and ${partnerId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const sendMessage = async (
	senderId: number,
	senderOrgId: number,
	receiverId: number,
	content: string,
) => {
	try {
		const receiver = await db.user.findUnique({
			where: { id: receiverId },
			select: { organizationId: true, deletedAt: true, active: true },
		});

		if (!receiver || receiver.deletedAt || !receiver.active) {
			throw new TRPCError({ message: "User not found.", code: "NOT_FOUND" });
		}

		if (receiver.organizationId !== senderOrgId) {
			throw new TRPCError({
				message: "Cannot message users outside your organization.",
				code: "FORBIDDEN",
			});
		}

		return await db.directMessage.create({
			data: { senderId, receiverId, content },
			select: {
				id: true,
				content: true,
				createdAt: true,
				readAt: true,
				senderId: true,
				receiverId: true,
			},
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to send message from ${senderId} to ${receiverId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const markConversationAsRead = async (
	userId: number,
	partnerId: number,
) => {
	try {
		await db.directMessage.updateMany({
			where: { senderId: partnerId, receiverId: userId, readAt: null },
			data: { readAt: new Date() },
		});
	} catch (error) {
		throw handleError(error, {
			message: "Failed to mark messages as read",
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getUnreadMessagesCount = async (userId: number) => {
	try {
		return await db.directMessage.count({
			where: { receiverId: userId, readAt: null },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get unread messages count for user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
