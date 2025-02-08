import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Context } from "hono";
import { verify } from "hono/jwt";

import type { LoggedUser } from "@shared/types/auth";
import { TRPCError } from "@trpc/server";

export const createContext = async (
	_: FetchCreateContextFnOptions,
	c: Context,
) => {
	try {
		const authorizationHeader = c.req.header("Authorization");
		if (!authorizationHeader) {
			throw new TRPCError({
				message: "No authorization header provided.",
				code: "UNAUTHORIZED",
			});
		}

		// Get the token
		const [, token] = authorizationHeader.split(" ");
		if (!token) {
			throw new TRPCError({
				message: "No token provided.",
				code: "UNAUTHORIZED",
			});
		}

		// Verify and validate the token
		const payload = await verify(token, process.env.JWT_SECRET);

		if (!payload.userId || !payload.organizationId || !payload.userRole) {
			throw new TRPCError({
				message: "Invalid token.",
				code: "UNAUTHORIZED",
			});
		}

		// Set the user's token info in the context
		return {
			user: {
				id: Number(payload.userId),
				role: payload.userRole,
				organizationId: payload.organizationId,
			} as LoggedUser,
		};
	} catch (error) {
		return {
			user: null,
		};
	}
};
