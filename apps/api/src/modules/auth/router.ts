import {
	createUser,
	getUserByCredentials,
	getUserById,
} from "@/modules/users/service";
import { publicProcedure, router } from "@/shared/trpc";
import { handleError } from "@/shared/utils/errors";
import {
	createAccessToken,
	createRefreshToken,
	decodeAccessToken,
	decodeRefreshToken,
} from "@/shared/utils/token";
import { z } from "zod";
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

				const accessToken = await createAccessToken({
					userId: user.id,
					userRole: user.role,
					organizationId: user.organizationId,
				});

				const refreshToken = await createRefreshToken({
					userId: user.id,
				});

				return {
					accessToken,
					refreshToken,
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
				const fullUser = await getUserById(user.id);

				return {
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
	refreshToken: publicProcedure
		.input(z.object({ refreshToken: z.string() }))
		.mutation(async ({ input }) => {
			try {
				const { userId } = await decodeRefreshToken(input.refreshToken);
				const user = await getUserById(userId);

				const accessToken = await createAccessToken({
					userId: user.id,
					userRole: user.role,
					organizationId: user.organizationId,
				});

				const refreshToken = await createRefreshToken({
					userId: user.id,
				});

				return {
					accessToken,
					refreshToken,
					user: {
						id: user.id,
						name: user.name,
						role: user.role,
						email: user.email,
						organizationId: user.organizationId,
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
