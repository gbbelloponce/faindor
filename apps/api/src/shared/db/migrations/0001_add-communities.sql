CREATE TABLE "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "communities_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "domain" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "community_id" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities_users" ADD CONSTRAINT "communities_users_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities_users" ADD CONSTRAINT "communities_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;