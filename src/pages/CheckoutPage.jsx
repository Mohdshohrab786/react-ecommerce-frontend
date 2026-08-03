import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { ShieldCheck, HelpCircle, Loader2, ArrowRight } from 'lucide-react';
import '../pages/CartPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, shippingAddress, paymentMethod, saveShippingAddress, savePaymentMethod, clearCart } = useCartStore();
    const { userInfo, logout } = useAuthStore();
    const { settings, getCurrencySymbol } = useSettingsStore();
    const currencySymbol = getCurrencySymbol();

    // Shipping Address states
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');
    const [stateName, setStateName] = useState(shippingAddress.state || '');
    const [phone, setPhone] = useState(shippingAddress.phone || '');

    // Shipping calculations state
    const [calculatingShipping, setCalculatingShipping] = useState(false);
    const [shippingDetails, setShippingDetails] = useState({ isAvailable: true, charge: 0, deliveryDays: '', message: '' });

    // Payment Method state
    const [paymentMethodState, setPaymentMethodState] = useState(
        paymentMethod || (settings?.activePaymentGateway !== 'None' ? settings?.activePaymentGateway : 'PayPal')
    );

    // Coupon states
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState(null);
    const [couponSuccess, setCouponSuccess] = useState(null);

    // Order placing states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── PAYMENT GATEWAY MODAL SIMULATION STATE ──
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState('');
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=shipping');
        }
    }, [userInfo, navigate]);

    // Redirect to cart if empty on mount
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
        // eslint-disable-next-line
    }, []);

    // Fetch profile to prefill shipping details if empty
    useEffect(() => {
        const fetchProfileAddress = async () => {
            if (userInfo && userInfo.token) {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`
                        }
                    };
                    const { data } = await axios.get(`${window.API_BASE_URL}/api/users/profile`, config);
                    if (data) {
                        if (data.shippingAddress) {
                            setAddress(prev => prev || data.shippingAddress.address || '');
                            setCity(prev => prev || data.shippingAddress.city || '');
                            setPostalCode(prev => prev || data.shippingAddress.postalCode || '');
                            setCountry(prev => prev || data.shippingAddress.country || '');
                            setStateName(prev => prev || data.shippingAddress.state || '');
                        }
                        setPhone(prev => prev || (data.shippingAddress && data.shippingAddress.phone) || data.phone || '');
                    }
                } catch (err) {
                    console.error('Error loading profile shipping details:', err.message);
                }
            }
        };
        fetchProfileAddress();
    }, [userInfo]);

    // Dynamic Shipping Calculation Effect
    useEffect(() => {
        const calculateShippingCharge = async () => {
            if (settings?.isShippingEnabled === false) {
                setShippingDetails({ isAvailable: true, charge: 0, deliveryDays: '', message: '' });
                return;
            }

            if (!city || !postalCode) return;

            setCalculatingShipping(true);
            try {
                const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo?.token}` } };
                const { data } = await axios.post(`${window.API_BASE_URL}/api/shipping-rules/calculate`, {
                    city: city,
                    pincode: postalCode
                }, config);

                if (data.isAvailable) {
                    setShippingDetails({ isAvailable: true, charge: data.shippingCharge, deliveryDays: data.deliveryDays, message: '' });
                } else {
                    setShippingDetails({ isAvailable: false, charge: 0, deliveryDays: '', message: data.message || 'Delivery not available for this location.' });
                }
            } catch (err) {
                setShippingDetails({ isAvailable: false, charge: 0, deliveryDays: '', message: 'Error calculating shipping.' });
            } finally {
                setCalculatingShipping(false);
            }
        };
        
        const timeoutId = setTimeout(() => {
            calculateShippingCharge();
        }, 600);

        return () => clearTimeout(timeoutId);
    }, [city, postalCode, userInfo, settings]);

    // Price Calculations
    const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);
    const itemsPrice = addDecimals(cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));
    const shippingPrice = addDecimals(shippingDetails.charge);
    const taxPrice = addDecimals(Number((0.15 * itemsPrice).toFixed(2)));
    const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice) - discountAmount).toFixed(2);

    const applyCouponHandler = async () => {
        setCouponError(null);
        setCouponSuccess(null);
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code.');
            return;
        }
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
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

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async (orderId) => {
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
            setError('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            // 1. Create order on backend
            const { data: razorpayOrder } = await axios.post(
                `${window.API_BASE_URL}/api/orders/${orderId}/create-razorpay-order`,
                {}, config
            );

            // 2. Open Razorpay Window
            const options = {
                key: settings.razorpayKeyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: settings.websiteName || 'E-Commerce',
                description: "Order Payment",
                image: settings.logo?.startsWith('http') ? settings.logo : `${window.API_BASE_URL}${settings.logo}`,
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        setLoading(true);
                        await axios.post(
                            `${window.API_BASE_URL}/api/orders/${orderId}/verify-razorpay-payment`,
                            response,
                            config
                        );
                        clearCart();
                        navigate(`/order-success/${orderId}`);
                    } catch (verifyErr) {
                        setError('Payment verification failed.');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: userInfo.name || '',
                    email: userInfo.email || '',
                    contact: phone || ''
                },
                theme: {
                    color: "#f28b00"
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                        setError(`Payment process was cancelled. You can retry paying now for Order #${orderId}.`);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                setError('Payment failed. ' + response.error.description);
                setLoading(false);
            });
            paymentObject.open();

        } catch (err) {
            setError(err.response?.data?.message || 'Could not initiate Razorpay checkout');
            setLoading(false);
        }
    };

    const placeOrderHandler = async (e) => {
        e.preventDefault();

        // Validate shipping address and mobile number
        if (!address || !city || !postalCode || !country || !stateName || !phone) {
            setError('Please fill in all shipping fields and mobile number.');
            return;
        }

        if (!shippingDetails.isAvailable) {
            setError(shippingDetails.message || 'Delivery not available for this location.');
            return;
        }

        // Save to Cart Store
        saveShippingAddress({ address, city, postalCode, country, state: stateName, phone });
        savePaymentMethod(paymentMethodState);

        // Save to User Profile in DB as well
        if (userInfo && userInfo.token) {
            const profileConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            axios.put(`${window.API_BASE_URL}/api/users/profile`, {
                phone,
                shippingAddress: { address, city, postalCode, country, state: stateName, phone }
            }, profileConfig).catch(err => console.error('Failed to update DB shipping address:', err.message));
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            setLoading(true);
            setError(null);
            const { data } = await axios.post(`${window.API_BASE_URL}/api/orders`, {
                orderItems: cartItems.map(item => ({
                    ...item,
                    product: item.product || item._id,
                    image: item.image && item.image.startsWith('http') ? item.image : `${window.API_BASE_URL}${item.image}`
                })),
                shippingAddress: { address, city, postalCode, country, state: stateName, phone },
                paymentMethod: paymentMethodState,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
                coupon: appliedCoupon ? appliedCoupon._id : undefined,
                discountAmount: discountAmount
            }, config);

            setCreatedOrderId(data._id);
            
            // ── PAYMENT CHOICE LOGIC ──
            if (paymentMethodState === 'COD') {
                // Cash On Delivery redirects immediately
                setLoading(false);
                clearCart();
                navigate(`/order-success/${data._id}`);
            } else if (paymentMethodState === 'Razorpay') {
                // Launch real razorpay flow (loading state will be cleared by Razorpay modal dismiss or success)
                await handleRazorpayPayment(data._id);
            } else {
                // Fallback to simulated payment modal for other gateways for now
                setLoading(false);
                setShowPaymentModal(true);
            }
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
            if (err.response && err.response.status === 401) {
                logout();
                navigate('/login');
            }
            setLoading(false);
        }
    };

    // ── SIMULATE PAY EVENT FOR OTHER GATEWAYS (PhonePe, Cashfree, PayPal) ──
    const handleSimulatePayment = async () => {
        setPaymentProcessing(true);
        setPaymentError('');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            // Simulating network delay for gateway verification
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Call PUT api/orders/:id/pay
            await axios.put(`${window.API_BASE_URL}/api/orders/${createdOrderId}/pay`, {}, config);
            
            // Payment success routines
            setPaymentProcessing(false);
            setShowPaymentModal(false);
            clearCart();
            navigate(`/order-success/${createdOrderId}`);
        } catch (err) {
            setPaymentError(err.response?.data?.message || 'Payment verification failed. Please try again.');
            setPaymentProcessing(false);
        }
    };

    const handleCancelPayment = () => {
        setShowPaymentModal(false);
        setError(`Payment process was cancelled. You can retry paying now for Order #${createdOrderId} or choose COD.`);
    };

    useEffect(() => {
        if (settings) {
            const hasOnline = settings.activePaymentGateway && settings.activePaymentGateway !== 'None';
            const hasCod = settings.isCodEnabled !== false;
            
            if (!hasCod && paymentMethodState === 'COD') {
                setPaymentMethodState(hasOnline ? settings.activePaymentGateway : 'PayPal');
            } else if (!hasOnline && paymentMethodState !== 'COD' && hasCod) {
                setPaymentMethodState('COD');
            }
        }
    }, [settings, paymentMethodState]);

    // Gateway theme properties depending on selected gateway config
    const getGatewayTheme = () => {
        switch (paymentMethodState) {
            case 'Razorpay':
                return {
                    name: 'Razorpay Secure Checkout',
                    bgColor: '#0a2540',
                    textColor: '#ffffff',
                    accentColor: '#1260eb',
                    env: settings?.razorpayEnvironment || 'TEST',
                    keyId: settings?.razorpayKeyId || 'Not Configured'
                };
            case 'PhonePe':
                return {
                    name: 'PhonePe Merchant Portal',
                    bgColor: '#5f259f',
                    textColor: '#ffffff',
                    accentColor: '#8f3df5',
                    env: settings?.phonePeEnvironment || 'TEST',
                    keyId: settings?.phonePeMerchantId || 'Not Configured'
                };
            case 'Cashfree':
                return {
                    name: 'Cashfree Payment Gateway',
                    bgColor: '#111827',
                    textColor: '#ffffff',
                    accentColor: '#0ea5e9',
                    env: settings?.cashfreeEnvironment || 'TEST',
                    keyId: settings?.cashfreeAppId || 'Not Configured'
                };
            default:
                return {
                    name: 'PayPal Sandbox Checkout',
                    bgColor: '#003087',
                    textColor: '#ffffff',
                    accentColor: '#0079c1',
                    env: 'TEST',
                    keyId: 'PayPal Default API Client'
                };
        }
    };

    const gateway = getGatewayTheme();

    return (
        <div className="container fade-in" style={{ marginTop: '40px', paddingBottom: '60px' }}>
            <h1 className="section-title" style={{ marginBottom: '30px' }}>Checkout</h1>
            <div className="cart-content">
                
                {/* Left Side: Forms and Items Review */}
                <div className="order-details-left">
                    {/* Shipping Form */}
                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '22px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>1. Shipping Address</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Address</label>
                                <input type="text" className="input-field" style={{ marginBottom: 0 }} placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>City</label>
                                    <input type="text" className="input-field" style={{ marginBottom: 0 }} placeholder="Enter city" value={city} onChange={(e) => setCity(e.target.value)} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Postal Code</label>
                                    <input type="text" className="input-field" style={{ marginBottom: 0 }} placeholder="Enter postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Country</label>
                                    <input type="text" className="input-field" style={{ marginBottom: 0 }} placeholder="Enter country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>State</label>
                                    <input type="text" className="input-field" style={{ marginBottom: 0 }} placeholder="Enter state" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Number</label>
                                <input type="tel" className="input-field" style={{ marginBottom: 0 }} placeholder="Enter mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '22px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>2. Payment Method</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Render active gateway if configured and not 'None' */}
                            {settings?.activePaymentGateway && settings.activePaymentGateway !== 'None' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input 
                                        type="radio" 
                                        id={settings.activePaymentGateway} 
                                        name="paymentMethod" 
                                        value={settings.activePaymentGateway} 
                                        checked={paymentMethodState === settings.activePaymentGateway}
                                        onChange={(e) => setPaymentMethodState(e.target.value)}
                                    />
                                    <label htmlFor={settings.activePaymentGateway} style={{ marginBottom: 0, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>
                                        Pay Online via {settings.activePaymentGateway}
                                    </label>
                                </div>
                            )}

                            {/* Fallback to PayPal/Card if no gateway is selected in admin settings but we need an online placeholder */}
                            {(!settings?.activePaymentGateway || settings.activePaymentGateway === 'None') && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input 
                                        type="radio" 
                                        id="PayPal" 
                                        name="paymentMethod" 
                                        value="PayPal" 
                                        checked={paymentMethodState === 'PayPal'}
                                        onChange={(e) => setPaymentMethodState(e.target.value)}
                                    />
                                    <label htmlFor="PayPal" style={{ marginBottom: 0, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>
                                        PayPal or Credit Card
                                    </label>
                                </div>
                            )}

                            {/* COD (Cash On Delivery) option - only shown if enabled in admin settings */}
                            {settings?.isCodEnabled !== false && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input 
                                        type="radio" 
                                        id="COD" 
                                        name="paymentMethod" 
                                        value="COD" 
                                        checked={paymentMethodState === 'COD'}
                                        onChange={(e) => setPaymentMethodState(e.target.value)}
                                    />
                                    <label htmlFor="COD" style={{ marginBottom: 0, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>
                                        Cash On Delivery (COD)
                                    </label>
                                </div>
                            )}

                            {/* If both payment options are disabled by the admin */}
                            {settings?.isCodEnabled === false && settings?.activePaymentGateway === 'None' && (
                                <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>
                                    ⚠️ Online payments and COD are currently disabled. Please contact support.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Items Review */}
                    <div className="glass" style={{ padding: '30px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '22px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>3. Review Items</h2>
                        <div className="cart-items">
                            {cartItems.map((item, index) => (
                                <div key={index} className="cart-item" style={{ gridTemplateColumns: '50px 3fr 1fr', padding: '12px 0', borderBottom: '1px solid var(--border-color)', borderRadius: '0' }}>
                                    <div className="cart-item-img">
                                        <img 
                                            src={item.image && item.image.startsWith('http') ? item.image : `${window.API_BASE_URL}${item.image}`} 
                                            alt={item.name} 
                                        />
                                    </div>
                                    <div className="cart-item-name">
                                        <Link to={`/product/${item.product || item._id}`} style={{ fontWeight: 600 }}>{item.name}</Link>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            {item.color && <span>Color: <strong>{item.color}</strong></span>}
                                            {item.size && <span>Size: <strong>{item.size}</strong></span>}
                                        </div>
                                    </div>
                                    <div className="cart-item-price" style={{ textAlign: 'right', fontWeight: '500', fontSize: '14px' }}>
                                        {item.qty} x {currencySymbol}{item.price} = {currencySymbol}{(item.qty * item.price).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Order Summary and Coupons */}
                <div className="cart-summary glass">
                    <h2 style={{ fontSize: '22px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Summary</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
                        <span>{currencySymbol}{itemsPrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Shipping Fee</span>
                        <span>{calculatingShipping ? <Loader2 size={16} className="spin" /> : `${currencySymbol}${shippingPrice}`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tax (GST 15%)</span>
                        <span>{currencySymbol}{taxPrice}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', color: '#10b981', fontWeight: 600 }}>
                            <span>Discount ({appliedCoupon?.code})</span>
                            <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <span style={{ fontWeight: '700', fontSize: '18px' }}>Total Amount</span>
                        <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--accent-color)' }}>{currencySymbol}{totalPrice}</span>
                    </div>
                    
                    {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}
                    
                    {shippingDetails.message && !error && (
                        <div className="error-message" style={{ marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>
                            {shippingDetails.message}
                        </div>
                    )}
                    
                    <button 
                        className="btn-primary w-100" 
                        disabled={cartItems.length === 0 || loading || calculatingShipping || !shippingDetails.isAvailable}
                        onClick={placeOrderHandler}
                        style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 'bold' }}
                    >
                        {loading ? 'Placing Order...' : 'Place Order & Pay'}
                    </button>

                    {/* Coupon Form */}
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Apply Promo Code</h4>
                        {!appliedCoupon ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Enter Coupon Code" 
                                    value={couponCode} 
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="input-field"
                                    style={{ marginBottom: 0, flex: 1, padding: '8px 12px', fontSize: '13px' }}
                                />
                                <button 
                                    type="button" 
                                    onClick={applyCouponHandler} 
                                    className="btn-secondary"
                                    style={{ padding: '8px 16px', fontSize: '12px' }}
                                >
                                    Apply
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Code Applied:</span>
                                    <strong style={{ color: '#10b981', fontSize: '13px' }}>{appliedCoupon.code}</strong>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={removeCouponHandler} 
                                    className="btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                        {couponError && <div className="error-message" style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px' }}>{couponError}</div>}
                        {couponSuccess && <div style={{ color: '#10b981', fontSize: '12px', marginTop: '8px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '4px' }}>{couponSuccess}</div>}
                    </div>
                </div>
            </div>

            {/* ── HIGH FIDELITY payment SIMULATOR MODAL ── */}
            {showPaymentModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif'
                }}>
                    <div style={{
                        maxWidth: '460px',
                        width: '90%',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Gateway Header */}
                        <div style={{
                            backgroundColor: gateway.bgColor,
                            color: gateway.textColor,
                            padding: '24px',
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>{gateway.name}</h3>
                            <div style={{
                                display: 'inline-block',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: gateway.env === 'TEST' ? '#f59e0b' : '#10b981',
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginTop: '4px'
                            }}>
                                {gateway.env} MODE
                            </div>
                        </div>

                        {/* Gateway Body */}
                        <div style={{ padding: '24px', flex: 1 }}>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>ORDER ID: #{createdOrderId.substring(0, 16)}...</span>
                                <strong style={{ fontSize: '32px', color: '#111' }}>{currencySymbol}{totalPrice}</strong>
                            </div>

                            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span>Client Config Key:</span>
                                    <strong style={{ color: '#111', fontFamily: 'monospace' }}>{gateway.keyId.substring(0, 12)}...</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Mode:</span>
                                    <strong style={{ color: '#111' }}>{gateway.env === 'TEST' ? 'Sandbox Gateway' : 'Production Live Gateway'}</strong>
                                </div>
                            </div>

                            {paymentError && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
                                    {paymentError}
                                </div>
                            )}

                            {paymentProcessing ? (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <Loader2 size={36} className="animate-spin" style={{ color: gateway.accentColor, margin: '0 auto 12px' }} />
                                    <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>Processing & verifying transaction...</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={handleSimulatePayment}
                                        style={{
                                            backgroundColor: gateway.accentColor,
                                            color: '#fff',
                                            padding: '14px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.opacity = 0.9}
                                        onMouseLeave={(e) => e.target.style.opacity = 1}
                                    >
                                        <ShieldCheck size={18} /> Confirm {gateway.env === 'TEST' ? 'Test' : 'Live'} Payment
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={handleCancelPayment}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: '#ef4444',
                                            padding: '12px',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Cancel Transaction
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Gateway Footer */}
                        <div style={{
                            padding: '16px',
                            textAlign: 'center',
                            background: '#f9fafb',
                            borderTop: '1px solid #eee',
                            fontSize: '11px',
                            color: '#9ca3af'
                        }}>
                            🔒 Secured by {paymentMethodState} 256-bit SSL encryption.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
