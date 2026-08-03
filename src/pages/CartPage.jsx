import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import './CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart } = useCartStore();
    const getCurrencySymbol = useSettingsStore(state => state.getCurrencySymbol);
    const currencySymbol = getCurrencySymbol();

    const checkoutHandler = () => {
        navigate('/login?redirect=shipping');
    };

    return (
        <div className="cart-page container fade-in">
            <h1 className="section-title">Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <div className="empty-cart glass">
                    Your cart is empty <Link to="/" className="text-accent">Go Back</Link>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item.product} className="cart-item glass">
                                <div className="cart-item-img">
                                    <img 
                                        src={item.image && item.image.startsWith('http') ? item.image : `${window.API_BASE_URL}${item.image}`} 
                                        alt={item.name} 
                                    />
                                </div>
                                <div className="cart-item-name">
                                    <Link to={`/product/${item.product}`} style={{ fontWeight: 600 }}>{item.name}</Link>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {item.color && <span>Color: <strong>{item.color}</strong></span>}
                                        {item.size && <span>Size: <strong>{item.size}</strong></span>}
                                    </div>
                                </div>
                                <div className="cart-item-price">{currencySymbol}{item.price}</div>
                                <div className="cart-item-qty">
                                    <div className="qty-selector-container" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', height: '36px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                                        <button 
                                            type="button"
                                            onClick={() => addToCart({ ...item, qty: Math.max(1, item.qty - 1) })}
                                            disabled={item.qty <= 1}
                                            style={{ width: '28px', height: '100%', border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '14px', cursor: item.qty <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            -
                                        </button>
                                        <span style={{ width: '26px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
                                            {item.qty}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => addToCart({ ...item, qty: Math.min(item.countInStock, item.qty + 1) })}
                                            disabled={item.qty >= item.countInStock}
                                            style={{ width: '28px', height: '100%', border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '14px', cursor: item.qty >= item.countInStock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="cart-item-remove">
                                    <button onClick={() => removeFromCart(item.product)} className="btn-remove">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary glass">
                        <h2>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items</h2>
                        <div className="cart-total">
                            {currencySymbol}{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                        </div>
                        <button 
                            className="btn-primary w-100" 
                            disabled={cartItems.length === 0}
                            onClick={checkoutHandler}
                        >
                            Proceed To Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
