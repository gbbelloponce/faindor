import { z } from "zod";

import { publicProcedure, router } from "@shared/trpc";
import { positiveNumberSchema } from "@shared/types/schemas";
import { getPublicUserInfoById, getUserByEmail, getUserById } from "./service";

export const usersRouter = router({
	getPublicUserInfoById: publicProcedure
		.input(z.object({ id: positiveNumberSchema }))
		.query(async ({ input }) => {
			return await getPublicUserInfoById(input.id);
		}),
	getUserById: publicProcedure
		.input(z.object({ id: positiveNumberSchema }))
		.query(async ({ input }) => {
			return await getUserById(input.id);
		}),
	getUserByEmail: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.query(async ({ input }) => {
			return await getUserByEmail(input.email);
		}),
});
