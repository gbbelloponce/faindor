import { sign } from "hono/jwt";

import { createUser, getUserByCredentials } from "@modules/users/service";
import { publicProcedure, router } from "@shared/trpc";
import { loginSchema, registerSchema } from "./types/request";

export const authRouter = router({
	login: publicProcedure.input(loginSchema).query(async ({ input }) => {
		const user = await getUserByCredentials({
			email: input.email,
			password: input.password,
		});

		// Create token with the user's id and organization's domain
		const token = await sign(
			{
				iat: new Date().getTime() / 1000,
				userId: user.id,
				userRole: user.role,
				organizationId: user.organization.id,
			},
			process.env.JWT_SECRET,
		);

		return { token };
	}),
	register: publicProcedure
		.input(registerSchema)
		.mutation(async ({ input }) => {
			return await createUser(input);
		}),
});
