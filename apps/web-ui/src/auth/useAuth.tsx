"use client";

import { TRPCClientError } from "@trpc/client";
import Cookies from "js-cookie";
import { create } from "zustand";

import { useTRPCClient } from "@/trpc/trpc";
import {
	ACCESS_TOKEN_COOKIE_CONFIG,
	ACCESS_TOKEN_COOKIE_KEY,
	REFRESH_TOKEN_COOKIE_CONFIG,
	REFRESH_TOKEN_COOKIE_KEY,
} from "./constants";
import {
	type AuthResponse,
	type AuthState,
	LogInErrorCodeEnum,
	RefreshTokenErrorCodeEnum,
	RegisterErrorCodeEnum,
} from "./types";

// Create base store without API methods
export const useAuthStore = create<AuthState>((set) => ({
	isLoading: false,
	isRefreshing: false,
	currentUser: null,
	setIsLoading: (isLoading) => set({ isLoading }),
	setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
	setCurrentUser: (user) => set({ currentUser: user }),
}));

export const useAuth = () => {
	const {
		isLoading,
		isRefreshing,
		currentUser,
		setIsLoading,
		setIsRefreshing,
		setCurrentUser,
	} = useAuthStore();
	const trpc = useTRPCClient();

	const refreshAccessToken = async (): Promise<
		AuthResponse<RefreshTokenErrorCodeEnum>
	> => {
		const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE_KEY);

		if (!refreshToken) {
			return {
				success: false,
				error: {
					code: RefreshTokenErrorCodeEnum.UNAUTHORIZED,
				},
			};
		}

		setIsRefreshing(true);

		try {
			const {
				accessToken,
				refreshToken: newRefreshToken,
				user,
			} = await trpc.auth.refreshToken.mutate({
				refreshToken,
			});

			Cookies.set(
				ACCESS_TOKEN_COOKIE_KEY,
				accessToken,
				ACCESS_TOKEN_COOKIE_CONFIG,
			);
			Cookies.set(
				REFRESH_TOKEN_COOKIE_KEY,
				newRefreshToken,
				REFRESH_TOKEN_COOKIE_CONFIG,
			);
			setCurrentUser(user);

			return { success: true, error: null };
		} catch (error) {
			let errorCode = RefreshTokenErrorCodeEnum.INTERNAL_SERVER_ERROR;

			if (error instanceof TRPCClientError) {
				errorCode = error.data.code as RefreshTokenErrorCodeEnum;
			}

			return {
				success: false,
				error: {
					code: errorCode,
				},
			};
		} finally {
			setIsRefreshing(false);
		}
	};

	const logInWithCredentials = async (
		email: string,
		password: string,
	): Promise<AuthResponse<LogInErrorCodeEnum>> => {
		setIsLoading(true);

		try {
			const { accessToken, refreshToken, user } =
				await trpc.auth.logInWithCredentials.query({
					email,
					password,
				});

			Cookies.set(
				ACCESS_TOKEN_COOKIE_KEY,
				accessToken,
				ACCESS_TOKEN_COOKIE_CONFIG,
			);
			Cookies.set(
				REFRESH_TOKEN_COOKIE_KEY,
				refreshToken,
				REFRESH_TOKEN_COOKIE_CONFIG,
			);
			setCurrentUser(user);

			return { success: true, error: null };
		} catch (error) {
			let errorCode = LogInErrorCodeEnum.INTERNAL_SERVER_ERROR;

			if (error instanceof TRPCClientError) {
				errorCode = error.data.code as LogInErrorCodeEnum;
			}

			return {
				success: false,
				error: {
					code: errorCode,
				},
			};
		} finally {
			setIsLoading(false);
		}
	};

	const logInWithAccessToken = async (
		accessToken: string,
	): Promise<AuthResponse<LogInErrorCodeEnum>> => {
		setIsLoading(true);

		try {
			const { user } = await trpc.auth.logInWithAccessToken.query({
				accessToken,
			});

			setCurrentUser(user);

			return {
				success: true,
				error: null,
			};
		} catch (error) {
			let errorCode = LogInErrorCodeEnum.INTERNAL_SERVER_ERROR;

			if (error instanceof TRPCClientError) {
				errorCode = error.data.code as LogInErrorCodeEnum;
			}

			return {
				success: false,
				error: {
					code: errorCode,
				},
			};
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (
		firstName: string,
		lastName: string,
		email: string,
		password: string,
	): Promise<AuthResponse<RegisterErrorCodeEnum>> => {
		setIsLoading(true);

		try {
			await trpc.auth.register.mutate({
				name: `${firstName} ${lastName}`,
				email,
				password,
			});

			return {
				success: true,
				error: null,
			};
		} catch (error) {
			let errorCode = RegisterErrorCodeEnum.INTERNAL_SERVER_ERROR;

			if (error instanceof TRPCClientError) {
				errorCode = error.data.code as RegisterErrorCodeEnum;
			}

			return {
				success: false,
				error: {
					code: errorCode,
				},
			};
		} finally {
			setIsLoading(false);
		}
	};

	const logOut = () => {
		Cookies.remove(ACCESS_TOKEN_COOKIE_KEY);
		Cookies.remove(REFRESH_TOKEN_COOKIE_KEY);
		setCurrentUser(null);
		setIsLoading(false);
		setIsRefreshing(false);
	};

	return {
		isLoading,
		isRefreshing,
		currentUser,
		logInWithCredentials,
		logInWithAccessToken,
		refreshAccessToken,
		register,
		logOut,
	};
};
