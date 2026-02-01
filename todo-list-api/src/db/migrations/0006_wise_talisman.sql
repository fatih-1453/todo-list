CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"donation_method" text,
	"collection_method" text,
	"transaction_number" text NOT NULL,
	"date" timestamp,
	"amount" numeric(15, 2) DEFAULT '0',
	"contract" text,
	"contract_type" text,
	"program" text,
	"program_type" text,
	"status" text DEFAULT 'Completed',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "transactions_transaction_number_unique" UNIQUE("transaction_number")
);
--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "output" text;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "keterangan" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "due_date";--> statement-breakpoint
ALTER TABLE "action_plans" DROP COLUMN "notes";