import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { validatePostsUserIsFromOrganizationId } from "@/modules/posts/service";
import db from "@/shared/db";
import { Likes } from "@/shared/db/tables/likes";
import { Users } from "@/shared/db/tables/users";
import { checkDBError } from "@/shared/utils/errors";

export const createLike = async (
	postId: number,
	userId: number,
	organizationId: number,
) => {
	try {
		await validatePostsUserIsFromOrganizationId(postId, organizationId);

		const result = await db
			.insert(Likes)
			.values({
				postId,
				userId,
			})
			.returning();

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to like post with id: ${postId}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const getLikesByPostId = async (
	postId: number,
	organizationId: number,
	page = 1,
) => {
	try {
		const result = await db
			.select({
				id: Likes.id,
				user: {
					id: Users.id,
					name: Users.name,
				},
			})
			.from(Likes)
			.innerJoin(Users, eq(Likes.userId, Users.id))
			.where(
				and(eq(Likes.postId, postId), eq(Users.organizationId, organizationId)),
			)
			.offset((page - 1) * 10) // Get 10 likes per page, skip the other ones
			.limit(10);

		return result;
	} catch (error) {
		throw checkDBError(error);
	}
};
