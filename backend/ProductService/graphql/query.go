package graphql

func GetAllProductsQuery() string {
    return `
    {
        products {
            id
            name
            description
            basePrice
            image
            category
            listed
            sellerId
            sellerUsername
            createdAt
            updatedAt
            variants {
                id
                variantName
                size
                color
                stockQuantity
                image
            }
        }
    }`
}
