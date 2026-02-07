import { TRPCError } from "@trpc/server";

import { db } from "@/shared/db";
import { handleError } from "@/shared/utils/errors";

export const getGroupById = async (groupId: number, organizationId: number) => {
	try {
		const group = await db.group.findFirst({
			where: {
				id: groupId,
				organizationId,
				deletedAt: null,
			},
			include: {
				members: true,
			},
		});

		if (!group) {
			throw new TRPCError({
				message: `There is no group with the id: ${groupId}`,
				code: "NOT_FOUND",
			});
		}

		return group;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get group by id: ${groupId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const createGroup = async (
	name: string,
	userId: number,
	organizationId: number,
) => {
	try {
		const existingGroupWithinOrganization = await db.group.findFirst({
			where: {
				name,
				organizationId,
				deletedAt: null,
			},
		});

		if (existingGroupWithinOrganization) {
			throw new TRPCError({
				message: `There is already a group with the name: ${name} in your organization`,
				code: "CONFLICT",
			});
		}

		const group = await db.group.create({
			data: {
				name,
				members: {
					connect: {
						id: userId,
					},
				},
			},
		});

		if (!group) {
			throw new TRPCError({
				message: `Failed to create group with name: ${name}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return group;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to create group with name: ${name}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const joinGroup = async (
	groupId: number,
	userId: number,
	organizationId: number,
) => {
	try {
		const existingGroup = await db.group.findFirst({
			where: {
				id: groupId,
				organizationId,
				deletedAt: null,
			},
		});

		if (!existingGroup) {
			throw new TRPCError({
				message: `There is no group with the id: ${groupId}`,
				code: "NOT_FOUND",
			});
		}

		if (existingGroup?.organizationId !== organizationId) {
			throw new TRPCError({
				message: `You are not allowed to join the group with id: ${groupId}`,
				code: "UNAUTHORIZED",
			});
		}

		const groupMember = await db.groupMember.create({
			data: {
				groupId,
				memberId: userId,
			},
		});

		if (!groupMember) {
			throw new TRPCError({
				message: `Failed to join group with id: ${groupId}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return groupMember;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to join group with id: ${groupId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const leaveGroup = async (groupId: number, userId: number) => {
	try {
		const result = await db.groupMember.deleteMany({
			where: {
				groupId: groupId,
				memberId: userId,
			},
		});

		if (!result.count) {
			throw new TRPCError({
				message: `Failed to leave group with id: ${groupId}`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return !!result.count;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to leave group with id: ${groupId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
