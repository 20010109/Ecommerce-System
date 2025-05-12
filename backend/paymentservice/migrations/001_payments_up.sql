CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL UNIQUE, -- ✅ required for ON CONFLICT (order_id)
    user_id INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
    payment_method VARCHAR(50) NOT NULL, -- 'online', 'cod', etc.
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', etc.
    transaction_reference TEXT,
    payment_provider VARCHAR(100),
    paid_at TIMESTAMP, -- ✅ set when paid
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS payment_logs (
    id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g. 'created', 'verified', 'failed'
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

