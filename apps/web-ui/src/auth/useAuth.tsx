"use client";

import { TRPCClientError } from "@trpc/client";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

import { useTRPCClient } from "@/trpc/trpc";
import {
	AUTH_COOKIE_CONFIG,
	AUTH_STORAGE_KEY,
	USER_ID_COOKIE_KEY,
	USER_TOKEN_COOKIE_KEY,
} from "./constants";
import {
	type AuthResponse,
	type AuthStorage,
	LogInErrorCodeEnum,
	RegisterErrorCodeEnum,
	type User,
} from "./types";

export const useAuth = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	// On mount, load possible authenticated user from local storage
	useEffect(() => {
		const storageString = localStorage.getItem("faindor-auth-store");
		if (!storageString) return;

		const parsedStorage = JSON.parse(storageString) as AuthStorage;

		if (parsedStorage.user?.id) {
			setUser(parsedStorage.user);
		}
	}, []);

	const saveAuthStateInLocalStorage = ({ user }: AuthStorage) => {
		localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
	};

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

			Cookies.set(USER_TOKEN_COOKIE_KEY, token, AUTH_COOKIE_CONFIG);
			Cookies.set(USER_ID_COOKIE_KEY, user.id.toString(), AUTH_COOKIE_CONFIG);

			setUser(user);

			saveAuthStateInLocalStorage({
				user,
			});

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

	const logInWithToken = async (
		token: string,
	): Promise<AuthResponse<LogInErrorCodeEnum>> => {
		setIsLoading(true);

		try {
			const { token: newToken, user } = await trpc.auth.logInWithToken.query({
				token,
			});

			Cookies.set(USER_TOKEN_COOKIE_KEY, newToken, AUTH_COOKIE_CONFIG);
			Cookies.set(USER_ID_COOKIE_KEY, user.id.toString(), AUTH_COOKIE_CONFIG);

			setUser(user);

			saveAuthStateInLocalStorage({
				user,
			});

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
				// TODO: Separate firstName and lastName in API and DB
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
		Cookies.remove(USER_TOKEN_COOKIE_KEY);
		Cookies.remove(USER_ID_COOKIE_KEY);

		setUser(null);
		setIsLoading(false);

		localStorage.removeItem(AUTH_STORAGE_KEY);
	};

	const checkAuth = async () => {
		if (isLoading) {
			return false;
		}

		const userIdFromCookies = Number(Cookies.get(USER_ID_COOKIE_KEY));
		const tokenFromCookies = Cookies.get(USER_TOKEN_COOKIE_KEY);

		// If we don't have either a user in the state nor no user in state and no cookies, we're not authenticated
		if (!user?.id && !userIdFromCookies && !tokenFromCookies) {
			return false;
		}

		// If we have a user in state, verify it matches with the cookie
		if (user) {
			if (user.id !== userIdFromCookies) {
				// User mismatch, so try to re-authenticate with token
				if (tokenFromCookies) {
					return await logInWithToken(tokenFromCookies);
				}

				// No token, so log out
				logOut();
				return false;
			}

			return true;
		}

		// No user in state but we have a token, so try to authenticate
		if (tokenFromCookies) {
			return await logInWithToken(tokenFromCookies);
		}

		// Somehow there is no user and no token, so log out
		logOut();
		return false;
	};

	return {
		isLoading,
		user,
		logInWithCredentials,
		logInWithToken,
		register,
		logOut,
		checkAuth,
	};
};
