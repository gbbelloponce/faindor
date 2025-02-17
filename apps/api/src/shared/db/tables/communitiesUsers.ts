import { integer, pgTable, serial } from "drizzle-orm/pg-core";

import { Communities } from "./communities";
import { Users } from "./users";

export const CommunitiesUsers = pgTable("communities_users", {
	id: serial("id").primaryKey(),
	communityId: integer("community_id")
		.references(() => Communities.id)
		.notNull(),
	userId: integer("user_id")
		.references(() => Users.id)
		.notNull(),
});

export type CommunityUser = typeof CommunitiesUsers.$inferSelect;
