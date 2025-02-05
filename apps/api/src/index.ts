import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";

import { appRouter } from "./router";

const app = new Hono();

app.use("/trpc/*", trpcServer({ router: appRouter }));

export default app;
