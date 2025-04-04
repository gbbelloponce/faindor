import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { USER_ID_COOKIE_KEY, USER_TOKEN_COOKIE_KEY } from "@/auth/constants";

const AUTH_COOKIE_CONFIG: Cookies.CookieAttributes = {
	expires: 30,
	sameSite: "strict",
	secure: process.env.NODE_ENV === "production",
};

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: {
		title: string;
		description: string;
	} | null;
	logInWithCredentials: (email: string, password: string) => Promise<boolean>;
	logInWithToken: (token: string) => Promise<boolean>;
	register: (
		firstName: string,
		lastName: string,
		email: string,
		password: string,
	) => Promise<boolean>;
	logOut: () => void;
	checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,

			logInWithCredentials: async (email, password): Promise<boolean> => {
				set({
					isLoading: true,
				});

				try {
					// Fake API call
					await new Promise((resolve) => setTimeout(resolve, 2000));

					// Generate a fake token (this will be server-side from the API call above)
					const token = `token_${Math.random().toString(36).substring(2, 15)}`;

					// Generate a fake user (this will be server-side from the API call above)
					const user: User = {
						id: Math.random().toString(36).substring(2, 9),
						firstName: "John",
						lastName: "Doe",
						email,
					};

					// Store both token and user ID in cookies
					Cookies.set(USER_TOKEN_COOKIE_KEY, token, AUTH_COOKIE_CONFIG);
					Cookies.set(USER_ID_COOKIE_KEY, user.id, AUTH_COOKIE_CONFIG);

					set({ user, isAuthenticated: true, isLoading: false });

					return true;
				} catch (error) {
					set({
						isLoading: false,
						error: {
							title: "Login failed",
							description: "There was an error logging in",
						},
					});
					return false;
				}
			},

			logInWithToken: async (token): Promise<boolean> => {
				set({
					isLoading: true,
				});

				try {
					// Fake API call
					await new Promise((resolve) => setTimeout(resolve, 2000));

					// Generate a fake user (this will be server-side from the API call above)
					const user: User = {
						id: Math.random().toString(36).substring(2, 9),
						firstName: "John",
						lastName: "Doe",
						email: "john@doe.com",
					};

					// Generate a new fake token (this will be server-side from the API call above)
					const newToken = `token_${Math.random().toString(36).substring(2, 15)}`;

					// Store user token and user ID in cookies
					Cookies.set(USER_TOKEN_COOKIE_KEY, newToken, AUTH_COOKIE_CONFIG);
					Cookies.set(USER_ID_COOKIE_KEY, user.id, AUTH_COOKIE_CONFIG);

					set({ user, isAuthenticated: true, isLoading: false });
					return true;
				} catch (error) {
					// Since token validation failed, log out
					get().logOut();
					return false;
				}
			},

			register: async (
				firstName,
				lastName,
				email,
				password,
			): Promise<boolean> => {
				set({
					isLoading: true,
				});

				try {
					// Fake API call
					await new Promise((resolve) => setTimeout(resolve, 2000));

					// Generate a fake token
					const token = `token_${Math.random().toString(36).substring(2, 15)}`;

					// Create fake user
					const user: User = {
						id: Math.random().toString(36).substring(2, 9),
						firstName,
						lastName,
						email,
					};

					// Store both token and user ID in cookies
					Cookies.set(USER_TOKEN_COOKIE_KEY, token, AUTH_COOKIE_CONFIG);
					Cookies.set(USER_ID_COOKIE_KEY, user.id, AUTH_COOKIE_CONFIG);

					set({ user, isAuthenticated: true, isLoading: false });

					return true;
				} catch (error) {
					set({
						isLoading: false,
						error: {
							title: "Registration failed",
							description: "There was an error registering",
						},
					});
					return false;
				}
			},

			logOut: (): void => {
				Cookies.remove(USER_TOKEN_COOKIE_KEY);
				Cookies.remove(USER_ID_COOKIE_KEY);

				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
			},

			checkAuth: async (): Promise<boolean> => {
				if (get().isLoading) {
					return false;
				}

				const { user } = get();
				const userIdFromCookies = Cookies.get(USER_ID_COOKIE_KEY);
				const token = Cookies.get(USER_TOKEN_COOKIE_KEY);

				// If we don't have either a user in the state nor no user in state and no cookies, we're not authenticated
				if (!user && !userIdFromCookies && !token) {
					set({ user: null, isAuthenticated: false, isLoading: false });
					return false;
				}

				// If we have a user in state, verify it matches with the cookie
				if (user) {
					if (user.id !== userIdFromCookies) {
						// User mismatch, so try to re-authenticate with token
						if (token) {
							return await get().logInWithToken(token);
						}

						// No token, so log out
						get().logOut();
						return false;
					}

					return true;
				}

				// No user in state but we have a token, so try to authenticate
				if (token) {
					return await get().logInWithToken(token);
				}

				// Somehow there is no user and no token, so log out
				get().logOut();
				return false;
			},
		}),
		{
			name: "faindor-auth-store",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
