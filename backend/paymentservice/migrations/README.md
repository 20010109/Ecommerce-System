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

# 💳 Payment Service – Concept & Process Overview

This service is the **Payment Module** of our e-commerce system, responsible for handling all payment-related operations.

---

## 🚀 What This Service Does:

- **Handles payment creation** when an order is placed.
- **Tracks payment status changes** (e.g., pending → completed → refunded).
- **Logs all key payment events** in a dedicated logs table for transparency and auditing.

---

## 🔄 Payment Flow:

1️⃣ **Create Payment:**
- When a buyer places an order and selects a payment method, a new payment record is created.
- The payment starts with a **`pending` status**.
- A unique transaction reference is generated.
- A log entry is created indicating the payment is pending verification.

2️⃣ **Verify Payment:**
- Once the actual payment is confirmed (e.g., through a payment gateway like PayPal, Stripe, or GCash), the payment status is updated to **`completed`**.
- The system records the `paid_at` timestamp.   
- A log entry is added to track this verification step.

3️⃣ **Refund Payment:**
- If a refund is issued (due to order cancellation or another reason), the payment status is updated to **`refunded`**.
- A new log entry is created to record the refund action.

---

## 🗂️ Tables Involved:

### 1️⃣ `payments`
This table **stores the main payment details**, such as:
- `order_id`
- `user_id`
- `amount`
- `currency`
- `payment_method`
- `payment_status`
- `transaction_reference`
- Timestamps: `paid_at`, `created_at`, `updated_at`

### 2️⃣ `payment_logs`
This table **keeps a full history of payment events** to track changes and ensure transparency.

Fields include:
- `payment_id`
- `status`
- `message`
- `created_at` timestamp

---

## ✅ Why This Design?

- **Separation of concerns:** `payments` keeps the current state; `payment_logs` keeps the history.
- **Traceability:** Every major action (create, verify, refund) is logged.
- **Audit-ready:** Allows admins and devs to debug or review the lifecycle of any payment.
- **Extendable:** Easy to plug into real payment gateways or add features like fraud detection, retries, etc.

---

This service ensures that **payment handling is reliable, traceable, and easy to maintain.**
