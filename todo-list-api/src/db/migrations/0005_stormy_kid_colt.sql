CREATE TABLE "roadmap_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"quarter" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'upcoming',
	"display_order" integer DEFAULT 0,
	"color" text DEFAULT '#000000',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
