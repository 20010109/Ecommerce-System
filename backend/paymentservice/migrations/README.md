# Payment Service Migrations

This folder contains SQL migrations to set up the database schema.

## Files:

1️⃣ `001_create_payments_table.sql`  
→ Creates the `payments` table.

2️⃣ `002_create_payment_logs_table.sql`  
→ Creates the `payment_logs` table.

## How to apply:

- Using **pgAdmin 4:**
  - Open your `paymentdb` database.
  - For each file:
    - Open the SQL query tool,
    - Paste the content of the `.sql` file,
    - Execute.

- Using **psql CLI:**

```bash
psql -U postgres -d paymentdb -f migrations/001_create_payments_table.sql
psql -U postgres -d paymentdb -f migrations/002_create_payment_logs_table.sql
