import {
	createUser,
	getUserByCredentials,
	getUserById,
} from "@/modules/users/service";
import { publicProcedure, router } from "@/shared/trpc";
import { checkDBError } from "@/shared/utils/errors";
import {
	createTokenFromUser,
	decodeLoggedUserFromToken,
} from "@/shared/utils/token";
import {
	logInWithCredentialsSchema,
	logInWithTokenSchema,
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

				const token = await createTokenFromUser({
					userId: user.id,
					userRole: user.role,
					organizationId: user.organization.id,
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
				throw checkDBError(error);
			}
		}),
	logInWithToken: publicProcedure
		.input(logInWithTokenSchema)
		.query(async ({ input }) => {
			try {
				const user = await decodeLoggedUserFromToken(input.token);

				// TODO: Actually create a new token only if the original one is expired
				const newToken = await createTokenFromUser({
					userId: user.id,
					userRole: user.role,
					organizationId: user.organizationId,
				});

				const fullUser = await getUserById(user.id);

				return {
					token: newToken,
					user: {
						id: fullUser.id,
						role: fullUser.role,
						name: fullUser.name,
						email: fullUser.email,
					},
				};
			} catch (error) {
				throw checkDBError(error);
			}
		}),
	register: publicProcedure
		.input(registerSchema)
		.mutation(async ({ input }) => {
			try {
				return await createUser(input);
			} catch (error) {
				throw checkDBError(error);
			}
		}),
});
