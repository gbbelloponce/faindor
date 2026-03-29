import { z } from "zod";
import { authenticatedProcedure, router } from "@/shared/trpc";

import { positiveNumberSchema } from "@/shared/types/schemas";
import {
	createGroup,
	getGroupById,
	getGroupsByOrganizationId,
	joinGroup,
	leaveGroup,
} from "./service";

export const groupsRouter = router({
	getGroupsByOrganization: authenticatedProcedure.query(async ({ ctx }) => {
		return await getGroupsByOrganizationId(
			ctx.user.organizationId,
			ctx.user.id,
		);
	}),
	getGroupById: authenticatedProcedure
		.input(z.object({ groupId: positiveNumberSchema }))
		.query(async ({ input, ctx }) => {
			return await getGroupById(
				input.groupId,
				ctx.user.organizationId,
				ctx.user.id,
			);
		}),
	createGroup: authenticatedProcedure
		.input(z.object({ name: z.string().min(1).max(100).trim() }))
		.mutation(async ({ input, ctx }) => {
			return await createGroup(
				input.name,
				ctx.user.id,
				ctx.user.organizationId,
			);
		}),
	joinGroup: authenticatedProcedure
		.input(z.object({ groupId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			return await joinGroup(
				input.groupId,
				ctx.user.id,
				ctx.user.organizationId,
			);
		}),
	leaveGroup: authenticatedProcedure
		.input(z.object({ groupId: positiveNumberSchema }))
		.mutation(async ({ input, ctx }) => {
			return await leaveGroup(input.groupId, ctx.user.id);
		}),
});
