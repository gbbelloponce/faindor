import { TRPCError } from "@trpc/server";
import { type User, UserRole } from "../../shared/db/generated/prisma/client";
import type { UpdateProfileBody } from "./types/request";

import {
	createOrganization,
	getOrganizationByDomain,
} from "@/modules/organizations/service";
import { COMMON_PROVIDERS_ORGANIZATION_ID } from "@/shared/constants";
import { db } from "@/shared/db";
import type { UserWithOrganization } from "@/shared/types/auth";
import { handleError } from "@/shared/utils/errors";
import {
	COMMON_EMAIL_PROVIDERS,
	getNormalizedDomainFromEmail,
} from "@/shared/utils/mail";
import type {
	CreateUserParams,
	GetUserByCredentialsParams,
} from "../auth/types/request";

export const getPublicUserInfoById = async (id: number) => {
	try {
		const user = await db.user.findUnique({
			where: { id },
			include: {
				organization: true,
			},
			omit: {
				active: true,
				password: true,
				role: true,
				tokenVersion: true,
			},
		});

		if (!user || user.deletedAt) {
			throw new TRPCError({
				message: `There is no user with the id: ${id}`,
				code: "NOT_FOUND",
			});
		}

		return user;
	} catch (error) {
		throw handleError(error);
	}
};

export const getUserById = async (
	id: number,
): Promise<UserWithOrganization> => {
	try {
		const user = await db.user.findUnique({
			where: { id },
			include: {
				organization: true,
			},
		});

		if (!user || user.deletedAt) {
			throw new TRPCError({
				message: `There is no user with the id: ${id}`,
				code: "NOT_FOUND",
			});
		}

		return user;
	} catch (error) {
		throw handleError(error);
	}
};

export const getUserByEmail = async (
	email: string,
): Promise<UserWithOrganization> => {
	try {
		const user = await db.user.findUnique({
			where: { email },
			include: {
				organization: true,
			},
		});

		if (!user || user.deletedAt) {
			throw new TRPCError({
				message: `There is no user with the email: ${email}`,
				code: "NOT_FOUND",
			});
		}

		return user;
	} catch (error) {
		throw handleError(error);
	}
};

export const getUserByCredentials = async ({
	email,
	password,
}: GetUserByCredentialsParams): Promise<UserWithOrganization> => {
	try {
		const user = await getUserByEmail(email);

		const arePasswordsEqual = await Bun.password.verify(
			password,
			user.password,
		);

		if (!arePasswordsEqual) {
			throw new TRPCError({
				message: `Invalid credentials for the email: ${email}.`,
				code: "UNAUTHORIZED",
			});
		}

		if (!user.active) {
			throw new TRPCError({
				message: "Account is suspended.",
				code: "UNAUTHORIZED",
				cause: "ACCOUNT_SUSPENDED",
			});
		}

		return user;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get user by credentials with email: ${email}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const updateProfile = async (
	userId: number,
	data: UpdateProfileBody,
) => {
	try {
		const user = await db.user.update({
			where: { id: userId },
			data,
			select: {
				id: true,
				name: true,
				bio: true,
				avatarUrl: true,
			},
		});
		return user;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to update profile for user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const createUser = async (body: CreateUserParams): Promise<User> => {
	try {
		let organizationId = null;

		const organizationDomain = getNormalizedDomainFromEmail(body.email);

		// If the domain is from a common provider, group all users inside the same organization
		if (COMMON_EMAIL_PROVIDERS.has(organizationDomain)) {
			organizationId = COMMON_PROVIDERS_ORGANIZATION_ID;
		} else {
			const existingOrganization =
				await getOrganizationByDomain(organizationDomain);

			// Creates the organization for the given domain if it doesn't exist
			if (!existingOrganization) {
				const createdOrganization = await createOrganization({
					name: organizationDomain,
					domain: organizationDomain,
				});
				organizationId = createdOrganization.id;
			} else {
				organizationId = existingOrganization.id;
			}
		}

		const user = await db.user.create({
			data: {
				name: body.name,
				email: body.email,
				password: await Bun.password.hash(body.password),
				role: UserRole.USER,
				organizationId,
				active: true,
			},
		});

		return user;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to create user with email: ${body.email} and name: ${body.name}.`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
