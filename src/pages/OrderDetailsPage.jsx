import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import '../pages/CartPage.css';

const OrderDetailsPage = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const { settings, getCurrencySymbol } = useSettingsStore();
    const currencySymbol = getCurrencySymbol();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payLoading, setPayLoading] = useState(false);
    const [deliverLoading, setDeliverLoading] = useState(false);

    const fetchOrder = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/orders/${orderId}`, config);
            setOrder(data);
            setLoading(false);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        // eslint-disable-next-line
    }, [orderId]);

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async () => {
        setPayLoading(true);
        setError('');

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
            setError('Razorpay SDK failed to load. Are you online?');
            setPayLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            // 1. Generate Razorpay Order ID for the existing MongoDB Order
            const { data: razorpayOrder } = await axios.post(
                `${window.API_BASE_URL}/api/orders/${orderId}/create-razorpay-order`,
                {}, config
            );

            // 2. Open Razorpay Window
            const options = {
                key: settings?.razorpayKeyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: settings?.websiteName || 'E-Commerce',
                description: "Order Payment",
                image: settings?.logo?.startsWith('http') ? settings.logo : `${window.API_BASE_URL}${settings?.logo}`,
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        setPayLoading(true);
                        await axios.post(
                            `${window.API_BASE_URL}/api/orders/${orderId}/verify-razorpay-payment`,
                            response,
                            config
                        );
                        // Payment successful, refresh order data
                        fetchOrder();
                    } catch (verifyErr) {
                        setError('Payment verification failed.');
                        setPayLoading(false);
                    }
                },
                prefill: {
                    name: userInfo.name || order?.user?.name || '',
                    email: userInfo.email || order?.user?.email || '',
                    contact: order?.shippingAddress?.phone || userInfo.phone || ''
                },
                theme: {
                    color: "#10b981"
                },
                modal: {
                    ondismiss: function() {
                        setPayLoading(false);
                        setError('Payment process was cancelled. You can retry paying now.');
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                setError('Payment failed: ' + response.error.description);
                setPayLoading(false);
            });
            paymentObject.open();

        } catch (err) {
            setError(err.response?.data?.message || 'Could not initiate Razorpay checkout');
            setPayLoading(false);
        }
    };

    const payOrderHandler = async () => {
        if (userInfo?.isAdmin) {
            // Admin can mark it paid directly
            setPayLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.put(`${window.API_BASE_URL}/api/orders/${orderId}/pay`, {}, config);
                fetchOrder();
            } catch (err) {
                console.error(err);
            } finally {
                setPayLoading(false);
            }
        } else {
            // Customers pay online securely
            handleRazorpayPayment();
        }
    };

    const deliverOrderHandler = async () => {
        setDeliverLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`${window.API_BASE_URL}/api/orders/${orderId}/deliver`, {}, config);
            fetchOrder();
        } catch (err) {
            console.error(err);
        } finally {
            setDeliverLoading(false);
        }
    };

    return loading ? <div className="loader container">Loading Order...</div> : error ? <div className="error-message container">{error}</div> : (
        <div className="container fade-in" style={{ marginTop: '40px' }}>
            <div className="glass" style={{ padding: '32px 24px', borderRadius: '16px', marginBottom: '32px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>
                    ✓
                </div>
                <h1 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '28px' }}>Thank You For Your Order!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px' }}>
                    Your order ID is: <strong style={{ color: 'var(--text-primary)', userSelect: 'all' }}>#{order.orderNumber || order._id.substring(0, 8).toUpperCase()}</strong>
                </p>
                <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                    ← Continue Shopping
                </Link>
            </div>

            <h2 className="section-title" style={{ fontSize: '22px' }}>Order Details</h2>
            <div className="cart-content">
                <div className="order-details-left">
                    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Shipping</h2>
                        <p style={{ color: 'var(--text-secondary)' }}><strong>Name:</strong> {order.user.name}</p>
                        <p style={{ color: 'var(--text-secondary)' }}><strong>Email:</strong> {order.user.email}</p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            <strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                        {order.isDelivered ? (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '8px' }}>
                                Delivered on {order.deliveredAt.substring(0, 10)}
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px' }}>
                                Not Delivered
                            </div>
                        )}
                    </div>

                    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Payment Method</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            <strong>Method:</strong> {order.paymentMethod}
                        </p>
                        {order.isPaid ? (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '8px' }}>
                                Paid on {order.paidAt.substring(0, 10)}
                            </div>
                        ) : order.paymentMethod === 'COD' ? (
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '12px', borderRadius: '8px' }}>
                                Cash on Delivery (Pending Payment)
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px' }}>
                                Not Paid
                            </div>
                        )}
                    </div>

                    <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Order Items</h2>
                        <div className="cart-items">
                            {order.orderItems.map((item, index) => (
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
                    </div>
                </div>

                <div className="cart-summary glass">
                    <h2>Order Summary</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Items</span>
                        <span>{currencySymbol}{order.itemsPrice.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                        <span>{currencySymbol}{order.shippingPrice.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tax</span>
                        <span>{currencySymbol}{order.taxPrice.toFixed(2)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', color: '#10b981', fontWeight: 600 }}>
                            <span>Discount Applied</span>
                            <span>-{currencySymbol}{order.discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <span style={{ fontWeight: '700', fontSize: '20px' }}>Total</span>
                        <span style={{ fontWeight: '700', fontSize: '20px', color: 'var(--accent-color)' }}>{currencySymbol}{order.totalPrice.toFixed(2)}</span>
                    </div>
                    
                    {!order.isPaid && (
                        <button className="btn-primary w-100" onClick={payOrderHandler} disabled={payLoading} style={{ marginBottom: '16px' }}>
                            {payLoading ? 'Processing...' : (userInfo?.isAdmin ? 'Mark As Paid (Cash Collected)' : 'Pay Online Now')}
                        </button>
                    )}

                    {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                        <button className="btn-secondary w-100" onClick={deliverOrderHandler} disabled={deliverLoading}>
                            {deliverLoading ? 'Updating...' : 'Mark As Delivered'}
                        </button>
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default OrderDetailsPage;
