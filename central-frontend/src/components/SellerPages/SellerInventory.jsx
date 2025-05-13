import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { useSubscription, useMutation } from '@apollo/client';
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  CREATE_VARIANT,
  UPDATE_VARIANT,
  DELETE_VARIANT,
  TOGGLE_LISTED_STATUS,
} from '../../graphql/mutations';
import {
  SUBSCRIBE_TO_NEW_PRODUCTS,
  SUBSCRIBE_TO_NEW_VARIANTS,
} from '../../graphql/subscriptions';
import { jwtDecode } from "jwt-decode";
import "./style/SellerInventory.css";

Modal.setAppElement('#root');

const Inventory = () => {
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productDetailsModalOpen, setProductDetailsModalOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantEditModalOpen, setVariantEditModalOpen] = useState(false);
  const [productImagePreview, setProductImagePreview] = useState('');


  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productEditDetails, setProductEditDetails] = useState({
    name: '',
    description: '',
    basePrice: '',
    image: '',
    category: '',
    listed: false,
  });

  const [variantDetails, setVariantDetails] = useState({
    variantName: '',
    size: '',
    color: '',
    price: '',
    stockQuantity: '',
    image: '',
  });
  const [selectedVariant, setSelectedVariant] = useState(null); // For editing variant

  // Subscriptions
  const { data: subscriptionData, loading, error } = useSubscription(SUBSCRIBE_TO_NEW_PRODUCTS);
  const { data: variantSubscriptionData } = useSubscription(SUBSCRIBE_TO_NEW_VARIANTS, {
    skip: !selectedProduct,
    variables: { productId: selectedProduct?.id },
  });

  // Mutations
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  const [createVariant] = useMutation(CREATE_VARIANT);
  const [updateVariant] = useMutation(UPDATE_VARIANT);
  const [deleteVariant] = useMutation(DELETE_VARIANT);
  const [toggleListedStatus] = useMutation(TOGGLE_LISTED_STATUS);

  // Sync subscription updates with products list
  const productsList = useMemo(() => {
    return subscriptionData?.products || [];
  }, [subscriptionData]);

  // Update selectedProduct if products list changes
  useEffect(() => {
    if (!selectedProduct) return;
    const updatedProduct = productsList.find((p) => p.id === selectedProduct.id);
    if (updatedProduct && updatedProduct !== selectedProduct) {
      setSelectedProduct(updatedProduct);
    }
  }, [productsList, selectedProduct]);

  // Product Handlers
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    setProductImagePreview('');

    try {
      await createProduct({
        variables: {
          name: form.name.value,
          description: form.description.value || null,
          basePrice: parseFloat(form.basePrice.value),
          image: form.image.value || null,
          category: form.category.value,
          listed: form.listed.checked || false,
        },
      });
      form.reset();
      setProductModalOpen(false);
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  const handleUpdateProductDetails = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({
        variables: {
          id: selectedProduct.id,
          name: productEditDetails.name,
          description: productEditDetails.description || null,
          basePrice: parseFloat(productEditDetails.basePrice),
          image: productEditDetails.image || null,
          category: productEditDetails.category,
        }
      });
      setIsEditingProduct(false);
    } catch (err) {
      console.error("Error updating product details:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct({
        variables: { id }
      });
      setProductDetailsModalOpen(false);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleToggleListed = async (product, newListedStatus) => {
    console.log("Toggling listed status for product:", product.id, "to", newListedStatus);
    try {
      await toggleListedStatus({
        variables: {
          id: product.id,
          listed: newListedStatus,
        }
      });
    } catch (err) {
      console.error("Error toggling listed status:", err);
    }
  };

  const handleProductEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductEditDetails((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Variant Handlers
  const handleCreateVariant = async (e) => {
    e.preventDefault();
    const { variantName, size, color, stockQuantity, image } = variantDetails;
    try {
      await createVariant({
        variables: {
          productId: selectedProduct.id,
          variantName,
          size,
          color,
          stockQuantity: parseInt(stockQuantity, 10),
          image: image || "",
        },
      });
      setVariantDetails({
        variantName: '',
        size: '',
        color: '',
        stockQuantity: '',
        image: '',
      });
      setVariantModalOpen(false);
    } catch (err) {
      console.error("Error creating variant:", err);
    }
  };

  const handleUpdateVariant = async (e) => {
    e.preventDefault();
    const { variantName, size, color, stockQuantity, image } = variantDetails;
    try {
      await updateVariant({
        variables: {
          id: selectedVariant.id,
          variantName,
          size,
          color,
          stockQuantity: parseInt(stockQuantity, 10),
          image: image || "",
        },
      });
      setVariantEditModalOpen(false);
    } catch (err) {
      console.error("Error updating variant:", err);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      await deleteVariant({
        variables: { id: variantId }
      });
    } catch (err) {
      console.error("Error deleting variant:", err);
    }
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantDetails((prev) => ({ ...prev, [name]: value }));
  };

  const closeProductDetailsModal = () => {
    setProductDetailsModalOpen(false);
    setSelectedProduct(null);
    setIsEditingProduct(false);
  };

  const token = localStorage.getItem("token");
  let shopname = "Seller";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      shopname = decoded.shop_name || "Seller";
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }
  
  return (
    <div className="sellerinv-inventory-container">
      <div className="sellerinv-inventory-header">
        <h1 className="sellerinv-inventory-title">{shopname}'s Inventory</h1>
        <button
          className="sellerinv-btn sellerinv-btn-add-product"
          onClick={() => setProductModalOpen(true)}
        >
          Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="sellerinv-table-container">
        {loading && <p>Loading products...</p>}
        {error && <p>Error fetching products: {error.message}</p>}
        {!loading && !error && (
          <table className="sellerinv-inventory-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Stock Status</th>
                <th>Unit Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productsList.length > 0 ? (
                productsList.map((product) => {
                  const totalStock =
                    product.product_variants_aggregate?.aggregate?.sum?.stock_quantity;

                  return (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.sku}</td>
                      <td>{product.name}</td>
                      <td>
                        {totalStock !== null && totalStock !== undefined
                          ? totalStock
                          : 'Loading...'}
                      </td>
                      <td>
                        {totalStock > 0 ? 'In Stock' : 'Out of Stock'}
                      </td>
                      <td>₱{parseFloat(product.base_price).toLocaleString()}</td>
                      <td>
                        <button
                          className="sellerinv-view-button"
                          onClick={() => {
                            setSelectedProduct(product);
                            setProductDetailsModalOpen(true);
                          }}
                        >
                          VIEW
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">No products available.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {/* --- Create Product Modal --- */}
      <Modal
        isOpen={productModalOpen}
        onRequestClose={() => setProductModalOpen(false)}
        contentLabel="Create Product"
      >
        <div className="sellerinv-modal-content">
          <h2>Create Product</h2>
          <form onSubmit={handleCreateProduct}>
            <input name="name" type="text" placeholder="Product Name" required />
            <textarea name="description" placeholder="Product Description"></textarea>
            <input
              name="basePrice"
              type="number"
              step="0.01"
              placeholder="Base Price"
              required
            />
            <input
              name="image"
              type="text"
              placeholder="Product Image URL"
              onChange={(e) => setProductImagePreview(e.target.value)}
            />
            {productImagePreview && (
              <div className="sellerinv-image-preview">
                <img
                  src={productImagePreview}
                  alt="Product Preview"
                  style={{ maxWidth: '200px', marginTop: '10px' }}
                />
              </div>
            )}
            <input name="category" type="text" placeholder="Category" required />
            <label>
              <input name="listed" type="checkbox" defaultChecked={false} />
              List this product immediately?
            </label>
            <button type="submit" className="sellerinv-btn sellerinv-btn-primary">
              Create Product
            </button>
          </form>
          <button
            className="sellerinv-btn sellerinv-btn-secondary"
            onClick={() => setProductModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>


      {/* --- Product Details Modal --- */}
      <Modal
        isOpen={productDetailsModalOpen}
        onRequestClose={closeProductDetailsModal}
        contentLabel="Product Details"
      >
        <div className="sellerinv-product-modal">
          {selectedProduct && (
            <>
              <div className="sellerinv-modal-header">
                <h2>PRODUCT INFORMATION</h2>
                <button
                  className="sellerinv-close-button"
                  onClick={closeProductDetailsModal}
                >
                  ×
                </button>
              </div>

              {isEditingProduct ? (
                <form onSubmit={handleUpdateProductDetails}>
                  <h2>Edit Product Details:</h2>
                  <label>
                    Name:
                    <input
                      type="text"
                      name="name"
                      value={productEditDetails.name}
                      onChange={handleProductEditChange}
                      required
                    />
                  </label>
                  <label>
                    Description:
                    <input
                      name="description"
                      type="text"
                      value={productEditDetails.description}
                      onChange={handleProductEditChange}
                    />
                  </label>
                  <label>
                    Base Price:
                    <input
                      type="number"
                      name="basePrice"
                      step="0.01"
                      value={productEditDetails.basePrice}
                      onChange={handleProductEditChange}
                      required
                    />
                  </label>
                  <label>
                    Image URL:
                    <input
                      type="text"
                      name="image"
                      value={productEditDetails.image}
                      onChange={handleProductEditChange}
                    />
                  </label>
                  <label>
                    Category:
                    <input
                      type="text"
                      name="category"
                      value={productEditDetails.category}
                      onChange={handleProductEditChange}
                      required
                    />
                  </label>
                  <div className="sellerinv-modal-actions">
                    <button type="submit" className="sellerinv-btn sellerinv-btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="sellerinv-btn sellerinv-btn-secondary"
                      onClick={() => setIsEditingProduct(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="sellerinv-btn sellerinv-btn-danger"
                      onClick={() => handleDeleteProduct(selectedProduct.id)}
                    >
                      Delete Product
                    </button>
                  </div>
                </form>
              ) : (
                <div className="sellerinv-product-info">
                  <div className="sellerinv-product-info-leftdiv">
                    <img
                      className="sellerinv-product-image"
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                    />
                  </div>
                  <div className="sellerinv-product-info-rightdiv">
                    <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                    <p><strong>Category:</strong> {selectedProduct.category}</p>
                    <p><strong>Description:</strong> {selectedProduct.description}</p>
                    <p><strong>Price:</strong> ₱{selectedProduct.base_price}</p>
                    <p><strong>Listed:</strong> {selectedProduct.listed ? 'Yes' : 'No'}</p>
                    <div className="sellerinv-modal-actions">
                      <button
                        className="sellerinv-btn sellerinv-btn-warning"
                        onClick={() => handleToggleListed(selectedProduct, !selectedProduct.listed)}
                      >
                        {selectedProduct.listed ? 'Unlist Product' : 'List Product'}
                      </button>
                      <button
                        className="sellerinv-btn sellerinv-btn-primary"
                        onClick={() => {
                          setProductEditDetails({
                            name: selectedProduct.name,
                            description: selectedProduct.description,
                            basePrice: selectedProduct.base_price,
                            image: selectedProduct.image,
                            category: selectedProduct.category,
                          });
                          setIsEditingProduct(true);
                        }}
                      >
                        Edit Product
                      </button>
                      <button
                        className="sellerinv-btn sellerinv-btn-secondary"
                        onClick={() => setVariantModalOpen(true)}
                      >
                        Add Variant
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <h3>Variants</h3>
              <div className="sellerinv-variant-list">
                {variantSubscriptionData?.product_variants?.length > 0 ? (
                  variantSubscriptionData.product_variants.map((variant) => (
                    <div className="sellerinv-variant-card" key={variant.id}>
                      <div className="sellerinv-variant-imagediv">
                        <img className="sellerinv-variant-image" src={variant.image} alt={variant.image} />
                      </div>
                      <div className="sellerinv-variant-detailsdiv">
                        <p><strong>SKU:</strong> {variant.sku}</p>
                        <p>
                          {variant.variant_name} - {variant.size} - {variant.color} - Stock: {variant.stock_quantity}
                        </p>
                      </div>
                      <div className="sellerinv-variant-actions">
                        <button
                          className="sellerinv-btn sellerinv-btn-primary"
                          onClick={() => {
                            setSelectedVariant(variant);
                            setVariantDetails({
                              variantName: variant.variant_name,
                              size: variant.size,
                              color: variant.color,
                              stockQuantity: variant.stock_quantity,
                              image: variant.image,
                            });
                            setVariantEditModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="sellerinv-btn sellerinv-btn-secondary"
                          onClick={() => handleDeleteVariant(variant.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No variants available.</p>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>


      {/* --- Add Variant Modal --- */}
      <Modal
        isOpen={variantModalOpen}
        onRequestClose={() => setVariantModalOpen(false)}
        contentLabel="Add Variant"
      >
        <div className="sellerinv-add-variant-modal-maindiv">
          <div className="sellerinv-add-variant-modal-header">
            <h2>Add Variant for {selectedProduct?.name}</h2>
            <button
              className="sellerinv-close-button"
              onClick={() => setVariantModalOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="sellerinv-add-variant-modal-content">
            <div className="sellerinv-add-variant-modal-left-side">
              {variantDetails.image && (
                <div className="sellerinv-image-preview">
                  <img
                    src={variantDetails.image}
                    alt="Variant Preview"
                    style={{ maxWidth: '200px', marginTop: '10px' }}
                  />
                </div>
              )}
            </div>
            <div className="sellerinv-add-variant-modal-right-side">
              <form onSubmit={handleCreateVariant}>
                Variant Image URL:
                <input
                  type="text"
                  name="image"
                  placeholder="Image URL"
                  value={variantDetails.image}
                  onChange={handleVariantChange}
                />
                Variant Name:
                <input
                  type="text"
                  name="variantName"
                  placeholder="Variant Name"
                  value={variantDetails.variantName}
                  onChange={handleVariantChange}
                  required
                />
                Variant Size:
                <input
                  type="text"
                  name="size"
                  placeholder="Size (e.g., S, M, L)"
                  value={variantDetails.size}
                  onChange={handleVariantChange}
                  required
                />
                Variant Color:
                <input
                  type="text"
                  name="color"
                  placeholder="Color"
                  value={variantDetails.color}
                  onChange={handleVariantChange}
                  required
                />
                Variant Stock Quantity:
                <input
                  type="number"
                  name="stockQuantity"
                  placeholder="Stock Quantity"
                  value={variantDetails.stockQuantity}
                  onChange={handleVariantChange}
                  required
                />
                <button type="submit" className="sellerinv-btn sellerinv-btn-primary">
                  Create Variant
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      {/* --- Edit Variant Modal --- */}
      <Modal
        isOpen={variantEditModalOpen}
        onRequestClose={() => setVariantEditModalOpen(false)}
        contentLabel="Edit Variant"
      >
        <div className="sellerinv-modal-content">
          <h2>Edit Variant</h2>
          <form onSubmit={handleUpdateVariant}>
            <input
              type="text"
              name="variantName"
              placeholder="Variant Name"
              value={variantDetails.variantName}
              onChange={handleVariantChange}
              required
            />
            <input
              type="text"
              name="size"
              placeholder="Size (e.g., S, M, L)"
              value={variantDetails.size}
              onChange={handleVariantChange}
              required
            />
            <input
              type="text"
              name="color"
              placeholder="Color"
              value={variantDetails.color}
              onChange={handleVariantChange}
              required
            />
            <input
              type="number"
              name="stockQuantity"
              placeholder="Stock Quantity"
              value={variantDetails.stockQuantity}
              onChange={handleVariantChange}
              required
            />
            Variant Image URL:
            <input
              type="text"
              name="image"
              placeholder="Image URL"
              value={variantDetails.image}
              onChange={handleVariantChange}
            />
            {variantDetails.image && (
              <div className="sellerinv-image-preview">
                <img
                  src={variantDetails.image}
                  alt="Variant Preview"
                  style={{ maxWidth: '200px', marginTop: '10px' }}
                />
              </div>
            )}
            <button type="submit" className="sellerinv-btn sellerinv-btn-primary">
              Update Variant
            </button>
          </form>
          <button
            className="sellerinv-btn sellerinv-btn-secondary"
            onClick={() => setVariantEditModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;