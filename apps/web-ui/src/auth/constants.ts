export const ACCESS_TOKEN_COOKIE_KEY = "faindor-access-token";
export const REFRESH_TOKEN_COOKIE_KEY = "faindor-refresh-token";

export const ACCESS_TOKEN_EXPIRES_IN_MINUTES = 15;
export const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

export const AUTH_COOKIE_CONFIG: Cookies.CookieAttributes = {
	sameSite: "strict",
	secure: process.env.NODE_ENV === "production",
};

export const ACCESS_TOKEN_COOKIE_CONFIG: Cookies.CookieAttributes = {
	...AUTH_COOKIE_CONFIG,
	expires: (1 / 24 / 60) * ACCESS_TOKEN_EXPIRES_IN_MINUTES, // Converting minutes to days
};

export const REFRESH_TOKEN_COOKIE_CONFIG: Cookies.CookieAttributes = {
	...AUTH_COOKIE_CONFIG,
	expires: REFRESH_TOKEN_EXPIRES_IN_DAYS,
};
