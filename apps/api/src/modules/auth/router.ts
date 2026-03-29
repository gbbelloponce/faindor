import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	createUser,
	getUserByCredentials,
	getUserById,
} from "@/modules/users/service";
import { db } from "@/shared/db";
import { authenticatedProcedure, publicProcedure, router } from "@/shared/trpc";
import { sendVerificationEmail } from "@/shared/utils/email";
import { handleError } from "@/shared/utils/errors";
import {
	createAccessToken,
	createEmailVerificationToken,
	createRefreshToken,
	decodeAccessToken,
	decodeEmailVerificationToken,
	decodeRefreshToken,
} from "@/shared/utils/token";
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
					tokenVersion: user.tokenVersion,
				});

				const refreshToken = await createRefreshToken({
					userId: user.id,
				});

				return {
					accessToken,
					refreshToken,
					user,
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
					user: fullUser,
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

				if (!user.active) {
					throw new TRPCError({
						message: "Account is suspended.",
						code: "UNAUTHORIZED",
						cause: "ACCOUNT_SUSPENDED",
					});
				}

				const accessToken = await createAccessToken({
					userId: user.id,
					userRole: user.role,
					organizationId: user.organizationId,
					tokenVersion: user.tokenVersion,
				});

				const refreshToken = await createRefreshToken({
					userId: user.id,
				});

				return {
					accessToken,
					refreshToken,
					user,
				};
			} catch (error) {
				throw handleError(error);
			}
		}),
	register: publicProcedure
		.input(registerSchema)
		.mutation(async ({ input }) => {
			try {
				const user = await createUser(input);

				// Fire-and-forget: don't fail registration if email sending fails
				void (async () => {
					try {
						const token = await createEmailVerificationToken({
							userId: user.id,
							email: user.email,
						});
						const verificationUrl = `${process.env.CLIENT_URL}/en/verify-email?token=${token}`;
						await sendVerificationEmail({ to: user.email, verificationUrl });
					} catch (e) {
						console.error("[auth] Failed to send verification email:", e);
					}
				})();

				return user;
			} catch (error) {
				throw handleError(error);
			}
		}),
	sendVerificationEmail: authenticatedProcedure.mutation(async ({ ctx }) => {
		try {
			const user = await db.user.findUnique({
				where: { id: ctx.user.id },
				select: { email: true, emailVerifiedAt: true },
			});

			if (!user) {
				throw new TRPCError({ message: "User not found.", code: "NOT_FOUND" });
			}

			if (user.emailVerifiedAt) {
				return { success: true };
			}

			const token = await createEmailVerificationToken({
				userId: ctx.user.id,
				email: user.email,
			});
			const verificationUrl = `${process.env.CLIENT_URL}/en/verify-email?token=${token}`;
			await sendVerificationEmail({ to: user.email, verificationUrl });

			return { success: true };
		} catch (error) {
			throw handleError(error);
		}
	}),
	verifyEmail: publicProcedure
		.input(z.object({ token: z.string() }))
		.mutation(async ({ input }) => {
			try {
				const { userId, email } = await decodeEmailVerificationToken(
					input.token,
				);

				const user = await db.user.findUnique({
					where: { id: userId },
					select: { email: true, emailVerifiedAt: true },
				});

				if (!user || user.email !== email) {
					throw new TRPCError({
						message: "Invalid verification token.",
						code: "BAD_REQUEST",
					});
				}

				if (!user.emailVerifiedAt) {
					await db.user.update({
						where: { id: userId },
						data: { emailVerifiedAt: new Date() },
					});
				}

				return { success: true };
			} catch (error) {
				throw handleError(error);
			}
		}),
	logOut: publicProcedure
		.input(z.object({ refreshToken: z.string() }))
		.mutation(async ({ input }) => {
			try {
				const { userId } = await decodeRefreshToken(input.refreshToken);
				await db.user.update({
					where: { id: userId },
					data: { tokenVersion: { increment: 1 } },
				});
				return { success: true };
			} catch (error) {
				throw handleError(error);
			}
		}),
});
