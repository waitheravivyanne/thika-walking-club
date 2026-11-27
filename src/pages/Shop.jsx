import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Plus,
  Minus,
  X,
  ArrowRight,
  Package,
  LoaderCircle,
  AlertCircle
} from 'lucide-react';

import '../styles/Shop.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

const API_URL = `${API_BASE_URL}/api/merchandise`;

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOURS = ['Black', 'White', 'Green'];

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColour, setSelectedColour] = useState('Black');
  const [quantity, setQuantity] = useState(1);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || 'Unable to load merchandise.'
          );
        }

        setProducts(result.products || []);
      } catch (err) {
        setError(err.message || 'Unable to connect to the shop.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const availableVariant = selectedProduct?.variants?.find(
    (variant) =>
      variant.size === selectedSize &&
      variant.colour === selectedColour
  );

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const formatPrice = (price) =>
    `KSh ${Number(price).toLocaleString('en-KE')}`;

  const openProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSize('M');
    setSelectedColour('Black');
    setQuantity(1);
  };

  const addToCart = () => {
    if (!availableVariant || availableVariant.stock_quantity < quantity) {
      return;
    }

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.variant_id === availableVariant.id
      );

      if (existing) {
        const nextQuantity = Math.min(
          availableVariant.stock_quantity,
          existing.quantity + quantity
        );

        return previous.map((item) =>
          item.variant_id === availableVariant.id
            ? { ...item, quantity: nextQuantity }
            : item
        );
      }

      return [
        ...previous,
        {
          variant_id: availableVariant.id,
          product_id: selectedProduct.id,
          name: selectedProduct.name,
          price: Number(selectedProduct.price),
          image_url: selectedProduct.image_url,
          size: selectedSize,
          colour: selectedColour,
          quantity
        }
      ];
    });

    setSelectedProduct(null);
  };

  const updateCartQuantity = (variantId, change) => {
    setCart((previous) =>
      previous
        .map((item) =>
          item.variant_id === variantId
            ? {
                ...item,
                quantity: Math.max(0, item.quantity + change)
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };
  const submitOrder = async (event) => {
    event.preventDefault();
    setCheckoutError('');

    const token = localStorage.getItem('twc_member_token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (!cart.length) {
      setCheckoutError('Your cart is empty.');
      return;
    }
    if (!mpesaCode.trim()) {
  setCheckoutError('Please enter your M-Pesa transaction code before placing your order.');
  return;
}

    setCheckoutLoading(true);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            variant_id: item.variant_id,
            quantity: item.quantity
          })),
          delivery_address: deliveryAddress.trim(),
          delivery_phone: deliveryPhone.trim(),
          mpesa_transaction_code: mpesaCode.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to place your order.'
        );
      }

      setOrderSuccess(result.order);
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setDeliveryAddress('');
      setDeliveryPhone('');
      setMpesaCode('');
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    return `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <main className="shop-page">

      <section className="shop-hero">
        <ShoppingBag className="shop-icon" />

        <p className="shop-label">
          OFFICIAL TWC MERCHANDISE
        </p>

        <h1>THE TWC SHOP</h1>

        <p>
          Wear the movement. Represent the family.
          Be part of the TWC experience.
        </p>

        <button
          className="shop-hero-button"
          onClick={() =>
            document.getElementById('shop-products')?.scrollIntoView({
              behavior: 'smooth'
            })
          }
        >
          EXPLORE COLLECTION
          <ArrowRight size={18} />
        </button>
      </section>

      <section className="shop-intro container">
        <span className="shop-section-label">
          THE OFFICIAL COLLECTION
        </span>

        <h2>REPRESENT TWC</h2>

        <p>
          Discover merchandise made for our walking club community.
          More than merchandise — it's a lifestyle.
        </p>

        <div className="shop-toolbar">
          <div>
            <h3>SHOP ALL MERCHANDISE</h3>
            <span>
              {products.length} {products.length === 1 ? 'PRODUCT' : 'PRODUCTS'}
            </span>
          </div>

          <label className="shop-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search merchandise..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {loading && (
          <div className="shop-message">
            <LoaderCircle className="shop-spinner" size={32} />
            <p>LOADING TWC COLLECTION...</p>
          </div>
        )}

        {!loading && error && (
          <div className="shop-message shop-error">
            <AlertCircle size={30} />
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              TRY AGAIN
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="shop-message">
            <Package size={38} />
            <h3>NO PRODUCTS AVAILABLE</h3>
            <p>
              {search
                ? 'No products match your search.'
                : 'Our merchandise collection is being prepared. Check back soon!'}
            </p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="shop-product-grid" id="shop-products">
            {filteredProducts.map((product) => (
              <article
                className="shop-product-card"
                key={product.id}
              >
                <button
                  className="shop-product-image"
                  onClick={() => openProduct(product)}
                  aria-label={`View ${product.name}`}
                >
                  {product.image_url ? (
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="shop-no-image">
                      <ShoppingBag size={42} />
                      <span>TWC MERCHANDISE</span>
                    </div>
                  )}

                  <span className="shop-product-view">
                    QUICK VIEW
                  </span>
                </button>

                <div className="shop-product-info">
                  <h3>{product.name}</h3>

                  <p className="shop-product-price">
                    {formatPrice(product.price)}
                  </p>

                  <button
                    className="shop-add-button"
                    onClick={() => openProduct(product)}
                  >
                    SELECT OPTIONS
                    <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <div
          className="shop-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <section
            className="shop-product-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedProduct.name}
          >
            <button
              className="shop-modal-close"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
            >
              <X size={22} />
            </button>

            <div className="shop-modal-image">
              {selectedProduct.image_url ? (
                <img
                  src={getImageUrl(selectedProduct.image_url)}
                  alt={selectedProduct.name}
                />
              ) : (
                <ShoppingBag size={55} />
              )}
            </div>

            <div className="shop-modal-details">
              <span className="shop-section-label">
                OFFICIAL TWC COLLECTION
              </span>

              <h2>{selectedProduct.name}</h2>

              <p className="shop-modal-price">
                {formatPrice(selectedProduct.price)}
              </p>

              <p className="shop-modal-description">
                {selectedProduct.description ||
                  'Official Thika Walking Club merchandise.'}
              </p>

              <div className="shop-option-group">
                <h4>SELECT SIZE</h4>

                <div className="shop-size-options">
                  {SIZES.map((size) => {
                    const inStock = selectedProduct.variants.some(
                      (variant) =>
                        variant.size === size &&
                        variant.colour === selectedColour &&
                        variant.stock_quantity > 0
                    );

                    return (
                      <button
                        key={size}
                        disabled={!inStock}
                        className={
                          selectedSize === size ? 'active' : ''
                        }
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="shop-option-group">
                <h4>SELECT COLOUR</h4>

                <div className="shop-colour-options">
                  {COLOURS.map((colour) => {
                    const inStock = selectedProduct.variants.some(
                      (variant) =>
                        variant.size === selectedSize &&
                        variant.colour === colour &&
                        variant.stock_quantity > 0
                    );

                    return (
                      <button
                        key={colour}
                        disabled={!inStock}
                        className={
                          selectedColour === colour ? 'active' : ''
                        }
                        onClick={() => {
                          setSelectedColour(colour);
                          setQuantity(1);
                        }}
                      >
                        <span
                          className={`shop-colour-dot ${colour.toLowerCase()}`}
                        />
                        {colour}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="shop-stock">
                {availableVariant?.stock_quantity > 0
                  ? `${availableVariant.stock_quantity} AVAILABLE`
                  : 'CURRENTLY OUT OF STOCK'}
              </div>

              <div className="shop-quantity-row">
                <h4>QUANTITY</h4>

                <div className="shop-quantity-control">
                  <button
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((previous) => previous - 1)
                    }
                  >
                    <Minus size={16} />
                  </button>

                  <span>{quantity}</span>

                  <button
                    disabled={
                      !availableVariant ||
                      quantity >= availableVariant.stock_quantity ||
                      quantity >= 50
                    }
                    onClick={() =>
                      setQuantity((previous) => previous + 1)
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                className="shop-modal-add"
                disabled={
                  !availableVariant ||
                  availableVariant.stock_quantity < quantity
                }
                onClick={addToCart}
              >
                <ShoppingCart size={19} />
                ADD TO CART
              </button>
            </div>
          </section>
        </div>
      )}

      <button
        className="shop-floating-cart"
        onClick={() => setCartOpen(true)}
        aria-label={`Shopping cart with ${cartCount} items`}
      >
        <ShoppingBag size={23} />
        <span>MY CART</span>
        <strong>{cartCount}</strong>
      </button>

      {cartOpen && (
        <div
          className="shop-modal-overlay shop-cart-overlay"
          onClick={() => setCartOpen(false)}
        >
          <section
            className="shop-cart-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <header>
              <div>
                <span className="shop-section-label">YOUR SELECTION</span>
                <h2>SHOPPING CART ({cartCount})</h2>
              </div>

              <button onClick={() => setCartOpen(false)}>
                <X size={23} />
              </button>
            </header>

            {cart.length === 0 ? (
              <div className="shop-cart-empty">
                <ShoppingBag size={45} />
                <h3>YOUR CART IS EMPTY</h3>
                <p>Explore the collection and find your TWC gear.</p>
              </div>
            ) : (
              <>
                <div className="shop-cart-items">
                  {cart.map((item) => (
                    <article key={item.variant_id}>
                      {item.image_url ? (
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                        />
                      ) : (
                        <div className="shop-cart-placeholder">
                          <ShoppingBag />
                        </div>
                      )}

                      <div className="shop-cart-item-details">
                        <h3>{item.name}</h3>
                        <p>{item.size} · {item.colour}</p>
                        <strong>{formatPrice(item.price)}</strong>

                        <div className="shop-quantity-control">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.variant_id, -1)
                            }
                          >
                            <Minus size={14} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateCartQuantity(item.variant_id, 1)
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <footer>
  <div>
    <span>SUBTOTAL</span>
    <strong>{formatPrice(cartTotal)}</strong>
  </div>

  <button
    onClick={() => {
      setCartOpen(false);
      setCheckoutError('');
      setCheckoutOpen(true);
    }}
  >
    PROCEED TO CHECKOUT
    <ArrowRight size={18} />
  </button>

  <button
    className="shop-continue-button"
    onClick={() => setCartOpen(false)}
  >
    CONTINUE SHOPPING
  </button>
</footer>
              </>
            )}
          </section>
        </div>
      )}


      {checkoutOpen && (
        <div
          className="shop-modal-overlay shop-checkout-overlay"
          onClick={() => {
            if (!checkoutLoading) setCheckoutOpen(false);
          }}
        >
          <section
            className="shop-checkout-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Checkout"
          >
            <header className="shop-checkout-header">
              <div>
                <span className="shop-section-label">ALMOST THERE</span>
                <h2>CHECKOUT</h2>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                disabled={checkoutLoading}
                aria-label="Close checkout"
              >
                <X size={23} />
              </button>
            </header>

            <div className="shop-checkout-summary">
              <h3>ORDER SUMMARY</h3>
              {cart.map((item) => (
                <div className="shop-checkout-summary-row" key={item.variant_id}>
                  <span>
                    {item.name} ({item.size}, {item.colour}) × {item.quantity}
                  </span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
              <div className="shop-checkout-total">
                <span>TOTAL</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
            </div>

            <form className="shop-checkout-form" onSubmit={submitOrder}>
              <h3>DELIVERY DETAILS</h3>

              <label>
                Delivery address
                <textarea
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Enter your estate, street, town and any delivery directions"
                  rows={3}
                  required
                  maxLength={250}
                />
              </label>

              <label>
                Phone number
                <input
                  type="tel"
                  value={deliveryPhone}
                  onChange={(event) => setDeliveryPhone(event.target.value)}
                  placeholder="e.g. 07XXXXXXXX"
                  required
                  maxLength={20}
                />
              </label>

              <div className="shop-payment-notice">
                <h3>M-PESA BUY GOODS PAYMENT</h3>
                <p>Pay for your merchandise using the official club Till:</p>
                <strong>BUY GOODS TILL NUMBER: 123456</strong>
                <p><strong>Business name: THIKA WALKING HUB</strong></p>
                <p>
                  After making payment, enter your M-Pesa transaction code
                  in the field below. Your order will be recorded and the
                  payment verified by the club.
                </p>
              </div>

              <label>
  M-Pesa transaction code
  <input
    type="text"
    value={mpesaCode}
    onChange={(event) => setMpesaCode(event.target.value.toUpperCase())}
    placeholder="Enter your M-Pesa transaction code"
    maxLength={40}
    autoCapitalize="characters"
    required
  />
</label>

              {checkoutError && (
                <div className="shop-checkout-error" role="alert">
                  <AlertCircle size={18} />
                  <span>{checkoutError}</span>
                </div>
              )}

              <button
                className="shop-checkout-submit"
                type="submit"
                disabled={checkoutLoading || cart.length === 0}
              >
                {checkoutLoading ? (
                  <>
                    <LoaderCircle className="shop-spinner" size={19} />
                    PLACING ORDER...
                  </>
                ) : (
                  <>
                    PLACE ORDER
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <p className="shop-checkout-footnote">
                Your order will be recorded as awaiting payment verification.
                The club will confirm the next steps.
              </p>
            </form>
          </section>
        </div>
      )}

      {orderSuccess && (
        <div className="shop-modal-overlay">
          <section className="shop-order-success" role="dialog" aria-modal="true">
            <div className="shop-success-icon">
              <Package size={38} />
            </div>
            <span className="shop-section-label">THANK YOU</span>
            <h2>ORDER RECEIVED</h2>
            <p>
              Your merchandise order has been submitted successfully.
              Payment is awaiting verification by the club.
            </p>
            <div className="shop-success-order-number">
              ORDER #{orderSuccess.id}
            </div>
            <strong>{formatPrice(orderSuccess.total_amount)}</strong>
            <button
              type="button"
              onClick={() => setOrderSuccess(null)}
            >
              CONTINUE SHOPPING
            </button>
          </section>
        </div>
      )}

    </main>
  );
}

export default Shop;