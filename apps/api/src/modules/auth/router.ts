import {
	createUser,
	getUserByCredentials,
	getUserById,
} from "@/modules/users/service";
import { publicProcedure, router } from "@/shared/trpc";
import { handleError } from "@/shared/utils/errors";
import { createAccessToken, decodeAccessToken } from "@/shared/utils/token";
import {
	logInWithAccessTokenSchema,
	logInWithCredentialsSchema,
	registerSchema,
} from "./types/request";

export const authRouter = router({
	logInWithCredentials: publicProcedure
		.input(logInWithCredentialsSchema)
		.query(async ({ input }) => {
			try {
				const user = await getUserByCredentials({
					email: input.email,
					password: input.password,
				});

				const token = await createAccessToken({
					userId: user.id,
					userRole: user.role,
					organizationId: user.organizationId,
				});

				return {
					token,
					user: {
						id: user.id,
						name: user.name,
						role: user.role,
						email: user.email,
					},
				};
			} catch (error) {
				throw handleError(error);
			}
		}),
	logInWithAccessToken: publicProcedure
		.input(logInWithAccessTokenSchema)
		.query(async ({ input }) => {
			try {
				const user = await decodeAccessToken(input.accessToken);

				// TODO: Actually create a new token only if the original one is expired
				/* const newToken = await createAccessToken({
					userId: user.id,
					userRole: user.role,
					organizationId: user.organizationId,
				}); */

				const fullUser = await getUserById(user.id);

				return {
					// token: newToken,
					user: {
						id: fullUser.id,
						role: fullUser.role,
						name: fullUser.name,
						email: fullUser.email,
						organizationId: fullUser.organizationId,
					},
				};
			} catch (error) {
				throw handleError(error);
			}
		}),
	register: publicProcedure
		.input(registerSchema)
		.mutation(async ({ input }) => {
			try {
				return await createUser(input);
			} catch (error) {
				throw handleError(error);
			}
		}),
});
