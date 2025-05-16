import type { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { sign, verify } from "hono/jwt";

import type { LoggedUser } from "@/shared/types/auth";

export const createAccessToken = async ({
	userId,
	userRole,
	organizationId,
}: { userId: number; userRole: UserRole; organizationId: number }) => {
	const token = await sign(
		{
			userId,
			userRole,
			organizationId,
		},
		process.env.ACCESS_TOKEN_SECRET,
	);

	return token;
};

export const decodeAccessToken = async (token: string) => {
	if (!token) {
		throw new TRPCError({
			message: "No token provided.",
			code: "UNAUTHORIZED",
		});
	}

	const payload = await verify(token, process.env.ACCESS_TOKEN_SECRET);

	if (!payload.userId || !payload.organizationId || !payload.userRole) {
		throw new TRPCError({
			message: "Invalid token.",
			code: "UNAUTHORIZED",
		});
	}

	return {
		id: Number(payload.userId),
		role: payload.userRole,
		organizationId: Number(payload.organizationId),
	} as LoggedUser;
};
