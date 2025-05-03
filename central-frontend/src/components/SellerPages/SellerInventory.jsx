import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import {
  GET_PRODUCTS,
} from '../../graphql/queries';
import {
  CREATE_PRODUCT,
  DELETE_PRODUCT,
  CREATE_VARIANT,
  UPDATE_VARIANT,
  UPDATE_PRODUCT,
  DELETE_VARIANT,
  TOGGLE_LISTED_STATUS,
} from '../../graphql/mutations';
import { SUBSCRIBE_TO_NEW_PRODUCTS, SUBSCRIBE_TO_NEW_VARIANTS } from '../../graphql/subscriptions';
import "./style/SellerInventory.css"; // for frontend design

Modal.setAppElement('#root');

const Inventory = () => {
  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    fetchPolicy: 'cache-and-network',
  });  
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  const [createVariant] = useMutation(CREATE_VARIANT);
  const [updateVariant] = useMutation(UPDATE_VARIANT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteVariant] = useMutation(DELETE_VARIANT);
  const [toggleListedStatus, { loading: toggleLoading }] = useMutation(TOGGLE_LISTED_STATUS);


  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productDetailsModalOpen, setProductDetailsModalOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantEditModalOpen, setVariantEditModalOpen] = useState(false);

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
  });
  const [selectedVariant, setSelectedVariant] = useState(null); // For editing variant

  const { data: subscriptionData } = useSubscription(SUBSCRIBE_TO_NEW_PRODUCTS);
  const { data: variantSubscriptionData } = useSubscription(SUBSCRIBE_TO_NEW_VARIANTS, {
    skip: !selectedProduct,
    variables: { productId: selectedProduct?.id },
  });

  const products = useMemo(() => {
    return subscriptionData?.products || data?.products || [];
  }, [subscriptionData, data]);
  
  // Sync selectedProduct when products list updates
  useEffect(() => {
    if (!selectedProduct) return;
    const updatedProduct = products.find((p) => p.id === selectedProduct.id);
    if (updatedProduct && updatedProduct !== selectedProduct) {
      setSelectedProduct(updatedProduct);
    }
  }, [products, selectedProduct]);  
  

  // Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = {
      name: form.name.value,
      description: form.description.value,
      basePrice: parseFloat(form.basePrice.value),
      image: form.image.value,
      category: form.category.value,
      listed: form.listed.checked || false,
    };

    try {
      await createProduct({ variables: formData });
      form.reset();
      setProductModalOpen(false);
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct({ variables: { id } });
      setProductDetailsModalOpen(false);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Toggle listed
  const handleToggleListed = async (product, newListedStatus) => {
    console.log("Toggling listed status for product:", product.id, "to", newListedStatus);
    try {
      await toggleListedStatus({
        variables: {
          id: product.id,
          listed: newListedStatus,
        },
      });
    } catch (err) {
      console.error("Error toggling listed status:", err);
    }
  };

  // Update Product Details
  const handleUpdateProductDetails = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({
        variables: {
          id: selectedProduct.id,
          name: productEditDetails.name,
          description: productEditDetails.description,
          basePrice: parseFloat(productEditDetails.basePrice),
          image: productEditDetails.image,
          category: productEditDetails.category,
          listed: Boolean(productEditDetails.listed),
        },
      });
      setIsEditingProduct(false);
    } catch (err) {
      console.error("Error updating product details:", err);
    }
  };

  const handleProductEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductEditDetails((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Create Variant
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
          image,
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

  // Delete Variant
  const handleDeleteVariant = async (variantId) => {
    try {
      await deleteVariant({ variables: { id: variantId } });
    } catch (err) {
      console.error("Error deleting variant:", err);
    }
  };

  // Update Variant
  const handleUpdateVariant = async (e) => {
    e.preventDefault();
    const { variantName, size, color,stockQuantity } = variantDetails;
    try {
      await updateVariant({
        variables: {
          id: selectedVariant.id,
          variantName,
          size,
          color,
          stockQuantity: parseInt(stockQuantity, 10),
        },
      });
      setVariantEditModalOpen(false);
    } catch (err) {
      console.error("Error updating variant:", err);
    }
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantDetails((prev) => ({ ...prev, [name]: value }));
  };


  // Close Modal
  const closeProductDetailsModal = () => {
    setProductDetailsModalOpen(false);
    setSelectedProduct(null);
    setIsEditingProduct(false);
  };
  

  return (
  <div className="inventory-container">
  <div className="inventory-header">
    <h1 className="inventory-title">Inventory Management</h1>
    <button
      className="btn btn-add-product"
      onClick={() => setProductModalOpen(true)}
    >
      Add Product
    </button>
  </div>

  {/* Product Table */}
  <div className="table-container">
    {loading && <p>Loading products...</p>}
    {error && <p>Error fetching products: {error.message}</p>}
    {!loading && !error && (
      <table className="inventory-table">
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
          {products.length > 0 ? (
            products.map((product) => {
              // ✅ Use aggregation result directly
              const totalStock =
                product.product_variants_aggregate?.aggregate?.sum?.stock_quantity;

                console.log('Total stock:', totalStock);

              return (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>
                      {product.product_variants_aggregate
                        ? product.product_variants_aggregate.aggregate.sum.stock_quantity
                        : 'Loading...'}
                    </td>
                    <td>
                      {product.product_variants_aggregate &&
                      product.product_variants_aggregate.aggregate.sum.stock_quantity > 0
                        ? 'In Stock'
                        : 'Out of Stock'}
                    </td>
                  <td>₱{parseFloat(product.base_price).toLocaleString()}</td>
                  <td>
                    <button
                      className="view-button"
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


      {/* --- Create Product Modal --- */}
      <Modal
        isOpen={productModalOpen}
        onRequestClose={() => setProductModalOpen(false)}
        contentLabel="Create Product"
      >
        <div className="modal-content">
          <h2>Create Product</h2>
          <form onSubmit={handleCreateProduct}>
            <input name="name" type="text" placeholder="Product Name" required />
            <textarea
              name="description"
              placeholder="Product Description"
            ></textarea>
            <input
              name="basePrice"
              type="number"
              step="0.01"
              placeholder="Base Price"
              required
            />
            <input name="image" type="text" placeholder="Product Image URL" />
            <input
              name="category"
              type="text"
              placeholder="Category"
              required
            />
            <label>
              <input name="listed" type="checkbox" defaultChecked={false} />
              List this product immediately?
            </label>
            <button type="submit" className="btn btn-primary">
              Create Product
            </button>
          </form>
          <button
            className="btn btn-secondary"
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
        <div className="modal-content">
          {selectedProduct && (
            <>
              <div className="modal-header">
                <h2>PRODUCT INFORMATION</h2>
                <button
                  className="close-button"
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
                  <br />
                  <label>
                    Description:
                    <input
                      name="description"
                      type="text"
                      value={productEditDetails.description}
                      onChange={handleProductEditChange}
                    />
                  </label>
                  <br />
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
                  <br />
                  <label>
                    Image URL:
                    <input
                      type="text"
                      name="image"
                      value={productEditDetails.image}
                      onChange={handleProductEditChange}
                    />
                  </label>
                  <br />
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
                  <br />
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsEditingProduct(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDeleteProduct(selectedProduct.id)}
                    >
                      Delete Product
                    </button>
                  </div>
                </form>
              ) : (
                <>
                <div className='product-info'>
                  <div className='product-info-leftdiv'>
                    <img
                      className='product-image'
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                    />
                  </div>
                  <div className='product-info-rightdiv'>
                    <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                    <p><strong>Category:</strong> {selectedProduct.category}</p>
                    <p><strong>Description:</strong> {selectedProduct.description}</p>
                    <p><strong>Price:</strong> ${selectedProduct.base_price}</p>
                    <p><strong>Listed:</strong> {selectedProduct.listed ? 'Yes' : 'No'}</p>
                    <div className="modal-actions">
                      <button
                        className="btn btn-warning"
                        onClick={() => handleToggleListed(selectedProduct, !selectedProduct.listed)}
                        disabled={toggleLoading}
                      >
                        {toggleLoading
                          ? 'Updating...'
                          : selectedProduct.listed
                            ? 'Unlist Product'
                            : 'List Product'}
                      </button>
                      <button
                        className="btn btn-primary"
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
                        className="btn btn-secondary"
                        onClick={() => setVariantModalOpen(true)}
                      >
                        Add Variant
                      </button>
                    </div>
                  </div>
                </div>
                </>
              )}

              <h3>Variants</h3>
              <div className="variant-list">
                {variantSubscriptionData?.product_variants?.length > 0 ? (
                  variantSubscriptionData.product_variants.map((variant) => (
                    <div className="variant-card" key={variant.id} >
                      <div className='variant-imagediv'>
                        <img className='variant-image' src={variant.image} alt={variant.image} />
                      </div>
                      <div className='variant-detailsdiv'>
                        <p>
                          <strong>SKU:</strong> {variant.sku}
                        </p>
                        <p>
                          {variant.variant_name} - {variant.size} - {variant.color} - Stock: {variant.stock_quantity}
                        </p>
                      </div>
                      <div className="variant-actions">
                        <button
                          className="btn btn-primary"
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
                          className="btn btn-secondary"
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
        <div className="add-variant-modal-maindiv">
          <div className='add-variant-modal-header'>
            <h2>Add Variant for {selectedProduct?.name}</h2>
            <br />
            <button
              className="close-button"
              onClick={() => setVariantModalOpen(false)}
            >
              x
            </button>
          </div>
          <div className='add-variant-modal-content'>
            <div className='add-variant-modal-left-side'>
              {variantDetails.image && (
                  <div className="image-preview">
                    {/* <p>Image Preview:</p> */}
                    <img
                      src={variantDetails.image}
                      alt="Variant Preview"
                      style={{ maxWidth: '200px', marginTop: '10px' }}
                    />
                  </div>
                )}
            </div>
            <div className='add-variant-modal-right-side'>
              <form onSubmit={handleCreateVariant}>
                Variant Image URL:
                <input
                  type="text"
                  name="image"
                  placeholder="Image URL"
                  value={variantDetails.image}
                  onChange={handleVariantChange}
                />
                <br />
                Variant Name:
                <input
                  type="text"
                  name="variantName"
                  placeholder="Variant Name"
                  value={variantDetails.variantName}
                  onChange={handleVariantChange}
                  required
                />
                <br />
                Variant Size:
                <input
                  type="text"
                  name="size"
                  placeholder="Size (e.g., S, M, L)"
                  value={variantDetails.size}
                  onChange={handleVariantChange}
                  required
                />
                <br />
                Variant Color:
                <input
                  type="text"
                  name="color"
                  placeholder="Color"
                  value={variantDetails.color}
                  onChange={handleVariantChange}
                  required
                />
                <br />
                Variant Stock Quantity:
                <input
                  type="number"
                  name="stockQuantity"
                  placeholder="Stock Quantity"
                  value={variantDetails.stockQuantity}
                  onChange={handleVariantChange}
                  required
                />
                <br />
                <button type="submit" className="btn btn-primary">
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
        <div className="modal-content">
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
            <br />
            Variant Image URL:
            <input
              type="text"
              name="image"
              placeholder="Image URL"
              value={variantDetails.image}
              onChange={handleVariantChange}
            />
            {variantDetails.image && (
              <div className="image-preview">
                <p>Image Preview:</p>
                <img
                  src={variantDetails.image}
                  alt="Variant Preview"
                  style={{ maxWidth: '200px', marginTop: '10px' }}
                />
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              Update Variant
            </button>
          </form>
          <button
            className="btn btn-secondary"
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
