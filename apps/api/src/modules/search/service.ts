import { db } from "@/shared/db";
import { handleError } from "@/shared/utils/errors";

export const search = async (query: string, organizationId: number) => {
	try {
		const [users, posts] = await Promise.all([
			db.user.findMany({
				where: {
					organizationId,
					name: { contains: query, mode: "insensitive" },
					deletedAt: null,
				},
				select: { id: true, name: true },
				take: 5,
			}),
			db.post.findMany({
				where: {
					organizationId,
					content: { contains: query, mode: "insensitive" },
					deletedAt: null,
				},
				select: {
					id: true,
					content: true,
					author: { select: { id: true, name: true } },
				},
				take: 5,
			}),
		]);

		return { users, posts };
	} catch (error) {
		throw handleError(error, {
			message: `Failed to search for query: ${query}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
