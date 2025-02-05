import { initTRPC } from "@trpc/server";
import { organizationsRouter } from "./modules/organizations/router";
import { usersRouter } from "./modules/users/router";

const t = initTRPC.create();

export const appRouter = t.router({
	users: usersRouter,
	organizations: organizationsRouter,
});

export type AppRouter = typeof appRouter;
