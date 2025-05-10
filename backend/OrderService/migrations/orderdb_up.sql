CREATE TABLE IF NOT EXISTS public.orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL,
    buyer_name TEXT NOT NULL,
    order_date TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    status TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    payment_verified_at TIMESTAMP WITHOUT TIME ZONE,
    shipping_method TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    seller_id INTEGER,
    seller_username TEXT
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    variant_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    variant_name TEXT,
    size TEXT,
    color TEXT,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    image_url TEXT
);
