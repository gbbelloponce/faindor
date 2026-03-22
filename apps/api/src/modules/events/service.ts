import { TRPCError } from "@trpc/server";

import { db } from "@/shared/db";
import { handleError } from "@/shared/utils/errors";
import { getPaginationArgs } from "@/shared/utils/pagination";
import type { CreateEventBody, RsvpBody } from "./types/request";

export const createEvent = async (
	authorId: number,
	organizationId: number,
	data: CreateEventBody,
) => {
	try {
		return await db.event.create({
			data: {
				...data,
				authorId,
				organizationId,
			},
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to create event for organization: ${organizationId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getEvents = async (organizationId: number, page = 1) => {
	try {
		return await db.event.findMany({
			where: {
				organizationId,
				deletedAt: null,
			},
			include: {
				author: {
					select: { id: true, name: true, avatarUrl: true },
				},
				_count: { select: { rsvps: { where: { status: "GOING" } } } },
			},
			orderBy: { startsAt: "asc" },
			...getPaginationArgs(page),
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get events for organization: ${organizationId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getEventById = async (id: number, organizationId: number) => {
	try {
		const event = await db.event.findFirst({
			where: { id, organizationId, deletedAt: null },
			include: {
				author: {
					select: { id: true, name: true, avatarUrl: true },
				},
				_count: { select: { rsvps: { where: { status: "GOING" } } } },
			},
		});

		if (!event) {
			throw new TRPCError({
				message: `There is no event with the id: ${id}`,
				code: "NOT_FOUND",
			});
		}

		return event;
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get event by id: ${id}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const rsvpToEvent = async (userId: number, data: RsvpBody) => {
	try {
		return await db.eventRsvp.upsert({
			where: {
				eventId_userId: { eventId: data.eventId, userId },
			},
			update: { status: data.status },
			create: { eventId: data.eventId, userId, status: data.status },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to RSVP to event: ${data.eventId} for user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};

export const getUserRsvpForEvent = async (userId: number, eventId: number) => {
	try {
		return await db.eventRsvp.findUnique({
			where: { eventId_userId: { eventId, userId } },
		});
	} catch (error) {
		throw handleError(error, {
			message: `Failed to get RSVP for event: ${eventId} user: ${userId}`,
			code: "INTERNAL_SERVER_ERROR",
		});
	}
};
