"use client";

import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ACCESS_TOKEN_COOKIE_KEY } from "./constants";
import { useAuth, useAuthStore } from "./useAuth";

export function RequireAuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isLoading, logInWithAccessToken, refreshAccessToken, logOut } =
		useAuth();
	const { currentUser } = useAuthStore();
	const [isInitialized, setIsInitialized] = useState(false);
	const router = useRouter();
	const params = useParams<{ lang: string }>();

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

	// Redirect to email verification page if email is not verified
	useEffect(() => {
		if (isInitialized && currentUser && !currentUser.emailVerifiedAt) {
			router.replace(`/${params.lang}/verify-email`);
		}
	}, [isInitialized, currentUser, router, params.lang]);

	if (!isInitialized || isLoading) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Loader2 className="animate-spin" />
			</div>
		);
	}

	return <>{children}</>;
}
