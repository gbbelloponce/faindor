import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";

import {
	createOrganization,
	getOrganizationByDomain,
} from "@/modules/organizations/service";
import { COMMON_PROVIDERS_ORGANIZATION_ID } from "@/shared/constants";
import db from "@/shared/db";
import { Organizations } from "@/shared/db/tables/organizations";
import { Posts } from "@/shared/db/tables/posts";
import { Users } from "@/shared/db/tables/users";
import { UserRoles } from "@/shared/types/roles";
import { checkDBError } from "@/shared/utils/errors";
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
		const result = await db
			.select({
				id: Users.id,
				name: Users.name,
				email: Users.email,
				organization: {
					id: Organizations.id,
					domain: Organizations.domain,
				},
				publishedPosts: count(Posts.id),
			})
			.from(Users)
			.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
			.leftJoin(Posts, eq(Users.id, Posts.userId))
			.where(eq(Users.id, id));

		if (!result.length) return null;

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const getUserById = async (id: number) => {
	try {
		const result = await db
			.select({
				id: Users.id,
				name: Users.name,
				email: Users.email,
				password: Users.password,
				role: Users.role,
				createdAt: Users.createdAt,
				deletedAt: Users.deletedAt,
				organization: Organizations,
			})
			.from(Users)
			.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
			.where(eq(Users.id, id));

		if (!result.length) {
			throw new TRPCError({
				message: `There is no user with the id: ${id}`,
				code: "NOT_FOUND",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const getUserByEmail = async (email: string) => {
	try {
		const result = await db
			.select({
				id: Users.id,
				name: Users.name,
				email: Users.email,
				password: Users.password,
				role: Users.role,
				createdAt: Users.createdAt,
				deletedAt: Users.deletedAt,
				organization: Organizations,
			})
			.from(Users)
			.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
			.where(eq(Users.email, email));

		if (!result.length) {
			throw new TRPCError({
				message: `There is no user with the email: ${email}`,
				code: "NOT_FOUND",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const getUserByCredentials = async ({
	email,
	password,
}: GetUserByCredentialsParams) => {
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

		return user;
	} catch (error) {
		throw checkDBError(error);
	}
};

export const createUser = async (user: CreateUserParams) => {
	try {
		let organizationId = null;

		const organizationDomain = getNormalizedDomainFromEmail(user.email);

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

		const result = await db
			.insert(Users)
			.values({
				name: user.name,
				email: user.email,
				password: await Bun.password.hash(user.password),
				role: UserRoles.USER,
				organizationId: organizationId,
			})
			.returning({
				id: Users.id,
				name: Users.name,
				email: Users.email,
				organizationId: Users.organizationId,
			});

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to create user with email: ${user.email} and name: ${user.name}.`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};
