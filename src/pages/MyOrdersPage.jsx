import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { X } from 'lucide-react';
import './AuthPage.css';

const MyOrdersPage = () => {
    const getCurrencySymbol = useSettingsStore(state => state.getCurrencySymbol);
    const currencySymbol = getCurrencySymbol();
    
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const navigate = useNavigate();
    const { userInfo } = useAuthStore();

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            const fetchMyOrders = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                    const { data } = await axios.get(`${window.API_BASE_URL}/api/orders/myorders`, config);
                    setOrders(data);
                    setOrdersLoading(false);
                } catch (err) {
                    console.error(err);
                    setOrdersLoading(false);
                }
            };
            fetchMyOrders();
        }
    }, [navigate, userInfo]);

    return (
        <div className="container fade-in" style={{ marginTop: '40px', paddingBottom: '60px' }}>
            <h2 className="section-title">My Orders</h2>
            {ordersLoading ? <div className="loader">Loading...</div> : orders.length === 0 ? (
                <div className="error-message" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>You have no orders</div>
            ) : (
                <div className="table-container glass">
                    <table className="admin-table responsive-table">
                        <thead>
                            <tr>
                                <th>ORDER ID</th>
                                <th>PRODUCT</th>
                                <th>DATE</th>
                                <th>TOTAL</th>
                                <th>PAID</th>
                                <th>DELIVERED</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td data-label="ORDER ID" style={{ fontWeight: 600 }}>
                                        #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                                    </td>
                                    <td data-label="PRODUCT">
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                            {order.orderItems?.[0]?.name}
                                            {order.orderItems?.length > 1 && ` + ${order.orderItems.length - 1} more`}
                                        </div>
                                    </td>
                                    <td data-label="DATE">{order.createdAt.substring(0, 10)}</td>
                                    <td data-label="TOTAL">{currencySymbol}{order.totalPrice.toFixed(2)}</td>
                                    <td data-label="PAID">{order.isPaid ? order.paidAt.substring(0, 10) : <X color="red" size={20} />}</td>
                                    <td data-label="DELIVERED">{order.isDelivered ? order.deliveredAt.substring(0, 10) : <X color="red" size={20} />}</td>
                                    <td data-label="ACTION">
                                        <Link to={`/order/${order._id}`}>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '14px' }}>Details</button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
