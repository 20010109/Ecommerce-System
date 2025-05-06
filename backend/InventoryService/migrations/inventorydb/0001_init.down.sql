DROP TRIGGER IF EXISTS set_sku_before_insert ON product_variants;
DROP FUNCTION IF EXISTS generate_sku;

DROP TABLE IF EXISTS product_variants;

DROP TRIGGER IF EXISTS trigger_set_sku_on_insert ON products;
DROP FUNCTION IF EXISTS set_product_sku_on_insert;

DROP TABLE IF EXISTS products;
