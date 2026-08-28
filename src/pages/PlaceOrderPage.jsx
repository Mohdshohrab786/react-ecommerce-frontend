import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import CheckoutSteps from '../components/CheckoutSteps';
import '../pages/CartPage.css';

const PlaceOrderPage = () => {
    const navigate = useNavigate();
    const { cartItems, shippingAddress, paymentMethod, clearCart } = useCartStore();
    const { userInfo, logout } = useAuthStore();
    const { settings, getCurrencySymbol } = useSettingsStore(state => state);
    const currencySymbol = getCurrencySymbol();
    
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState(null);
    const [couponSuccess, setCouponSuccess] = useState(null);

    // Shipping State
    const [shippingDetails, setShippingDetails] = useState({
        isAvailable: true,
        charge: 0,
        deliveryDays: '',
        message: ''
    });
    const [calculatingShipping, setCalculatingShipping] = useState(false);

    // Calculate prices
    const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);
    const itemsPrice = addDecimals(cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));
    
    // Dynamic Shipping Price based on calculation
    const shippingPrice = addDecimals(shippingDetails.charge);
    
    const taxPrice = addDecimals(Number((0.15 * itemsPrice).toFixed(2)));
    const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice) - discountAmount).toFixed(2);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=shipping');
        } else if (!shippingAddress.address || !shippingAddress.state || !shippingAddress.phone) {
            navigate('/shipping');
        } else if (!paymentMethod) {
            navigate('/payment');
        } else {
            calculateShippingCharge();
        }
    }, [userInfo, shippingAddress, paymentMethod, navigate, settings.isShippingEnabled]);

    const calculateShippingCharge = async () => {
        if (settings.isShippingEnabled === false) {
            setShippingDetails({ isAvailable: true, charge: 0, deliveryDays: '', message: '' });
            return;
        }

        if (!shippingAddress.city || !shippingAddress.postalCode) return;

        setCalculatingShipping(true);
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/shipping-rules/calculate`, {
                city: shippingAddress.city,
                pincode: shippingAddress.postalCode,
                state: shippingAddress.state
            }, config);

            if (data.isAvailable) {
                setShippingDetails({
                    isAvailable: true,
                    charge: data.shippingCharge,
                    deliveryDays: data.deliveryDays,
                    message: ''
                });
            } else {
                setShippingDetails({
                    isAvailable: false,
                    charge: 0,
                    deliveryDays: '',
                    message: data.message || 'Delivery not available for this location.'
                });
            }
        } catch (err) {
            setShippingDetails({
                isAvailable: false,
                charge: 0,
                deliveryDays: '',
                message: 'Error calculating shipping. Please check your address.'
            });
        } finally {
            setCalculatingShipping(false);
        }
    };

    const applyCouponHandler = async () => {
        setCouponError(null);
        setCouponSuccess(null);
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code.');
            return;
        }
        try {
            const config = {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/coupons/validate`, {
                code: couponCode,
                cartTotal: Number(itemsPrice),
                cartItems: cartItems
            }, config);
            
            setAppliedCoupon(data);
            setDiscountAmount(data.discountAmount);
            setCouponSuccess(`Coupon "${data.code}" applied! Discount: ${currencySymbol}${data.discountAmount}`);
        } catch (err) {
            setCouponError(err.response?.data?.message || err.message);
            setAppliedCoupon(null);
            setDiscountAmount(0);
        }
    };

    const removeCouponHandler = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode('');
        setCouponSuccess(null);
        setCouponError(null);
    };

    const placeOrderHandler = async () => {
        try {
            const config = {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` }
            };
            setLoading(true);
            setError(null);
            const { data } = await axios.post(`${window.API_BASE_URL}/api/orders`, {
                orderItems: cartItems.map(item => ({
                    ...item,
                    image: item.image && item.image.startsWith('http') ? item.image : `${window.API_BASE_URL}${item.image}`
                })),
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                shippingMethodName: settings.isShippingEnabled ? (shippingDetails.charge === 0 ? 'Free Shipping' : 'Calculated Shipping') : 'Standard',
                taxPrice,
                totalPrice,
                coupon: appliedCoupon ? appliedCoupon._id : undefined,
                discountAmount: discountAmount
            }, config);
            clearCart();
            navigate(`/order-success/${data._id}`);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
            if (err.response && err.response.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container fade-in" style={{ marginTop: '40px' }}>
            <CheckoutSteps step1 step2 step3 step4 />
            <div className="cart-content">
                <div className="order-details-left">
                    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Shipping Address</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            <strong>Address:</strong> {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode}, {shippingAddress.state}, {shippingAddress.country}
                            <br />
                            <strong>Phone:</strong> {shippingAddress.phone || userInfo.phone || 'N/A'}
                        </p>
                        
                        {/* Shipping Rule Calculation Results */}
                        <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '16px', margin: '0 0 12px 0' }}>Shipping Information</h3>
                            {calculatingShipping ? (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Calculating shipping charges for your location...</div>
                            ) : settings.isShippingEnabled === false ? (
                                <div style={{ color: '#10b981', fontWeight: '500', fontSize: '14px' }}>Free Shipping Applied Globally.</div>
                            ) : shippingDetails.isAvailable ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                        Charge: {shippingDetails.charge === 0 ? <span style={{ color: '#10b981' }}>Free</span> : `${currencySymbol}${shippingDetails.charge}`}
                                    </div>
                                    {shippingDetails.deliveryDays && (
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                            Estimated Delivery: {shippingDetails.deliveryDays}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ color: '#ef4444', fontWeight: '500', fontSize: '14px' }}>
                                    {shippingDetails.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Payment Method</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            <strong>Method:</strong> {paymentMethod}
                        </p>
                    </div>

                    <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Order Items</h2>
                        {cartItems.length === 0 ? <div className="error-message">Your cart is empty</div> : (
                            <div className="cart-items">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="cart-item" style={{ gridTemplateColumns: '50px 3fr 1fr', padding: '8px 0', borderBottom: '1px solid var(--border-color)', borderRadius: '0' }}>
                                        <div className="cart-item-img">
                                            <img 
                                                src={item.image && item.image.startsWith('http') ? item.image : `${window.API_BASE_URL}${item.image}`} 
                                                alt={item.name} 
                                            />
                                        </div>
                                        <div className="cart-item-name">
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                        </div>
                                        <div className="cart-item-price" style={{ textAlign: 'right', fontWeight: '500' }}>
                                            {item.qty} x {currencySymbol}{item.price} = {currencySymbol}{(item.qty * item.price).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="cart-summary glass">
                    <h2>Order Summary</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Items</span>
                        <span>{currencySymbol}{itemsPrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                        <span>{currencySymbol}{shippingPrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tax</span>
                        <span>{currencySymbol}{taxPrice}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', color: '#10b981', fontWeight: 600 }}>
                            <span>Discount ({appliedCoupon?.code})</span>
                            <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <span style={{ fontWeight: '700', fontSize: '20px' }}>Total</span>
                        <span style={{ fontWeight: '700', fontSize: '20px', color: 'var(--accent-color)' }}>{currencySymbol}{totalPrice}</span>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    
                    <button 
                        className="btn-primary w-100" 
                        disabled={cartItems.length === 0 || loading || calculatingShipping || !shippingDetails.isAvailable}
                        onClick={placeOrderHandler}
                        style={{ opacity: (!shippingDetails.isAvailable || calculatingShipping) ? 0.5 : 1 }}
                    >
                        {loading ? 'Placing Order...' : calculatingShipping ? 'Calculating Shipping...' : 'Place Order'}
                    </button>

                    {/* Coupon Form */}
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Apply Promo Code</h4>
                        {!appliedCoupon ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Enter Coupon Code" 
                                    value={couponCode} 
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="input-field"
                                    style={{ marginBottom: 0, flex: 1, padding: '8px 12px', fontSize: '14px' }}
                                />
                                <button 
                                    type="button" 
                                    onClick={applyCouponHandler} 
                                    className="btn-secondary"
                                    style={{ padding: '8px 16px', fontSize: '13px' }}
                                >
                                    Apply
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Code Applied:</span>
                                    <strong style={{ color: '#10b981', fontSize: '14px' }}>{appliedCoupon.code}</strong>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={removeCouponHandler} 
                                    className="btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                        {couponError && <div className="error-message" style={{ marginTop: '8px', padding: '6px 12px', fontSize: '13px' }}>{couponError}</div>}
                        {couponSuccess && <div style={{ color: '#10b981', fontSize: '13px', marginTop: '8px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '4px' }}>{couponSuccess}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
