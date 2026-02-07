"use client";

import Cookies from "js-cookie";
import { useParams, usePathname, useRouter } from "next/navigation";

import { PREFERRED_LOCALE_COOKIE_KEY } from "@/dictionaries/constants";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { i18n } from "@/dictionaries/i18n-config";
import type { Locale } from "@/dictionaries/i18n-config";

export const useLocale = () => {
	const { lang } = useParams<{ lang: string }>();
	const locale = lang as Locale;
	const pathname = usePathname();
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
