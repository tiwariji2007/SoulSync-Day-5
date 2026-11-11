CREATE TABLE "user_roles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;