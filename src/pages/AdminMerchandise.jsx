
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  ClipboardList,
  Truck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminMerchandise.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

const API_URL = `${API_BASE_URL}/api/merchandise`;

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOURS = ['Black', 'White'];

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Completed',
  'Cancelled'
];

const PAYMENT_STATUSES = [
  'Verification Pending',
  'Paid',
  'Rejected'
];

const createEmptyForm = () => {
  const stock = {};

  SIZES.forEach((size) => {
    COLOURS.forEach((colour) => {
      stock[`stock_${size}_${colour}`] = '0';
    });
  });

  return {
    name: '',
    description: '',
    price: '',
    is_published: true,
    image: null,
    ...stock
  };
};

function AdminMerchandise() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(createEmptyForm);
  const [imagePreview, setImagePreview] = useState('');

  const [updatingOrder, setUpdatingOrder] = useState(null);

  const token = localStorage.getItem('twc_member_token');

  const authHeaders = {
    Authorization: `Bearer ${token}`
  };

  const getImageUrl = (path) => {
    if (!path) return '';

    if (path.startsWith('http')) {
      return path;
    }

    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const loadProducts = async () => {
    const response = await fetch(
      `${API_URL}/admin/products`,
      { headers: authHeaders }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not load products.');
    }

    setProducts(data.products || []);
  };

  const loadOrders = async () => {
    const response = await fetch(
      `${API_URL}/admin/orders`,
      { headers: authHeaders }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not load orders.');
    }

    setOrders(data.orders || []);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      if (!token) {
        throw new Error(
          'Please log in with an administrator account.'
        );
      }

      await Promise.all([
        loadProducts(),
        loadOrders()
      ]);
    } catch (err) {
      setError(
        err.message || 'Could not load merchandise information.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('The image must not exceed 8MB.');
      event.target.value = '';
      return;
    }

    setForm((previous) => ({
      ...previous,
      image: file
    }));

    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setForm(createEmptyForm());
    setImagePreview('');
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const openEditProduct = (product) => {
    const nextForm = {
      ...createEmptyForm(),
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      is_published: Boolean(product.is_published),
      image: null
    };

    (product.variants || []).forEach((variant) => {
      const key = `stock_${variant.size}_${variant.colour}`;

      nextForm[key] = String(
        variant.stock_quantity ?? 0
      );
    });

    setEditingProduct(product);
    setForm(nextForm);
    setImagePreview(getImageUrl(product.image_url));
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(createEmptyForm());
    setImagePreview('');
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Enter a product name.');
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError('Enter a valid product price.');
      return;
    }

    for (const size of SIZES) {
      for (const colour of COLOURS) {
        const value = Number(
          form[`stock_${size}_${colour}`]
        );

        if (!Number.isInteger(value) || value < 0) {
          setError('Stock quantities must be whole numbers of zero or more.');
          return;
        }
      }
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const body = new FormData();

      body.append('name', form.name.trim());
      body.append('description', form.description);
      body.append('price', form.price);
      body.append(
        'is_published',
        String(form.is_published)
      );

      if (form.image) {
        body.append('image', form.image);
      }

      SIZES.forEach((size) => {
        COLOURS.forEach((colour) => {
          const key = `stock_${size}_${colour}`;

          body.append(key, form[key] || '0');
        });
      });

      const url = editingProduct
        ? `${API_URL}/admin/products/${editingProduct.id}`
        : `${API_URL}/admin/products`;

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: authHeaders,
        body
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Could not save product.'
        );
      }

      closeForm();

      setNotice(
        editingProduct
          ? 'Product updated successfully.'
          : 'Product created successfully.'
      );

      await loadProducts();
    } catch (err) {
      setError(
        err.message || 'Could not save the product.'
      );
    } finally {
      setSaving(false);
    }
  };

  const unpublishProduct = async (product) => {
    const confirmed = window.confirm(
      `Unpublish "${product.name}"? It will no longer appear in the shop.`
    );

    if (!confirmed) return;

    setError('');
    setNotice('');

    try {
      const response = await fetch(
        `${API_URL}/admin/products/${product.id}`,
        {
          method: 'DELETE',
          headers: authHeaders
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Could not unpublish product.'
        );
      }

      setNotice('Product unpublished successfully.');

      await loadProducts();
    } catch (err) {
      setError(
        err.message || 'Could not unpublish product.'
      );
    }
  };

  const updateOrder = async (order, changes) => {
    setUpdatingOrder(order.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(
        `${API_URL}/admin/orders/${order.id}`,
        {
          method: 'PATCH',
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(changes)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Could not update order.'
        );
      }

      setNotice(`Order #${order.id} updated successfully.`);

      await loadOrders();
      await loadProducts();
    } catch (err) {
      setError(
        err.message || 'Could not update order.'
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const totalStock = (product) => {
    return (product.variants || []).reduce(
      (sum, variant) =>
        sum + Number(variant.stock_quantity || 0),
      0
    );
  };

  const pendingOrders = orders.filter(
    (order) => order.status === 'Pending'
  ).length;

  const unpaidOrders = orders.filter(
    (order) =>
      order.payment_status === 'Verification Pending'
  ).length;

  const totalRevenue = orders
    .filter((order) => order.payment_status === 'Paid')
    .reduce(
      (sum, order) =>
        sum + Number(order.total_amount || 0),
      0
    );

  return (
    <main className="admin-merchandise-page">

      <header className="merchandise-header">

        <button
          className="merchandise-back"
          onClick={() => navigate('/admin-dashboard')}
        >
          <ArrowLeft size={18} />
          DASHBOARD
        </button>

        <div className="merchandise-brand">
          <img
            src="/images/IMG-20261109-WA0019.jpg"
            alt="Thika Walking Club Logo"
            className="dashboard-logo"
          />

          <div>
            <span>THIKA WALKING CLUB</span>
            <h1>MERCH ADMIN</h1>
          </div>
        </div>

      </header>

      <AdminNavbar />

      <section className="merchandise-content">

        <div className="merchandise-title">
          <span>SHOP ADMINISTRATION</span>
          <h2>Merchandise Management</h2>
          <p>
            Manage products, inventory, customer purchases
            and payments.
          </p>
        </div>

        {error && (
          <div className="merchandise-alert error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {notice && (
          <div className="merchandise-alert success">
            <CheckCircle size={18} />
            {notice}
          </div>
        )}

        <div className="merchandise-stats">

          <div className="merchandise-stat">
            <Package />
            <div>
              <span>PRODUCTS</span>
              <strong>{products.length}</strong>
            </div>
          </div>

          <div className="merchandise-stat">
            <ShoppingBag />
            <div>
              <span>TOTAL ORDERS</span>
              <strong>{orders.length}</strong>
            </div>
          </div>

          <div className="merchandise-stat">
            <ClipboardList />
            <div>
              <span>PENDING ORDERS</span>
              <strong>{pendingOrders}</strong>
            </div>
          </div>

          <div className="merchandise-stat">
            <Truck />
            <div>
              <span>PAYMENTS TO VERIFY</span>
              <strong>{unpaidOrders}</strong>
            </div>
          </div>

          <div className="merchandise-stat">
            <CheckCircle />
            <div>
              <span>VERIFIED REVENUE</span>
              <strong>
                KSh {totalRevenue.toLocaleString('en-KE')}
              </strong>
            </div>
          </div>

        </div>

        <div className="merchandise-tabs">

          <button
            className={
              activeTab === 'products' ? 'active' : ''
            }
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            PRODUCTS
          </button>

          <button
            className={
              activeTab === 'orders' ? 'active' : ''
            }
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            ORDERS
          </button>

          <button
            className="merchandise-refresh"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={17} />
            REFRESH
          </button>

        </div>

        {loading ? (

          <div className="merchandise-loading">
            <RefreshCw
              className="merchandise-spin"
              size={28}
            />
            <p>Loading merchandise information...</p>
          </div>

        ) : (

          <>

            {activeTab === 'products' && (

              <section className="merchandise-panel">

                <div className="merchandise-panel-heading">
                  <div>
                    <h3>Shop Products</h3>
                    <p>
                      Add products and manage available stock.
                    </p>
                  </div>

                  <button
                    className="merchandise-primary-button"
                    onClick={openNewProduct}
                  >
                    <Plus size={18} />
                    ADD PRODUCT
                  </button>
                </div>

                {products.length === 0 ? (

                  <div className="merchandise-empty">
                    <ImageIcon size={42} />

                    <h3>No products added yet</h3>

                    <p>
                      Add your first Thika Walking Club
                      merchandise product to make it available
                      in the shop.
                    </p>

                    <button
                      className="merchandise-primary-button"
                      onClick={openNewProduct}
                    >
                      <Plus size={18} />
                      ADD YOUR FIRST PRODUCT
                    </button>
                  </div>

                ) : (

                  <div className="merchandise-product-grid">

                    {products.map((product) => (

                      <article
                        className="merchandise-product-card"
                        key={product.id}
                      >

                        <div className="merchandise-product-image">

                          {product.image_url ? (

                            <img
                              src={getImageUrl(product.image_url)}
                              alt={product.name}
                            />

                          ) : (

                            <ImageIcon size={42} />

                          )}

                          <span
                            className={
                              product.is_published
                                ? 'product-published'
                                : 'product-unpublished'
                            }
                          >
                            {product.is_published
                              ? 'PUBLISHED'
                              : 'HIDDEN'}
                          </span>

                        </div>

                        <div className="merchandise-product-info">

                          <h4>{product.name}</h4>

                          <strong>
                            KSh {Number(product.price).toLocaleString('en-KE')}
                          </strong>

                          <p>
                            {totalStock(product)} items in stock
                          </p>

                          <div className="merchandise-product-actions">

                            <button
                              onClick={() =>
                                openEditProduct(product)
                              }
                            >
                              <Pencil size={16} />
                              EDIT
                            </button>

                            {product.is_published && (

                              <button
                                className="delete"
                                onClick={() =>
                                  unpublishProduct(product)
                                }
                              >
                                <Trash2 size={16} />
                                UNPUBLISH
                              </button>

                            )}

                          </div>

                        </div>

                      </article>

                    ))}

                  </div>

                )}

              </section>

            )}

            {activeTab === 'orders' && (

              <section className="merchandise-panel">

                <div className="merchandise-panel-heading">
                  <div>
                    <h3>Customer Orders</h3>
                    <p>
                      Review purchases, delivery details
                      and payments.
                    </p>
                  </div>
                </div>

                {orders.length === 0 ? (

                  <div className="merchandise-empty">
                    <ShoppingBag size={42} />

                    <h3>No merchandise orders yet</h3>

                    <p>
                      Customer purchases will appear here
                      when members place orders through the shop.
                    </p>
                  </div>

                ) : (

                  <div className="merchandise-orders">

                    {orders.map((order) => (

                      <article
                        className="merchandise-order-card"
                        key={order.id}
                      >

                        <div className="merchandise-order-heading">

                          <div>
                            <span>ORDER #{order.id}</span>

                            <h4>
                              {order.member?.full_name || 'Club Member'}
                            </h4>

                            <p>
                              {order.created_at
                                ? new Date(order.created_at).toLocaleString()
                                : 'Date unavailable'}
                            </p>
                          </div>

                          <strong>
                            KSh {Number(order.total_amount).toLocaleString('en-KE')}
                          </strong>

                        </div>

                        <div className="merchandise-order-customer">

                          <p>
                            <strong>Email:</strong>{' '}
                            {order.member?.email || 'Not provided'}
                          </p>

                          <p>
                            <strong>Phone:</strong>{' '}
                            {order.delivery_phone ||
                              order.member?.phone ||
                              'Not provided'}
                          </p>

                          <p>
                            <strong>Delivery:</strong>{' '}
                            {order.delivery_address || 'Not provided'}
                          </p>

                          <p>
                            <strong>M-Pesa reference:</strong>{' '}
                            {order.mpesa_transaction_code ||
                              'Not submitted'}
                          </p>

                        </div>

                        <div className="merchandise-order-items">

                          <strong>ITEMS</strong>

                          {order.items.map((item, index) => (

                            <div
                              className="merchandise-order-item"
                              key={`${order.id}-${index}`}
                            >

                              <span>
                                {item.product_name} — {item.size},{' '}
                                {item.colour}
                              </span>

                              <span>
                                × {item.quantity} · KSh{' '}
                                {Number(item.unit_price).toLocaleString('en-KE')}
                              </span>

                            </div>

                          ))}

                        </div>

                        <div className="merchandise-order-controls">

                          <label>
                            ORDER STATUS

                            <select
                              value={order.status}
                              disabled={
                                updatingOrder === order.id ||
                                order.status === 'Cancelled'
                              }
                              onChange={(event) =>
                                updateOrder(order, {
                                  status: event.target.value
                                })
                              }
                            >

                              {ORDER_STATUSES.map((status) => (

                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>

                              ))}

                            </select>

                          </label>

                          <label>
                            PAYMENT STATUS

                            <select
                              value={order.payment_status}
                              disabled={
                                updatingOrder === order.id ||
                                order.status === 'Cancelled'
                              }
                              onChange={(event) =>
                                updateOrder(order, {
                                  payment_status: event.target.value
                                })
                              }
                            >

                              {PAYMENT_STATUSES.map((status) => (

                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>

                              ))}

                            </select>

                          </label>

                        </div>

                        {order.payment_status === 'Verification Pending' && (

                          <p className="merchandise-payment-note">
                            Check the M-Pesa transaction reference
                            before marking this payment as Paid.
                          </p>

                        )}

                        {updatingOrder === order.id && (

                          <p className="merchandise-updating">
                            Updating order...
                          </p>

                        )}

                      </article>

                    ))}

                  </div>

                )}

              </section>

            )}

          </>

        )}

      </section>

      {showForm && (

        <div className="merchandise-modal-backdrop">

          <section className="merchandise-product-modal">

            <div className="merchandise-modal-heading">

              <div>
                <span>SHOP INVENTORY</span>

                <h3>
                  {editingProduct
                    ? 'Edit Product'
                    : 'Add New Product'}
                </h3>
              </div>

              <button
                className="merchandise-modal-close"
                onClick={closeForm}
                type="button"
              >
                <X size={22} />
              </button>

            </div>

            <form onSubmit={saveProduct}>

              <div className="merchandise-form-grid">

                <label className="merchandise-form-full">
                  PRODUCT NAME

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField('name', event.target.value)
                    }
                    placeholder="e.g. TWC Walking Club T-Shirt"
                    required
                  />
                </label>

                <label>
                  PRICE (KSh)

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateField('price', event.target.value)
                    }
                    placeholder="e.g. 1500"
                    required
                  />
                </label>

                <label>
                  VISIBILITY

                  <select
                    value={String(form.is_published)}
                    onChange={(event) =>
                      updateField(
                        'is_published',
                        event.target.value === 'true'
                      )
                    }
                  >
                    <option value="true">
                      Published — Show in shop
                    </option>

                    <option value="false">
                      Hidden — Do not show
                    </option>
                  </select>
                </label>

                <label className="merchandise-form-full">
                  DESCRIPTION

                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(event) =>
                      updateField('description', event.target.value)
                    }
                    placeholder="Describe this merchandise..."
                  />
                </label>

                <div className="merchandise-form-full">

                  <label className="merchandise-upload-label">
                    <Upload size={18} />
                    PRODUCT PHOTO

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />
                  </label>

                  {imagePreview && (

                    <div className="merchandise-image-preview">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                      />
                    </div>

                  )}

                  <p className="merchandise-form-hint">
                    JPG, PNG or WEBP. Maximum file size: 8MB.
                  </p>

                </div>

              </div>

              <div className="merchandise-stock-section">

                <h4>SIZE AND COLOUR STOCK</h4>

                <p>
                  Enter how many units are available for
                  each combination. Use zero for unavailable options.
                </p>

                <div className="merchandise-stock-table-wrap">

                  <table className="merchandise-stock-table">

                    <thead>
                      <tr>
                        <th>SIZE</th>
                        <th>BLACK</th>
                        <th>WHITE</th>
                      </tr>
                    </thead>

                    <tbody>

                      {SIZES.map((size) => (

                        <tr key={size}>

                          <td>{size}</td>

                          {COLOURS.map((colour) => {

                            const key = `stock_${size}_${colour}`;

                            return (

                              <td key={key}>

                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={form[key]}
                                  onChange={(event) =>
                                    updateField(
                                      key,
                                      event.target.value
                                    )
                                  }
                                />

                              </td>

                            );

                          })}

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

              <div className="merchandise-modal-actions">

                <button
                  type="button"
                  className="merchandise-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="merchandise-primary-button"
                  disabled={saving}
                >
                  <Save size={17} />

                  {saving
                    ? 'SAVING...'
                    : editingProduct
                      ? 'SAVE CHANGES'
                      : 'CREATE PRODUCT'}
                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </main>
  );
}

export default AdminMerchandise;
