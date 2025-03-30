import { type NextRequest, NextResponse } from "next/server";

import {
	USER_ID_COOKIE_KEY,
	USER_TOKEN_COOKIE_KEY,
} from "./lib/constants/cookies";

const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get(USER_TOKEN_COOKIE_KEY);
	const userId = request.cookies.get(USER_ID_COOKIE_KEY);

	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/static") ||
		pathname.startsWith("/api")
	) {
		return NextResponse.next();
	}

	const isAuthenticated = !!token && !!userId;

	// If the user is authenticated and tries to access to login or register,
	// redirect to the home page
	if (isAuthenticated && authRoutes.includes(pathname)) {
		return NextResponse.redirect(new URL("/home", request.url));
	}

	// If the user is not authenticated and tries to access non login or register,
	// redirect to the login page
	if (!token && !authRoutes.includes(pathname)) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}
