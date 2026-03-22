import { TRPCError } from "@trpc/server";
import { sign, verify } from "hono/jwt";
import { type JWTPayload, JwtTokenExpired } from "hono/utils/jwt/types";
import type { UserRole } from "../db/generated/prisma/client";

import type { LoggedUser } from "@/shared/types/auth";

// Token expiration times in seconds
export const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days
export const EMAIL_VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours

export const createAccessToken = async ({
	userId,
	userRole,
	organizationId,
	tokenVersion,
}: {
	userId: number;
	userRole: UserRole;
	organizationId: number;
	tokenVersion: number;
}) => {
	const token = await sign(
		{
			userId,
			userRole,
			organizationId,
			tokenVersion,
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
		payload = await verify(
			accessToken,
			process.env.ACCESS_TOKEN_SECRET,
			"HS256",
		);
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

	if (
		!payload.userId ||
		!payload.organizationId ||
		!payload.userRole ||
		payload.tokenVersion === undefined
	) {
		throw new TRPCError({
			message: "Invalid access token.",
			code: "UNAUTHORIZED",
		});
	}

	return {
		id: Number(payload.userId),
		role: payload.userRole,
		organizationId: Number(payload.organizationId),
		tokenVersion: Number(payload.tokenVersion),
	} as LoggedUser;
};

export const createEmailVerificationToken = async ({
	userId,
	email,
}: {
	userId: number;
	email: string;
}) => {
	return await sign(
		{
			userId,
			email,
			type: "emailVerification",
			exp: Math.floor(Date.now() / 1000) + EMAIL_VERIFICATION_TOKEN_EXPIRY,
		},
		process.env.ACCESS_TOKEN_SECRET,
	);
};

export const decodeEmailVerificationToken = async (token: string) => {
	if (!token) {
		throw new TRPCError({
			message: "No token provided.",
			code: "BAD_REQUEST",
		});
	}

	let payload: JWTPayload;
	try {
		payload = await verify(token, process.env.ACCESS_TOKEN_SECRET, "HS256");
	} catch (error) {
		if (error instanceof JwtTokenExpired) {
			throw new TRPCError({
				message: "Verification link has expired.",
				code: "BAD_REQUEST",
				cause: "TOKEN_EXPIRED",
			});
		}
		throw new TRPCError({
			message: "Invalid verification token.",
			code: "BAD_REQUEST",
		});
	}

	if (
		!payload.userId ||
		!payload.email ||
		payload.type !== "emailVerification"
	) {
		throw new TRPCError({
			message: "Invalid verification token.",
			code: "BAD_REQUEST",
		});
	}

	return {
		userId: Number(payload.userId),
		email: String(payload.email),
	};
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
		payload = await verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			"HS256",
		);
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
