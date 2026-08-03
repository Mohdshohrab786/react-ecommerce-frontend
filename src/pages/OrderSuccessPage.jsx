import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, ShoppingBag, ArrowRight, FileText, MapPin, CreditCard, Calendar, Truck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
    const { id: orderId } = useParams();
    const { userInfo } = useAuthStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const getCurrencySymbol = useSettingsStore(state => state.getCurrencySymbol);
    const currencySymbol = getCurrencySymbol();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                };
                const { data } = await axios.get(`${window.API_BASE_URL}/api/orders/${orderId}`, config);
                setOrder(data);
            } catch (error) {
                console.error("Error loading order for success page:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userInfo && orderId) {
            fetchOrder();
        } else {
            setLoading(false);
        }
    }, [orderId, userInfo]);

    return (
        <div className="order-success-page container fade-in">
            <div className="success-card glass">
                <div className="success-header">
                    <div className="success-icon-wrapper">
                        <CheckCircle2 size={70} className="success-check-icon" />
                    </div>
                    <h1 className="success-title">Thank You!</h1>
                    <p className="success-subtitle">Your order has been placed successfully and is now being processed.</p>
                </div>

                {loading ? (
                    <div className="success-order-loader">Retrieving order summary...</div>
                ) : order ? (
                    <div className="success-summary-wrapper">
                        {/* Order Meta Info */}
                        <div className="order-meta-info">
                            <div className="meta-item">
                                <span className="meta-label">Order ID</span>
                                <strong className="meta-val">#{order._id}</strong>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Date</span>
                                <strong className="meta-val"><Calendar size={13} style={{display:'inline', marginRight:'4px'}}/>{new Date(order.createdAt).toLocaleDateString()}</strong>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Status</span>
                                <span className="status-badge pending">{order.status}</span>
                            </div>
                        </div>

                        {/* Order Items Review */}
                        <div className="success-items-section">
                            <h3>Items Ordered</h3>
                            <div className="success-items-list">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="success-item-row">
                                        <img 
                                            src={item.image && item.image.startsWith('http') ? item.image : `${window.API_BASE_URL}${item.image}`} 
                                            alt={item.name} 
                                            className="success-item-img"
                                        />
                                        <div className="success-item-info">
                                            <span className="success-item-name">{item.name}</span>
                                            <span className="success-item-qty">Qty: {item.qty}</span>
                                        </div>
                                        <span className="success-item-price">{currencySymbol}{(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Two Columns for Info */}
                        <div className="success-info-grid">
                            {/* Shipping info */}
                            <div className="info-box">
                                <h4><Truck size={15} style={{marginRight: '6px'}}/>Shipping Address</h4>
                                <div className="info-box-content">
                                    <p className="info-text-bold">{userInfo?.name}</p>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                            </div>

                            {/* Payment info */}
                            <div className="info-box">
                                <h4><CreditCard size={15} style={{marginRight: '6px'}}/>Payment Details</h4>
                                <div className="info-box-content">
                                    <p><span className="info-label">Method:</span> <strong>{order.paymentMethod === 'COD' ? 'Cash On Delivery' : 'Online / Card'}</strong></p>
                                    <p><span className="info-label">Status:</span> <span className={order.isPaid ? 'text-success' : 'text-danger'}>{order.isPaid ? 'Paid' : 'Unpaid'}</span></p>
                                    
                                    {/* Cost breakdown */}
                                    <div className="cost-breakdown">
                                        <div className="cost-row">
                                            <span>Subtotal:</span>
                                            <span>{currencySymbol}{order.itemsPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="cost-row">
                                            <span>Shipping:</span>
                                            <span>{currencySymbol}{order.shippingPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="cost-row">
                                            <span>Tax:</span>
                                            <span>{currencySymbol}{order.taxPrice.toFixed(2)}</span>
                                        </div>
                                        {order.discountAmount > 0 && (
                                            <div className="cost-row discount">
                                                <span>Discount:</span>
                                                <span>-{currencySymbol}{order.discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="cost-row total">
                                            <span>Total Paid:</span>
                                            <span>{currencySymbol}{order.totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="success-order-details">
                        <div className="detail-row">
                            <span className="label">Order ID</span>
                            <span className="value">#{orderId}</span>
                        </div>
                    </div>
                )}

                <div className="success-message-box">
                    <p>A confirmation email has been sent. We will send shipping status updates as soon as your items dispatch.</p>
                </div>

                <div className="success-actions">
                    <Link to={`/order/${orderId}`} className="btn-primary w-100 success-btn">
                        <FileText size={16} style={{ marginRight: '8px' }} /> View Invoice / Make Payment
                    </Link>
                    <Link to="/" className="btn-secondary w-100 success-btn" style={{ marginTop: '12px' }}>
                        <ShoppingBag size={16} style={{ marginRight: '8px' }} /> Continue Shopping <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
