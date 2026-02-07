import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "src/shared/db/schema",
	migrations: {
		path: "src/shared/db/schema/migrations",
	},
	datasource: {
		url: process.env.DATABASE_URL,
	},
});
