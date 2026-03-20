import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";

const envFile = process.env.ENV_FILE ?? ".env.local";
config({ path: envFile });

export default defineConfig({
	schema: "src/shared/db/",
	migrations: {
		path: "src/shared/db/migrations",
	},
	datasource: {
		url: env("DIRECT_URL"),
	},
});
