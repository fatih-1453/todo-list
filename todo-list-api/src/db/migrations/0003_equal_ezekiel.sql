ALTER TABLE "action_plans" ADD COLUMN "real_activity" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "program" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "indikator" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "lokasi" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "target_receiver" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "goal" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "position" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "subdivisi" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "executing_agency" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "classification" text;