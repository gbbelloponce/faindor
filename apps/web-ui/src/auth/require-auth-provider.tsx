"use client";

import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { USER_TOKEN_COOKIE_KEY } from "./constants";
import { useAuth } from "./useAuth";

export function RequireAuthProvider({
	children,
}: { children: React.ReactNode }) {
	const { isLoading, checkAuth } = useAuth();

	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		const initAuth = async () => {
			const token = Cookies.get(USER_TOKEN_COOKIE_KEY);

			if (token) {
				await checkAuth();
			}

			setIsInitialized(true);
		};

		initAuth();
	}, [checkAuth]);

	if (!isInitialized || isLoading) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Loader2 className="animate-spin" />
			</div>
		);
	}

	return <>{children}</>;
}
