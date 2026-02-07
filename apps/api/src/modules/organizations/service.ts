import { TRPCError } from "@trpc/server";
import type { Organization } from "../../generated/prisma/client";

import { db } from "@/shared/db";
import { handleError } from "@/shared/utils/errors";
import type { CreateOrganizationBody } from "./types/request";

export const getOrganizationById = async (
	id: number,
): Promise<Organization> => {
	try {
		const organization = await db.organization.findFirst({
			where: {
				id,
			},
		});

		if (!organization) {
			throw new TRPCError({
				message: `There is no organization with the id: ${id}.`,
				code: "NOT_FOUND",
			});
		}

		return organization;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get organization by id: ${id}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getOrganizationByDomain = async (
	domain: string,
): Promise<Organization | null> => {
	try {
		const organization = await db.organization.findFirst({
			where: {
				domain,
			},
		});

		return organization;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get organization by domain: ${domain}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const createOrganization = async (
	body: CreateOrganizationBody,
): Promise<Organization> => {
	try {
		const organization = await db.organization.create({
			data: {
				name: body.name,
				domain: body.domain,
			},
		});

		return organization;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to create organization with domain: ${body.domain}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
