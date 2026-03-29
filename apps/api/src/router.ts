import { adminRouter } from "@/modules/admin/router";
import { authRouter } from "@/modules/auth/router";
import { commentsRouter } from "@/modules/comments/router";
import { eventsRouter } from "@/modules/events/router";
import { groupsRouter } from "@/modules/groups/router";
import { likesRouter } from "@/modules/likes/router";
import { messagesRouter } from "@/modules/messages/router";
import { notificationsRouter } from "@/modules/notifications/router";
import { organizationsRouter } from "@/modules/organizations/router";
import { postsRouter } from "@/modules/posts/router";
import { searchRouter } from "@/modules/search/router";
import { usersRouter } from "@/modules/users/router";
import { publicProcedure, router } from "@/shared/trpc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
	hi: publicProcedure.query(async () => {
		return "Hi there!";
	}),
	organizations: organizationsRouter,
	users: usersRouter,
	posts: postsRouter,
	auth: authRouter,
	likes: likesRouter,
	comments: commentsRouter,
	groups: groupsRouter,
	notifications: notificationsRouter,
	search: searchRouter,
	events: eventsRouter,
	admin: adminRouter,
	messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
