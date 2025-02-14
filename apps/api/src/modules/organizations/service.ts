import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { checkDBError } from "@shared/utils/errors";
import type { CreateOrganizationParams } from "./types/request";

export const getOrganizationById = async (id: number) => {
	try {
		const result = await db
			.select({
				id: Organizations.id,
				domain: Organizations.domain,
				createdAt: Organizations.createdAt,
				deletedAt: Organizations.deletedAt,
			})
			.from(Organizations)
			.where(eq(Organizations.id, id));

		if (!result.length) {
			throw new TRPCError({
				message: `There is no organization with the id: ${id}.`,
				code: "NOT_FOUND",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const getOrganizationByDomain = async (domain: string) => {
	try {
		const result = await db
			.select({
				id: Organizations.id,
				domain: Organizations.domain,
				createdAt: Organizations.createdAt,
				deletedAt: Organizations.deletedAt,
			})
			.from(Organizations)
			.where(eq(Organizations.domain, domain));

		if (!result.length) return null;

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};

export const createOrganization = async ({
	name,
	domain,
}: CreateOrganizationParams) => {
	try {
		const result = await db
			.insert(Organizations)
			.values({
				name,
				domain,
			})
			.returning({ id: Organizations.id });

		if (!result.length) {
			throw new TRPCError({
				message: `Failed to create organization with domain: ${domain}.`,
				code: "INTERNAL_SERVER_ERROR",
			});
		}

		return result[0];
	} catch (error) {
		throw checkDBError(error);
	}
};
