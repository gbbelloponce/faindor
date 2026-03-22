import { authenticatedProcedure, router } from "@/shared/trpc";
import {
	getConversations,
	getMessages,
	getUnreadMessagesCount,
	markConversationAsRead,
	sendMessage,
} from "./service";
import {
	getMessagesSchema,
	markAsReadSchema,
	sendMessageSchema,
} from "./types/request";

export const messagesRouter = router({
	getConversations: authenticatedProcedure.query(async ({ ctx }) => {
		return await getConversations(ctx.user.id);
	}),
	getMessages: authenticatedProcedure
		.input(getMessagesSchema)
		.query(async ({ input, ctx }) => {
			return await getMessages(ctx.user.id, input.partnerId);
		}),
	sendMessage: authenticatedProcedure
		.input(sendMessageSchema)
		.mutation(async ({ input, ctx }) => {
			return await sendMessage(
				ctx.user.id,
				ctx.user.organizationId,
				input.receiverId,
				input.content,
			);
		}),
	markConversationAsRead: authenticatedProcedure
		.input(markAsReadSchema)
		.mutation(async ({ input, ctx }) => {
			await markConversationAsRead(ctx.user.id, input.partnerId);
		}),
	getUnreadCount: authenticatedProcedure.query(async ({ ctx }) => {
		return await getUnreadMessagesCount(ctx.user.id);
	}),
});
