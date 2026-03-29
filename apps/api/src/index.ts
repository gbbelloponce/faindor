import { trpcServer } from "@hono/trpc-server";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { rateLimiter } from "hono-rate-limiter";

import { uploadRoute } from "@/modules/upload/route";
import { appRouter } from "@/router";
import { createContext } from "@/shared/trpc/context";
import { validateEnv } from "@/shared/utils/env";

validateEnv();

const app = new Hono();

app.use(cors({ origin: [process.env.CLIENT_URL] }));
app.use(prettyJSON());

// Get IP from Bun server (direct connection) or proxy headers
const ipKeyGenerator = (c: Context) => {
	const bunServer = c.env as
		| { requestIP?: (req: Request) => { address: string } | null }
		| undefined;
	return (
		bunServer?.requestIP?.(c.req.raw)?.address ??
		c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
		c.req.header("x-real-ip") ??
		"unknown"
	);
};

// 15 attempts per 15 min per IP on login
app.use(
	"/trpc/auth.logInWithCredentials",
	rateLimiter({
		windowMs: 15 * 60 * 1000,
		limit: 15,
		keyGenerator: ipKeyGenerator,
	}),
);

// 10 attempts per hour per IP on register
app.use(
	"/trpc/auth.register",
	rateLimiter({
		windowMs: 60 * 60 * 1000,
		limit: 10,
		keyGenerator: ipKeyGenerator,
	}),
);

// 30 attempts per 15 min per IP on token refresh
app.use(
	"/trpc/auth.refreshToken",
	rateLimiter({
		windowMs: 15 * 60 * 1000,
		limit: 30,
		keyGenerator: ipKeyGenerator,
	}),
);

// 5 resend attempts per hour per IP
app.use(
	"/trpc/auth.sendVerificationEmail",
	rateLimiter({
		windowMs: 60 * 60 * 1000,
		limit: 5,
		keyGenerator: ipKeyGenerator,
	}),
);

app.route("/upload", uploadRoute);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: createContext,
	}),
);

export default {
	port: process.env.API_PORT,
	fetch: app.fetch,
};
