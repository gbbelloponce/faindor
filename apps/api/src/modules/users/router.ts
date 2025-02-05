import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { positiveNumberSchema } from "@shared/types/schemas";
import { getPublicUserInfoById, getUserByEmail, getUserById } from "./service";

const t = initTRPC.create();

export const usersRouter = t.router({
	getPublicUserInfoById: t.procedure
		.input(z.object({ id: positiveNumberSchema }))
		.query(async ({ input }) => {
			return await getPublicUserInfoById(input.id);
		}),
	getUserById: t.procedure
		.input(z.object({ id: positiveNumberSchema }))
		.query(async ({ input }) => {
			return await getUserById(input.id);
		}),
	getUserByEmail: t.procedure
		.input(z.object({ email: z.string().email() }))
		.query(async ({ input }) => {
			return await getUserByEmail(input.email);
		}),
});
