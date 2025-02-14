import {
	type AnyPgColumn,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { Posts } from "./posts";
import { Users } from "./users";

export const Comments = pgTable("comments", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	postId: integer("post_id")
		.references(() => Posts.id)
		.notNull(),
	userId: integer("user_id")
		.references(() => Users.id)
		.notNull(),
	repliesTo: integer("replies_to").references((): AnyPgColumn => Comments.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at"),
	deletedAt: timestamp("deleted_at"),
});

export type Comment = typeof Comments.$inferSelect;
export type CommentInsert = typeof Comments.$inferInsert;
