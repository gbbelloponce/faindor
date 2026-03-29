"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useLocale } from "@/dictionaries/useLocale";
import { useAuthStore } from "./useAuth";

export function RequireAdminProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { currentUser } = useAuthStore();
	const router = useRouter();
	const { locale } = useLocale();

	useEffect(() => {
		if (currentUser && currentUser.role !== "APP_ADMIN") {
			router.replace(`/${locale}/home`);
		}
	}, [currentUser, router, locale]);

	if (!currentUser || currentUser.role !== "APP_ADMIN") {
		return null;
	}

	return <>{children}</>;
}
