import { authRouter } from "@/modules/auth/router";
import { commentsRouter } from "@/modules/comments/router";
import { groupsRouter } from "@/modules/groups/router";
import { likesRouter } from "@/modules/likes/router";
import { organizationsRouter } from "@/modules/organizations/router";
import { postsRouter } from "@/modules/posts/router";
import { usersRouter } from "@/modules/users/router";
import { publicProcedure, router } from "@/shared/trpc";

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
});

export type AppRouter = typeof appRouter;
