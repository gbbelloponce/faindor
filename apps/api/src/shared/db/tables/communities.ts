import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { Users } from "./users";

export const Communities = pgTable("communities", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	ownerId: integer("owner_id")
		.references(() => Users.id)
		.notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export type Community = typeof Communities.$inferSelect;
export type CommunityInsert = typeof Communities.$inferInsert;
