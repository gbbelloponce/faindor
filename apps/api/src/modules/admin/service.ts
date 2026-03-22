import { TRPCError } from "@trpc/server";

import { db } from "@/shared/db";
import { handleError } from "@/shared/utils/errors";
import { getPaginationArgs } from "@/shared/utils/pagination";
import type { UpdateOrganizationBody } from "./types/request";

const assertUserInOrg = async (userId: number, organizationId: number) => {
	const user = await db.user.findFirst({
		where: { id: userId, organizationId },
	});

	if (!user) {
		throw new TRPCError({
			message: `User ${userId} not found in this organization.`,
			code: "NOT_FOUND",
		});
	}

	return user;
};

export const getOrgUsers = async (organizationId: number, page = 1) => {
	try {
		return await db.user.findMany({
			where: { organizationId },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				active: true,
				avatarUrl: true,
				createdAt: true,
				deletedAt: true,
			},
			orderBy: { createdAt: "asc" },
			...getPaginationArgs(page),
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get users for organization: ${organizationId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const suspendUser = async (
	adminId: number,
	userId: number,
	organizationId: number,
) => {
	if (adminId === userId) {
		throw new TRPCError({
			message: "You cannot suspend your own account.",
			code: "BAD_REQUEST",
		});
	}

	try {
		await assertUserInOrg(userId, organizationId);

		return await db.user.update({
			where: { id: userId },
			data: {
				active: false,
				tokenVersion: { increment: 1 },
			},
			select: { id: true, active: true },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to suspend user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const activateUser = async (userId: number, organizationId: number) => {
	try {
		await assertUserInOrg(userId, organizationId);

		return await db.user.update({
			where: { id: userId },
			data: { active: true },
			select: { id: true, active: true },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to activate user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const deleteUser = async (
	adminId: number,
	userId: number,
	organizationId: number,
) => {
	if (adminId === userId) {
		throw new TRPCError({
			message: "You cannot delete your own account.",
			code: "BAD_REQUEST",
		});
	}

	try {
		await assertUserInOrg(userId, organizationId);

		return await db.user.update({
			where: { id: userId },
			data: {
				deletedAt: new Date(),
				tokenVersion: { increment: 1 },
			},
			select: { id: true, deletedAt: true },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to delete user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const promoteToAdmin = async (
	userId: number,
	organizationId: number,
) => {
	try {
		await assertUserInOrg(userId, organizationId);

		return await db.user.update({
			where: { id: userId },
			data: { role: "APP_ADMIN" },
			select: { id: true, role: true },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to promote user: ${userId} to admin`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const revokeAdmin = async (
	adminId: number,
	userId: number,
	organizationId: number,
) => {
	if (adminId === userId) {
		throw new TRPCError({
			message: "You cannot revoke your own admin role.",
			code: "BAD_REQUEST",
		});
	}

	try {
		await assertUserInOrg(userId, organizationId);

		return await db.user.update({
			where: { id: userId },
			data: { role: "USER" },
			select: { id: true, role: true },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to revoke admin from user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const updateOrganization = async (
	organizationId: number,
	data: UpdateOrganizationBody,
) => {
	try {
		return await db.organization.update({
			where: { id: organizationId },
			data,
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to update organization: ${organizationId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const adminDeletePost = async (
	postId: number,
	organizationId: number,
) => {
	try {
		const post = await db.post.findFirst({
			where: { id: postId, organizationId, deletedAt: null },
		});

		if (!post) {
			throw new TRPCError({
				message: `Post ${postId} not found in this organization.`,
				code: "NOT_FOUND",
			});
		}

		return await db.post.update({
			where: { id: postId },
			data: { deletedAt: new Date() },
			select: { id: true, deletedAt: true },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to delete post: ${postId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getOrgPostsForModeration = async (
	organizationId: number,
	page = 1,
) => {
	try {
		return await db.post.findMany({
			where: { organizationId, deletedAt: null },
			include: {
				author: { select: { id: true, name: true, avatarUrl: true } },
			},
			orderBy: { createdAt: "desc" },
			...getPaginationArgs(page),
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get posts for organization: ${organizationId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
