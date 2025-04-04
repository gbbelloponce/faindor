import { TRPCError } from "@trpc/server";

import db from "@/shared/db";
import { Communities } from "@/shared/db/tables/communities";
import { CommunitiesUsers } from "@/shared/db/tables/communitiesUsers";
import { Users } from "@/shared/db/tables/users";
import { checkDBError } from "@/shared/utils/errors";
import { and, count, eq } from "drizzle-orm";

export const getCommunityById = async (
	communityId: number,
	organizationId: number,
) => {
	try {
		const result = await db
			.select({
				id: Communities.id,
				name: Communities.name,
				members: count(CommunitiesUsers.id),
				owner: {
					id: Users.id,
					name: Users.name,
				},
			})
			.from(Communities)
			.innerJoin(Users, eq(Communities.ownerId, Users.id))
			.innerJoin(
				CommunitiesUsers,
				eq(Communities.id, CommunitiesUsers.communityId),
			)
			.where(
				and(
					eq(Communities.id, communityId),
					eq(Users.organizationId, organizationId),
				),
			);

		if (!result.length) {
			throw new TRPCError({
				message: `There is no community with the id: ${communityId}`,
				code: "NOT_FOUND",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const createCommunity = async (
	name: string,
	userId: number,
	organizationId: number,
) => {
	try {
		const existingCommunityWithSameNameInSameOrganization = await db
			.select({ id: Communities.id })
			.from(Communities)
			.innerJoin(Users, eq(Communities.ownerId, Users.id))
			.where(
				and(
					eq(Communities.name, name),
					eq(Users.organizationId, organizationId),
				),
			);

		if (existingCommunityWithSameNameInSameOrganization.length) {
			throw new TRPCError({
				message: `There is already a community with the name: ${name} in your organization`,
				code: "CONFLICT",
			});
		}

		const result = await db
			.insert(Communities)
			.values({ name, ownerId: userId })
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to create community with name: ${name}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		// Also add the owner to the community
		await db
			.insert(CommunitiesUsers)
			.values({ communityId: result[0].id, userId });

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const joinCommunity = async (
	communityId: number,
	userId: number,
	organizationId: number,
) => {
	try {
		const existingCommunity = await db
			.select({
				id: Communities.id,
				owner: { id: Users.id, organizationId: Users.organizationId },
			})
			.from(Communities)
			.innerJoin(Users, eq(Communities.ownerId, Users.id))
			.where(eq(Communities.id, communityId));

		if (existingCommunity[0].owner.organizationId !== organizationId) {
			throw new TRPCError({
				message: `You are not allowed to join community with id: ${communityId}`,
				code: "UNAUTHORIZED",
			});
		}

		const result = await db
			.insert(CommunitiesUsers)
			.values({ communityId, userId })
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to join community with id: ${communityId}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const leaveCommunity = async (communityId: number, userId: number) => {
	try {
		const result = await db
			.delete(CommunitiesUsers)
			.where(
				and(
					eq(CommunitiesUsers.communityId, communityId),
					eq(CommunitiesUsers.userId, userId),
				),
			);

		if (!result.rowCount) {
			throw new TRPCError({
				message: `Failed to leave community with id: ${communityId}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return !!result.rowCount;
	} catch (error) {
		throw checkDBError(error);
	}
};
