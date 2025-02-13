import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

import { Posts } from "./posts";
import { Users } from "./users";

export const Likes = pgTable("likes", {
	id: serial("id").primaryKey(),
	postId: integer("post_id")
		.references(() => Posts.id)
		.notNull(),
	userId: integer("user_id")
		.references(() => Users.id)
		.notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Like = typeof Likes.$inferSelect;
export type LikeInsert = typeof Likes.$inferInsert;
