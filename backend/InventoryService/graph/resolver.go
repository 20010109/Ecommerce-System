package graph

import (
	"context"
	"InventoryService/db"
	"InventoryService/graph/model"
	"time"
	"fmt"
	"strconv"
)

type Resolver struct{}

// mutationResolver handles the Mutation type defined in the schema.
type mutationResolver struct{ *Resolver }

// queryResolver handles the Query type defined in the schema.
type queryResolver struct{ *Resolver }

// Mutation returns the MutationResolver
func (r *Resolver) Mutation() MutationResolver {
	return &mutationResolver{r}
}

// Query returns the QueryResolver
func (r *Resolver) Query() QueryResolver {
	return &queryResolver{r}
}

// Helper function to convert time.Time to *string
func timeToStringPtr(t time.Time) *string {
	str := t.Format(time.RFC3339)
	return &str
}

// CreateProduct handles creating a new product
func (r *mutationResolver) CreateProduct(ctx context.Context, input model.NewProductInput) (*model.Product, error) {
	query := `INSERT INTO products (name, description, base_price, image) 
			  VALUES ($1, $2, $3, $4) 
			  RETURNING id, created_at, updated_at`

	var id int
	var createdAt, updatedAt time.Time
	err := db.Pool.QueryRow(ctx, query, input.Name, input.Description, input.BasePrice, input.Image).Scan(&id, &createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}

	idStr := fmt.Sprintf("%d", id)

	return &model.Product{
		ID:          idStr,
		Name:        input.Name,
		Description: input.Description,
		BasePrice:   input.BasePrice,
		Image:       input.Image,
		CreatedAt:   timeToStringPtr(createdAt),
		UpdatedAt:   timeToStringPtr(updatedAt),
	}, nil
}

// UpdateProduct handles updating an existing product
func (r *mutationResolver) UpdateProduct(ctx context.Context, id string, input model.UpdateProductInput) (*model.Product, error) {
	query := `UPDATE products SET name = $1, description = $2, base_price = $3, image = $4, updated_at = NOW() 
			  WHERE id = $5 RETURNING id, name, description, base_price, image, created_at, updated_at`

	var updatedProduct model.Product
	var createdAt, updatedAt time.Time
	err := db.Pool.QueryRow(ctx, query, input.Name, input.Description, input.BasePrice, input.Image, id).
		Scan(&updatedProduct.ID, &updatedProduct.Name, &updatedProduct.Description, &updatedProduct.BasePrice, &updatedProduct.Image, &createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}

	updatedProduct.CreatedAt = timeToStringPtr(createdAt)
	updatedProduct.UpdatedAt = timeToStringPtr(updatedAt)

	return &updatedProduct, nil
}

// DeleteProduct handles deleting a product by its ID
func (r *mutationResolver) DeleteProduct(ctx context.Context, id string) (bool, error) {
	query := `DELETE FROM products WHERE id = $1`
	result, err := db.Pool.Exec(ctx, query, id)
	if err != nil {
		return false, err
	}

	rowsAffected := result.RowsAffected()
	return rowsAffected > 0, nil
}

// CreateVariant handles creating a new product variant
func (r *mutationResolver) CreateVariant(ctx context.Context, input model.NewVariantInput) (*model.ProductVariant, error) {
	query := `INSERT INTO product_variants (product_id, variant_name, size, color, price, stock_quantity) 
			  VALUES ($1, $2, $3, $4, $5, $6) 
			  RETURNING id, product_id, variant_name, size, color, price, stock_quantity, created_at, updated_at`

	var id, productID int
	var variantName, size, color string
	var price float64
	var stockQuantity int
	var createdAt, updatedAt time.Time

	err := db.Pool.QueryRow(ctx, query, input.ProductID, input.VariantName, input.Size, input.Color, input.Price, input.StockQuantity).
		Scan(&id, &productID, &variantName, &size, &color, &price, &stockQuantity, &createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}

	// Convert the string fields to *string
	return &model.ProductVariant{
		ID:            strconv.Itoa(id),
		ProductID:     strconv.Itoa(productID),
		VariantName:   &variantName,   // Convert to *string
		Size:          &size,          // Convert to *string
		Color:         &color,         // Convert to *string
		Price:         price,
		StockQuantity: int32(stockQuantity), // Convert to int32
		CreatedAt:     timeToStringPtr(createdAt),
		UpdatedAt:     timeToStringPtr(updatedAt),
	}, nil
}

