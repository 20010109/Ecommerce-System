CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    seller_id INTEGER NOT NULL,
    seller_username TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Uncategorized',
    listed BOOLEAN NOT NULL DEFAULT FALSE,
    sku TEXT UNIQUE
);

CREATE OR REPLACE FUNCTION set_product_sku_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET sku = CONCAT('SKU-', NEW.id)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_sku_on_insert
AFTER INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION set_product_sku_on_insert();

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    variant_name TEXT,
    size TEXT,
    color TEXT,
    stock_quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    sku TEXT NOT NULL UNIQUE,
    image TEXT NOT NULL,
    CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES products (id)
        ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION generate_sku()
RETURNS TRIGGER AS $$
DECLARE
    new_sku TEXT;
BEGIN
    new_sku := CONCAT(
        'SKU-',
        NEW.product_id, '-',
        COALESCE(NEW.size, 'X'), '-',
        COALESCE(NEW.color, 'X'), '-',
        FLOOR(RANDOM() * 100000)::INT
    );
    NEW.sku := new_sku;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sku_before_insert
BEFORE INSERT ON product_variants
FOR EACH ROW
EXECUTE FUNCTION generate_sku();
