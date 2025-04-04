import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import { appRouter } from "@/router";
import { createContext } from "@/shared/trpc/context";

const app = new Hono();

app.use(cors({ origin: [process.env.CLIENT_URL] }));
app.use(prettyJSON());

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
