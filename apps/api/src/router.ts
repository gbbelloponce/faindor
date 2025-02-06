import { authRouter } from "@modules/auth/router";
import { organizationsRouter } from "./modules/organizations/router";
import { postsRouter } from "./modules/posts/router";
import { usersRouter } from "./modules/users/router";
import { publicProcedure, router } from "./shared/trpc";

export const appRouter = router({
	hi: publicProcedure.query(async () => {
		return "Hi there!";
	}),
	organizations: organizationsRouter,
	users: usersRouter,
	posts: postsRouter,
	auth: authRouter,
});

export type AppRouter = typeof appRouter;
