ALTER TABLE "action_plans" ALTER COLUMN "lead" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "divisi" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "div";--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "wig";--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "lag";--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "plan";--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "eval_week_1";--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "eval_week_2";--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "eval_week_3";--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "eval_week_4";--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "real_week_1";