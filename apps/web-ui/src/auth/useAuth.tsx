"use client";

import { TRPCClientError } from "@trpc/client";
import Cookies from "js-cookie";
import { create } from "zustand";

import { useTRPCClient } from "@/trpc/trpc";
import { ACCESS_TOKEN_COOKIE_KEY, AUTH_COOKIE_CONFIG } from "./constants";
import {
	type AuthResponse,
	type AuthState,
	LogInErrorCodeEnum,
	RegisterErrorCodeEnum,
} from "./types";

// Create base store without API methods
export const useAuthStore = create<AuthState>((set) => ({
	isLoading: false,
	currentUser: null,
	setIsLoading: (isLoading) => set({ isLoading }),
	setCurrentUser: (user) => set({ currentUser: user }),
}));

export const useAuth = () => {
	const { isLoading, currentUser, setIsLoading, setCurrentUser } =
		useAuthStore();
	const trpc = useTRPCClient();

	const logInWithCredentials = async (
		email: string,
		password: string,
	): Promise<AuthResponse<LogInErrorCodeEnum>> => {
		setIsLoading(true);

		try {
			const { token, user } = await trpc.auth.logInWithCredentials.query({
				email,
				password,
			});

			Cookies.set(ACCESS_TOKEN_COOKIE_KEY, token, AUTH_COOKIE_CONFIG);
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
		setCurrentUser(null);
		setIsLoading(false);
	};

	return {
		isLoading,
		currentUser,
		logInWithCredentials,
		logInWithAccessToken,
		register,
		logOut,
	};
};
