import { initTRPC } from "@trpc/server";
import { organizationsRouter } from "./modules/organizations/router";
import { postsRouter } from "./modules/posts/router";
import { usersRouter } from "./modules/users/router";

const t = initTRPC.create();

export const appRouter = t.router({
	users: usersRouter,
	posts: postsRouter,
	organizations: organizationsRouter,
});

export type AppRouter = typeof appRouter;
