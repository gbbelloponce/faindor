"use client";

import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";

import { getDictionary } from "@/dictionaries/get-dictionary";
import { i18n } from "@/dictionaries/i18n-config";
import type { Locale } from "@/dictionaries/i18n-config";
import { PREFERRED_LOCALE_COOKIE_KEY } from "@/lib/constants/cookies";

export const useLocale = () => {
	const pathname = usePathname();
	const locale = pathname.split("/")[1] as Locale;
	const dictionary = getDictionary(locale);
	const router = useRouter();

	const changeLocale = (newLocale: Locale) => {
		Cookies.set(PREFERRED_LOCALE_COOKIE_KEY, newLocale, {
			expires: 365,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});

		router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
	};

	return {
		locale: locale || i18n.defaultLocale,
		dictionary,
		changeLocale,
	};
};
