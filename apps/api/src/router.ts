import { initTRPC } from "@trpc/server";
import { usersRouter } from "./modules/users/router";

const t = initTRPC.create();

export const appRouter = t.router({
	users: usersRouter,
});

export type AppRouter = typeof appRouter;
