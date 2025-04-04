import { TRPCError } from "@trpc/server";
import { sign, verify } from "hono/jwt";

import type { LoggedUser } from "@/shared/types/auth";
import type { UserRoles } from "@/shared/types/roles";

export const createTokenFromUser = async ({
	userId,
	userRole,
	organizationId,
}: { userId: number; userRole: UserRoles; organizationId: number }) => {
	const token = await sign(
		{
			iat: new Date().getTime() / 1000,
			userId,
			userRole,
			organizationId,
		},
		process.env.JWT_SECRET,
	);

	return token;
};

export const decodeLoggedUserFromToken = async (token: string) => {
	if (!token) {
		throw new TRPCError({
			message: "No token provided.",
			code: "UNAUTHORIZED",
		});
	}

	const payload = await verify(token, process.env.JWT_SECRET);

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
