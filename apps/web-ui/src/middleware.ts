import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { type NextRequest, NextResponse } from "next/server";

import {
	ACCESS_TOKEN_COOKIE_KEY,
	REFRESH_TOKEN_COOKIE_KEY,
} from "@/auth/constants";
import { PREFERRED_LOCALE_COOKIE_KEY } from "@/dictionaries/constants";
import { type Locale, i18n } from "@/dictionaries/i18n-config";

const authRoutes = ["/login", "/register"];

function getLocale(request: NextRequest) {
	const preferredLocale = request.cookies.get(PREFERRED_LOCALE_COOKIE_KEY)
		?.value as Locale | undefined;

	if (preferredLocale && i18n.locales.includes(preferredLocale)) {
		return preferredLocale;
	}

	const negotiatorHeaders: Record<string, string> = {};
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

	// @ts-ignore locales are readonly
	const locales: string[] = i18n.locales;

	const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
		locales,
	);

	const locale = matchLocale(languages, locales, i18n.defaultLocale);

	return locale;
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
	const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value;
	const isAuthenticated = !!accessToken && !!refreshToken;

	const locale = getLocale(request);

	// Handler for root path
	if (pathname === "/") {
		const destination = isAuthenticated ? "home" : "login";
		const response = NextResponse.redirect(
			new URL(`/${locale}/${destination}`, request.url),
		);
		response.headers.set("x-middleware-cache", "no-cache");
		return response;
	}

	const hasLocale = i18n.locales.some(
		(locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
	);

	if (!hasLocale) {
		const response = NextResponse.redirect(
			new URL(`/${locale}${pathname}`, request.url),
		);
		response.headers.set("x-middleware-cache", "no-cache");
		return response;
	}

	// Use path without locale for auth check purposes
	const pathWithoutLocale = pathname.split("/").slice(2).join("/");

	if (isAuthenticated && authRoutes.includes(`/${pathWithoutLocale}`)) {
		const response = NextResponse.redirect(
			new URL(`/${locale}/home`, request.url),
		);
		response.headers.set("x-middleware-cache", "no-cache");
		return response;
	}

	if (!isAuthenticated && !authRoutes.includes(`/${pathWithoutLocale}`)) {
		const response = NextResponse.redirect(
			new URL(`/${locale}/login`, request.url),
		);
		response.headers.set("x-middleware-cache", "no-cache");
		return response;
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all paths except:
		 * - api (API routes)
		 * - _next (Next.js internals)
		 * - public (public directory)
		 * - faindor-logo-rounded.png (current testing logo)
		 * - favicon.ico (favicon)
		 */
		"/((?!api|_next|public|faindor-logo-rounded.png|favicon.ico).*)",
	],
};
