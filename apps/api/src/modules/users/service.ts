import { count, eq } from "drizzle-orm";

import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { Posts } from "@shared/db/tables/posts";
import { Users } from "@shared/db/tables/users";
import { parseDBError } from "@shared/utils/errors";

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
		throw parseDBError(error);
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

		if (!result.length) return null;

		return result[0];
	} catch (error) {
		throw parseDBError(error);
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

		if (!result.length) return null;

		return result[0];
	} catch (error) {
		throw parseDBError(error);
	}
};
