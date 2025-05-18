import type { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { sign, verify } from "hono/jwt";
import { type JWTPayload, JwtTokenExpired } from "hono/utils/jwt/types";

import type { LoggedUser } from "@/shared/types/auth";

// Token expiration times in seconds
export const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days

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
			exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
		},
		process.env.ACCESS_TOKEN_SECRET,
	);

	return token;
};

export const createRefreshToken = async ({ userId }: { userId: number }) => {
	const token = await sign(
		{
			userId,
			exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY,
			type: "refresh",
		},
		process.env.REFRESH_TOKEN_SECRET,
	);

	return token;
};

export const decodeAccessToken = async (accessToken: string) => {
	if (!accessToken) {
		throw new TRPCError({
			message: "No token provided.",
			code: "UNAUTHORIZED",
		});
	}

	let payload: JWTPayload;
	try {
		payload = await verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
	} catch (error) {
		if (error instanceof JwtTokenExpired) {
			throw new TRPCError({
				message: "Expired access token.",
				code: "UNAUTHORIZED",
				cause: "TOKEN_EXPIRED",
			});
		}

		throw new TRPCError({
			message: "Invalid access token.",
			code: "UNAUTHORIZED",
		});
	}

	if (!payload.userId || !payload.organizationId || !payload.userRole) {
		throw new TRPCError({
			message: "Invalid access token.",
			code: "UNAUTHORIZED",
		});
	}

	return {
		id: Number(payload.userId),
		role: payload.userRole,
		organizationId: Number(payload.organizationId),
	} as LoggedUser;
};

export const decodeRefreshToken = async (refreshToken: string) => {
	if (!refreshToken) {
		throw new TRPCError({
			message: "No refresh token provided.",
			code: "UNAUTHORIZED",
		});
	}

	let payload: JWTPayload;
	try {
		payload = await verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
	} catch (error) {
		if (error instanceof JwtTokenExpired) {
			throw new TRPCError({
				message: "Expired refresh token.",
				code: "UNAUTHORIZED",
				cause: "TOKEN_EXPIRED",
			});
		}

		throw new TRPCError({
			message: "Invalid refresh token.",
			code: "UNAUTHORIZED",
		});
	}

	if (!payload.userId || payload.type !== "refresh") {
		throw new TRPCError({
			message: "Invalid refresh token.",
			code: "UNAUTHORIZED",
		});
	}

	return {
		userId: Number(payload.userId),
	};
};
