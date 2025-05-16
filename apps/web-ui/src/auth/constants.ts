export const ACCESS_TOKEN_COOKIE_KEY = "faindor-access-token";

export const AUTH_COOKIE_CONFIG: Cookies.CookieAttributes = {
	expires: 30,
	sameSite: "strict",
	secure: process.env.NODE_ENV === "production",
};
