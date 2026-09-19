import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Printer } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { generateInvoice } from '../utils/invoiceGenerator';
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

    const [wallet, setWallet] = useState(null);
    const [useWallet, setUseWallet] = useState(false);
    const [returnLoading, setReturnLoading] = useState(false);


    
    const [cancelData, setCancelData] = useState(null);
    const [returnData, setReturnData] = useState(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReasonText, setReturnReasonText] = useState('');
    const [requestType, setRequestType] = useState('RETURN');

    const [loadingEligibility, setLoadingEligibility] = useState(true);


    const fetchOrder = async () => {
        
        
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/orders/${orderId}`, config);
            setOrder(data);
            
            // Check eligibility
            try {
                const cancelRes = await axios.get(`${window.API_BASE_URL}/api/orders/${orderId}/cancellation-eligibility`, config);
                setCancelData(cancelRes.data);
                
                if (data.isDelivered || data.status === 'Delivered') {
                    const returnRes = await axios.get(`${window.API_BASE_URL}/api/orders/${orderId}/return-eligibility`, config);
                    setReturnData(returnRes.data);
                }
            } catch(e) {
                console.error("Eligibility check error", e);
            }
            
            // Check Wallet
            if (!data.isPaid && data.status !== 'Cancelled' && data.status !== 'Returned') {
                try {
                    const walletRes = await axios.get(`${window.API_BASE_URL}/api/wallet`, config);
                    if (walletRes.data.success && walletRes.data.wallet) {
                        setWallet(walletRes.data.wallet);
                    }
                } catch(e) {
                    console.error("Wallet fetch error", e);
                }
            }
            
            setLoadingEligibility(false);
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
    { walletAmountUsed: useWallet && wallet && wallet.balance > 0 ? Math.min(wallet.balance, order.totalPrice) : 0 }, 
    config
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
    { ...response, walletAmountUsed: useWallet && wallet && wallet.balance > 0 ? Math.min(wallet.balance, order.totalPrice) : 0 },
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

    
    const payWithWalletOnlyHandler = async () => {
        setPayLoading(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(`${window.API_BASE_URL}/api/orders/${orderId}/pay-with-wallet`, {}, config);
            alert('Payment Successful via Wallet');
            fetchOrder();
        } catch (err) {
            setError(err.response?.data?.message || 'Wallet payment failed');
        } finally {
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

    const cancelOrderHandler = async () => {
        if(window.confirm('Are you sure you want to cancel this order?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.put(`${window.API_BASE_URL}/api/orders/${orderId}/cancel`, { reason: 'Cancelled via Website' }, config);
                alert('Order Cancelled successfully');
                fetchOrder();
            } catch (err) {
                alert(err.response?.data?.message || 'Error cancelling order');
            }
        }
    };

    
    const openReturnModal = (type) => {
        setRequestType(type);
        setReturnReasonText('');
        setShowReturnModal(true);
    };

    const submitReturnRequest = async () => {
        if (!returnReasonText.trim()) {
            alert('Please provide a reason');
            return;
        }
        try {
            setReturnLoading(true);
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            
            const payload = { returnReason: returnReasonText, requestType };
            if (window.selectedReturnItem) {
                payload.returnItems = [{ product: window.selectedReturnItem.product, qty: window.selectedReturnItem.qty }];
            }

            await axios.put(`${window.API_BASE_URL}/api/orders/${orderId}/return`, payload, config);
            alert(`${requestType === 'REPLACEMENT' ? 'Replacement' : 'Return'} requested successfully!`);
            setShowReturnModal(false);
            window.selectedReturnItem = null; // Clear selection
            
            // Refresh order
            const { data } = await axios.get(`${window.API_BASE_URL}/api/orders/${orderId}`, config);
            setOrder(data);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setReturnLoading(false);
        }
    };


    const actualStatus = ['Returned', 'Replacement Requested', 'Cancelled', 'Refunded', 'Replaced'].includes(order?.status) ? order.status : (order?.isDelivered ? 'Delivered' : (order?.status || 'Pending'));
    const isCancelledOrReturned = ['Cancelled', 'Returned'].includes(actualStatus);

    return loading ? <div className="loader container">Loading Order...</div> : error ? <div className="error-message container">{error}</div> : (
        <div className="container fade-in" style={{ marginTop: '40px' }}>
            <div className="glass" style={{ padding: '32px 24px', borderRadius: '16px', marginBottom: '32px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>
                    ✓
                </div>
                <h1 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '28px' }}>Order Details</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px' }}>
                    Your order ID is: <strong style={{ color: 'var(--text-primary)', userSelect: 'all' }}>#{order.orderNumber || order._id.substring(0, 8).toUpperCase()}</strong>
                </p>
                <div style={{ display: 'inline-flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                        ← Continue Shopping
                    </Link>
                    <button
                        type="button"
                        onClick={() => generateInvoice(order, settings)}
                        className="btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', cursor: 'pointer' }}
                    >
                        <Printer size={16} /> Download Invoice
                    </button>
                </div>
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
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 'bold' }}>
                            <strong>Status:</strong> <span style={{ color: 'var(--accent-color)' }}>{actualStatus}</span>
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
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            <strong>Method:</strong> {order.paymentMethod}
                        </p>
                        {order.walletAmount > 0 && (
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <strong>Paid from Wallet:</strong> {currencySymbol}{order.walletAmount.toFixed(2)}
                            </p>
                        )}
                        {order.onlineAmount > 0 && (
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <strong>Paid Online:</strong> {currencySymbol}{order.onlineAmount.toFixed(2)}
                            </p>
                        )}
                        <p style={{ marginBottom: '16px' }}></p>
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
                            {order.orderItems.map((item, index) => {
                                const eligibility = returnData?.itemsEligibility?.find(e => e.product === item.product);
                                return (
                                <div key={index} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <div className="cart-item" style={{ gridTemplateColumns: '50px 3fr 1fr', padding: '0', borderBottom: 'none' }}>
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
                                    {!loadingEligibility && eligibility && (eligibility.canReturn || eligibility.canReplace) && !isCancelledOrReturned && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-end' }}>
                                            {eligibility.canReturn && (
                                                <button onClick={() => {
                                                    // Pass product id to modal
                                                    setReturnReasonText('');
                                                    openReturnModal('RETURN');
                                                    // We need a way to store selected items for return.
                                                    // Using a global var or hacking it via document.body since we don't have a state for it
                                                    window.selectedReturnItem = item;
                                                }} style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #f59e0b', background: 'transparent', color: '#f59e0b', cursor: 'pointer' }}>
                                                    Return Item
                                                </button>
                                            )}
                                            {eligibility.canReplace && (
                                                <button onClick={() => {
                                                    setReturnReasonText('');
                                                    openReturnModal('REPLACEMENT');
                                                    window.selectedReturnItem = item;
                                                }} style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6', cursor: 'pointer' }}>
                                                    Replace Item
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {!loadingEligibility && eligibility && !eligibility.canReturn && !eligibility.canReplace && order.isDelivered && !isCancelledOrReturned && (
                                        <div style={{ fontSize: '11px', color: '#ef4444', textAlign: 'right', marginTop: '4px' }}>
                                            {eligibility.reason}
                                        </div>
                                    )}
                                </div>
                            )})}
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
                    
                    
                    {!order.isPaid && !isCancelledOrReturned && (
                        <div style={{ marginBottom: '16px' }}>
                            {wallet && wallet.balance > 0 && settings?.isWalletPaymentEnabled && (
                                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="useWallet" 
                                        checked={useWallet} 
                                        onChange={(e) => setUseWallet(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="useWallet" style={{ cursor: 'pointer', margin: 0, fontWeight: '500' }}>
                                        Use Wallet Balance ({currencySymbol}{wallet.balance.toFixed(2)})
                                    </label>
                                </div>
                            )}

                            {useWallet && wallet && wallet.balance >= order.totalPrice ? (
                                <button className="btn-primary w-100" onClick={payWithWalletOnlyHandler} disabled={payLoading}>
                                    {payLoading ? 'Processing...' : 'Pay with Wallet'}
                                </button>
                            ) : (
                                <button className="btn-primary w-100" onClick={payOrderHandler} disabled={payLoading}>
                                    {payLoading ? 'Processing...' : (userInfo?.isAdmin ? 'Mark As Paid (Cash Collected)' : 
                                        (useWallet && wallet && wallet.balance > 0) ? `Pay ${currencySymbol}${(order.totalPrice - wallet.balance).toFixed(2)} Online` : 'Pay Online Now'
                                    )}
                                </button>
                            )}
                        </div>
                    )}


                    {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && !isCancelledOrReturned && (
                        <button className="btn-secondary w-100" onClick={deliverOrderHandler} disabled={deliverLoading} style={{ marginBottom: '16px' }}>
                            {deliverLoading ? 'Updating...' : 'Mark As Delivered'}
                        </button>
                    )}

                    
                    {!loadingEligibility && cancelData?.canCancel && (
                        <button className="btn-secondary w-100" onClick={cancelOrderHandler} style={{ marginBottom: '16px', backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}>
                            Cancel Order
                        </button>
                    )}
                    
                    {!loadingEligibility && !cancelData?.canCancel && cancelData?.reason && !isCancelledOrReturned && (
                        <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '16px', textAlign: 'center' }}>
                            {cancelData.reason}
                        </div>
                    )}

                    


                    {showReturnModal && (
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                            <h5 style={{ marginBottom: '12px', fontWeight: 'bold' }}>{requestType === 'REPLACEMENT' ? 'Request Replacement' : 'Request Return'}</h5>
                            <textarea 
                                rows="3"
                                placeholder="Please describe your reason..."
                                value={returnReasonText}
                                onChange={(e) => setReturnReasonText(e.target.value)}
                                style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            ></textarea>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-primary" onClick={submitReturnRequest} disabled={returnLoading} style={{ flex: 1 }}>{returnLoading ? 'Submitting...' : 'Submit'}</button>
                                <button className="btn-secondary" onClick={() => setShowReturnModal(false)} disabled={returnLoading} style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </div>
                    )}

                    
                    {!loadingEligibility && !returnData?.canReturn && returnData?.reason && (actualStatus === 'Delivered' || isCancelledOrReturned) && (
                        <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '16px', textAlign: 'center' }}>
                            {returnData.reason}
                        </div>
                    )}
</div>
            </div>
            
        </div>
    );
};

export default OrderDetailsPage;
