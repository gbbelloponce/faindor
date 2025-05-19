"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { TRPCClientError } from "@trpc/client";
import Cookies from "js-cookie";
import { useState } from "react";

import type { AppRouter } from "api";
import {
	ACCESS_TOKEN_COOKIE_CONFIG,
	ACCESS_TOKEN_COOKIE_KEY,
	REFRESH_TOKEN_COOKIE_CONFIG,
	REFRESH_TOKEN_COOKIE_KEY,
} from "../auth/constants";
import { TRPCProvider } from "./trpc";

const makeQueryClient = () => {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 60 * 1000,
				retry: (failureCount, error) => {
					// Don't retry on 401s since they will be refetched with refreshed token
					if (error instanceof TRPCClientError) {
						if (error.data?.httpStatus === 401) {
							return false;
						}
					}
					return failureCount < 3;
				},
			},
		},
	});
};

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return makeQueryClient();
	}

	// Browser: make a new query client if we don't already have one
	// This is very important, so we don't re-make a new client if React
	// suspends during the initial render. This may not be needed if we
	// have a suspense boundary BELOW the creation of the query client
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
};

export function AppTRPCProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: process.env.NEXT_PUBLIC_API_URL,
					headers: () => {
						const token = Cookies.get(ACCESS_TOKEN_COOKIE_KEY);
						return {
							Authorization: token ? `Bearer ${token}` : "",
						};
					},
					fetch: async (url: URL | RequestInfo, options?: RequestInit) => {
						const response = await fetch(url, options);

						// For 401s, it retries them with a refreshed token
						if (response.status === 401) {
							const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE_KEY);

							if (refreshToken) {
								try {
									const refreshResponse = await fetch(
										`${process.env.NEXT_PUBLIC_API_URL}/auth.refreshToken`,
										{
											method: "POST",
											headers: {
												"Content-Type": "application/json",
											},
											body: JSON.stringify({
												refreshToken,
											}),
										},
									);

									if (refreshResponse.ok) {
										const data = await refreshResponse.json();
										Cookies.set(
											ACCESS_TOKEN_COOKIE_KEY,
											data.result.data.token,
											ACCESS_TOKEN_COOKIE_CONFIG,
										);
										Cookies.set(
											REFRESH_TOKEN_COOKIE_KEY,
											data.result.data.refreshToken,
											REFRESH_TOKEN_COOKIE_CONFIG,
										);

										const newOptions = {
											...options,
											headers: options?.headers
												? {
														...options.headers,
														Authorization: `Bearer ${data.result.data.token}`,
													}
												: {
														Authorization: `Bearer ${data.result.data.token}`,
													},
										};

										return fetch(url, newOptions);
									}
								} catch (error) {
									console.error("Failed to refresh token:", error);
								}
							}
						}

						return response;
					},
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
