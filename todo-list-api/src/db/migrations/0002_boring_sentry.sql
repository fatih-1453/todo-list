ALTER TABLE "folders" ADD COLUMN "program_id" integer;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "program_id" integer;--> statement-breakpoint
ALTER TABLE "program_discussions" ADD COLUMN "media_url" text;--> statement-breakpoint
ALTER TABLE "program_discussions" ADD COLUMN "media_type" text;--> statement-breakpoint
ALTER TABLE "program_discussions" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "program_discussions" ADD COLUMN "file_size" text;--> statement-breakpoint
ALTER TABLE "program_discussions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;