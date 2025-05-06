CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_seller BOOLEAN NOT NULL DEFAULT FALSE,
    contact_number TEXT,
    address TEXT
);
