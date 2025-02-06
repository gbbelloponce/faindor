import { z } from "zod";

import { authenticatedProcedure, router } from "@shared/trpc";
import { positiveNumberSchema } from "@shared/types/schemas";
import { getPublicUserInfoById, getUserByEmail, getUserById } from "./service";

export const usersRouter = router({
	getPublicUserInfoById: authenticatedProcedure
		.input(z.object({ id: positiveNumberSchema }))
		.query(async ({ input }) => {
			return await getPublicUserInfoById(input.id);
		}),
	getUserById: authenticatedProcedure
		.input(z.object({ id: positiveNumberSchema }))
		.query(async ({ input }) => {
			return await getUserById(input.id);
		}),
	getUserByEmail: authenticatedProcedure
		.input(z.object({ email: z.string().email() }))
		.query(async ({ input }) => {
			return await getUserByEmail(input.email);
		}),
});
