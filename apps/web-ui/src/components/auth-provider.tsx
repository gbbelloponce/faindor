"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/auth/auth-store";
import { USER_TOKEN_COOKIE_KEY } from "@/auth/constants";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isInitialized, setIsInitialized] = useState(false);
	const { isLoading, checkAuth } = useAuthStore();

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
		return <div>Loading...</div>;
	}

	return <>{children}</>;
}
