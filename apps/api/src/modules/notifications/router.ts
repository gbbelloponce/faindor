import { authenticatedProcedure, router } from "@/shared/trpc";
import { positiveNumberSchema } from "@/shared/types/schemas";
import { z } from "zod";
import {
	getNotificationsForUser,
	getUnreadNotificationsCount,
	markAllNotificationsAsRead,
} from "./service";

export const notificationsRouter = router({
	getNotifications: authenticatedProcedure
		.input(z.object({ page: positiveNumberSchema }))
		.query(async ({ input, ctx }) => {
			return await getNotificationsForUser(ctx.user.id, input.page);
		}),
	getUnreadCount: authenticatedProcedure.query(async ({ ctx }) => {
		return await getUnreadNotificationsCount(ctx.user.id);
	}),
	markAllAsRead: authenticatedProcedure.mutation(async ({ ctx }) => {
		await markAllNotificationsAsRead(ctx.user.id);
	}),
});