// UpdateVariant handles updating an existing product variant
func (r *mutationResolver) UpdateVariant(ctx context.Context, id string, input model.UpdateVariantInput) (*model.ProductVariant, error) {
	query := `UPDATE product_variants SET variant_name = $1, size = $2, color = $3, price = $4, stock_quantity = $5, updated_at = NOW() 
			  WHERE id = $6 RETURNING id, product_id, variant_name, size, color, price, stock_quantity, created_at, updated_at`

	var updatedVariant model.ProductVariant
	var createdAt, updatedAt time.Time

	err := db.Pool.QueryRow(ctx, query, input.VariantName, input.Size, input.Color, input.Price, input.StockQuantity, id).
		Scan(&updatedVariant.ID, &updatedVariant.ProductID, &updatedVariant.VariantName, &updatedVariant.Size, &updatedVariant.Color, &updatedVariant.Price, &updatedVariant.StockQuantity, &createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}

	updatedVariant.CreatedAt = timeToStringPtr(createdAt)
	updatedVariant.UpdatedAt = timeToStringPtr(updatedAt)

	return &updatedVariant, nil
}

// DeleteVariant handles deleting a product variant by its ID
func (r *mutationResolver) DeleteVariant(ctx context.Context, id string) (bool, error) {
	query := `DELETE FROM product_variants WHERE id = $1`
	result, err := db.Pool.Exec(ctx, query, id)
	if err != nil {
		return false, err
	}

	// Check if any rows were affected
	rowsAffected := result.RowsAffected()
	return rowsAffected > 0, nil
}




// Products retrieves all products
func (r *queryResolver) Products(ctx context.Context) ([]*model.Product, error) {
	rows, err := db.Pool.Query(ctx, `SELECT id, name, description, base_price, image, created_at, updated_at FROM products`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*model.Product
	for rows.Next() {
		var p model.Product
		var createdAt, updatedAt time.Time
		err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.BasePrice, &p.Image, &createdAt, &updatedAt)
		if err != nil {
			return nil, err
		}
		p.CreatedAt = timeToStringPtr(createdAt)
		p.UpdatedAt = timeToStringPtr(updatedAt)
		products = append(products, &p)
	}

	return products, nil
}

// Product retrieves a product by its ID
func (r *queryResolver) Product(ctx context.Context, id string) (*model.Product, error) {
	query := `SELECT id, name, description, base_price, image, created_at, updated_at FROM products WHERE id = $1`
	var p model.Product
	var createdAt, updatedAt time.Time
	err := db.Pool.QueryRow(ctx, query, id).Scan(&p.ID, &p.Name, &p.Description, &p.BasePrice, &p.Image, &createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}
	p.CreatedAt = timeToStringPtr(createdAt)
	p.UpdatedAt = timeToStringPtr(updatedAt)

	return &p, nil
}

// ProductVariants retrieves all variants for a specific product
func (r *queryResolver) ProductVariants(ctx context.Context, productID string) ([]*model.ProductVariant, error) {
	query := `SELECT id, product_id, variant_name, size, color, price, stock_quantity, created_at, updated_at 
			  FROM variants WHERE product_id = $1`

	rows, err := db.Pool.Query(ctx, query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []*model.ProductVariant
	for rows.Next() {
		var v model.ProductVariant
		var createdAt, updatedAt time.Time
		err := rows.Scan(&v.ID, &v.ProductID, &v.VariantName, &v.Size, &v.Color, &v.Price, &v.StockQuantity, &createdAt, &updatedAt)
		if err != nil {
			return nil, err
		}
		v.CreatedAt = timeToStringPtr(createdAt)
		v.UpdatedAt = timeToStringPtr(updatedAt)
		variants = append(variants, &v)
	}

	return variants, nil
}
