import {
	pgTable,
	serial,
	text,
	timestamp,
	boolean,
	uuid,
} from "drizzle-orm/pg-core";

export const Organizations = pgTable("organizations", {
	id: uuid("id").primaryKey(),
	domain: text("domain").notNull(),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export type Organization = typeof Organizations.$inferSelect;
export type OrganizationInsert = typeof Organizations.$inferInsert;
