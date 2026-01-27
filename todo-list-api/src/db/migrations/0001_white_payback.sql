CREATE TABLE "program_discussions" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'discussion',
	"tags" text[],
	"parent_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_organizationId_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_inviterId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_organizationId_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "performance_stats" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "positions" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "action_plans" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "action_plans" ALTER COLUMN "org_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "folders" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "folders" ALTER COLUMN "org_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "org_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "assessments" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "big_data" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "targets" ALTER COLUMN "org_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "inviter_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "owner_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "project_manager" text;--> statement-breakpoint
ALTER TABLE "program_discussions" ADD CONSTRAINT "program_discussions_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_discussions" ADD CONSTRAINT "program_discussions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" DROP COLUMN "organizationId";--> statement-breakpoint
ALTER TABLE "invitation" DROP COLUMN "expiresAt";--> statement-breakpoint
ALTER TABLE "invitation" DROP COLUMN "inviterId";--> statement-breakpoint
ALTER TABLE "member" DROP COLUMN "organizationId";--> statement-breakpoint
ALTER TABLE "member" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "member" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "ownerId";