import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { Communities } from "./communities";
import { Users } from "./users";

export const Posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	userId: integer("user_id")
		.references(() => Users.id)
		.notNull(),
	communityId: integer("community_id").references(() => Communities.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at"),
	deletedAt: timestamp("deleted_at"),
});

export type Post = typeof Posts.$inferSelect;
export type PostInsert = typeof Posts.$inferInsert;
