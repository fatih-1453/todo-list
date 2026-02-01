CREATE TABLE IF NOT EXISTS "transactions" (
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
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='action_plans' AND column_name='output') THEN
        ALTER TABLE "action_plans" ADD COLUMN "output" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='action_plans' AND column_name='keterangan') THEN
        ALTER TABLE "action_plans" ADD COLUMN "keterangan" text;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='action_plans' AND column_name='due_date') THEN
        ALTER TABLE "action_plans" DROP COLUMN "due_date";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='action_plans' AND column_name='notes') THEN
        ALTER TABLE "action_plans" DROP COLUMN "notes";
    END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='transactions_org_id_organizations_id_fk') THEN
        ALTER TABLE "transactions" ADD CONSTRAINT "transactions_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;