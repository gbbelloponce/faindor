import { TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Context } from "hono";

import { decodeAccessToken } from "@/shared/utils/token";

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

		const user = await decodeAccessToken(token);

		return {
			user,
		};
	} catch (error) {
		return {
			user: null,
		};
	}
};
