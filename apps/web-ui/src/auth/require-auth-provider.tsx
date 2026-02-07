"use client";

import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ACCESS_TOKEN_COOKIE_KEY } from "./constants";
import { useAuth } from "./useAuth";

export function RequireAuthProvider({
	children,
}: { children: React.ReactNode }) {
	const { isLoading, logInWithAccessToken, refreshAccessToken, logOut } =
		useAuth();
	const [isInitialized, setIsInitialized] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: This should only run once on mount
	useEffect(() => {
		const initAuth = async () => {
			const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE_KEY);

			if (accessToken) {
				const loggedIn = await logInWithAccessToken(accessToken);

				if (loggedIn.success) {
					setIsInitialized(true);
					return;
				}
			}

			// Access token missing or expired — attempt refresh
			const refreshed = await refreshAccessToken();

			if (refreshed.success) {
				setIsInitialized(true);
				return;
			}

			logOut();
			setIsInitialized(true);
		};

		initAuth();
	}, []);

	if (!isInitialized || isLoading) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Loader2 className="animate-spin" />
			</div>
		);
	}

	return <>{children}</>;
}
