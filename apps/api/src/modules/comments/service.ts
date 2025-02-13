import { and, desc, eq } from "drizzle-orm";

import db from "@shared/db";
import { Comments } from "@shared/db/tables/comments";
import { Posts } from "@shared/db/tables/posts";
import { Users } from "@shared/db/tables/users";
import { checkDBError } from "@shared/utils/errors";

export const getCommentsByPostId = async (
	postId: number,
	organizationId: number,
	page = 1,
) => {
	try {
		const result = db
			.select({
				id: Comments.id,
				content: Comments.content,
				postId: Posts.id,
				user: {
					id: Users.id,
					name: Users.name,
				},
			})
			.from(Comments)
			.innerJoin(Posts, eq(Comments.postId, Posts.id))
			.innerJoin(Users, eq(Comments.userId, Users.id))
			.where(
				and(
					eq(Comments.postId, postId),
					eq(Users.organizationId, organizationId),
				),
			)
			.orderBy(desc(Posts.createdAt))
			.groupBy(Comments.id, Comments.content, Posts.id, Users.id, Users.name)
			.limit(10)
			.offset((page - 1) * 10);

		return result;
	} catch (error) {
		throw checkDBError(error);
	}
};
