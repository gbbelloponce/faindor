import {
	uuid,
	pgTable,
	serial,
	text,
	timestamp,
	boolean,
} from "drizzle-orm/pg-core";

import { UserRoles } from "../../types/roles";
import { Organizations } from "./organizations";

export const Users = pgTable("users", {
	id: uuid("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").unique().notNull(),
	password: text("password").notNull(),
	organizationId: uuid("organization_id")
		.references(() => Organizations.id)
		.notNull(),
	role: text("role")
		.$type<
			UserRoles.APP_ADMIN | UserRoles.ORGANIZATION_ADMIN | UserRoles.USER
		>()
		.notNull()
		.default(UserRoles.USER),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export type User = typeof Users.$inferSelect;
export type UserInsert = typeof Users.$inferInsert;
