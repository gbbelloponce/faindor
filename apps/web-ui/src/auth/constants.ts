export const AUTH_STORAGE_KEY = "faindor-auth-store";

export const USER_TOKEN_COOKIE_KEY = "faindor-user-token";

export const USER_ID_COOKIE_KEY = "faindor-user-id";

export const AUTH_COOKIE_CONFIG: Cookies.CookieAttributes = {
	expires: 30,
	sameSite: "strict",
	secure: process.env.NODE_ENV === "production",
};
