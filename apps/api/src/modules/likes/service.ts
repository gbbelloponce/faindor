import { isPostFromOrganization } from "@/modules/posts/service";
import { db } from "@/shared/db";
import { handleError } from "@/shared/utils/errors";
import { getPaginationArgs } from "@/shared/utils/pagination";

export const createLike = async (
	postId: number,
	userId: number,
	organizationId: number,
) => {
	try {
		await isPostFromOrganization(postId, organizationId);

		const like = await db.like.create({
			data: {
				postId,
				userId,
			},
		});

		return like;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to like post with id: ${postId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getLikesByPostId = async (
	postId: number,
	organizationId: number,
	page = 1,
) => {
	try {
		const likes = await db.like.findMany({
			where: {
				postId,
				post: {
					organizationId,
					deletedAt: null,
				},
			},
			include: {
				user: true,
			},
			...getPaginationArgs(page),
		});

		return likes;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get likes by post id: ${postId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
