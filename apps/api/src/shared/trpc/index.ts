import { TRPCError, initTRPC } from "@trpc/server";

import type { createContext } from "./context";

export const t = initTRPC
	.context<Awaited<ReturnType<typeof createContext>>>()
	.create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const authenticatedProcedure = t.procedure.use(
	t.middleware(({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				message: "Not authenticated.",
				code: "UNAUTHORIZED",
			});
		}

		return next({ ctx: { user: ctx.user } });
	}),
);
