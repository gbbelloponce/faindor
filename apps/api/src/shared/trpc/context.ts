import { TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Context } from "hono";

import { decodeAccessToken } from "@/shared/utils/token";

export const createContext = async (
	_: FetchCreateContextFnOptions,
	c: Context,
) => {
	const authorizationHeader = c.req.header("Authorization");
	if (!authorizationHeader) {
		return { user: null };
	}

	const [, token] = authorizationHeader.split(" ");
	if (!token) {
		return { user: null };
	}

	try {
		const user = await decodeAccessToken(token);
		return { user };
	} catch (error) {
		if (!(error instanceof TRPCError)) {
			console.error("Unexpected error decoding access token:", error);
		}
		return { user: null };
	}
};
