ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "no_wa" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_no_wa_unique" UNIQUE("no_wa");