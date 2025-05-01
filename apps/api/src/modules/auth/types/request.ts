import { z } from "zod";

import { UserRole } from "@prisma/client";

export const logInWithCredentialsSchema = z.object({
	email: z.string().email().min(1),
	password: z.string().min(1),
});

export const logInWithTokenSchema = z.object({
	token: z.string().min(1),
});

export const getUserByDecodedTokenSchema = z.object({
	email: z.string().email().min(1),
	organizationId: z.number().min(1),
	userRole: z.nativeEnum(UserRole),
});

export const registerSchema = z.object({
	name: z.string().min(1),
	email: z.string().email().min(1),
	password: z.string().min(1),
});

export type GetUserByCredentialsParams = z.infer<
	typeof logInWithCredentialsSchema
>;

export type GetUserByDecodedTokenParams = z.infer<
	typeof getUserByDecodedTokenSchema
>;

export type CreateUserParams = z.infer<typeof registerSchema>;
