import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Link } from 'react-router-dom';
import { Banknote, ShoppingBag, Package, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import './Admin.css';

const DashboardPage = () => {
    const { userInfo } = useAuthStore();
    const { getCurrencySymbol, settings } = useSettingsStore();
    const currency = getCurrencySymbol();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${window.API_BASE_URL}/api/admin/dashboard`, config);
                setStats(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        if (userInfo && userInfo.isAdmin) {
            fetchStats();
        }
    }, [userInfo]);

    const clearCacheHandler = async () => {
        if (window.confirm('Are you sure you want to clear both frontend and backend cache?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data } = await axios.post(`${window.API_BASE_URL}/api/settings/clear-cache`, {}, config);
                
                // Clear frontend caches
                // Preserve userInfo so they stay logged in
                const user = localStorage.getItem('userInfo');
                localStorage.clear();
                sessionStorage.clear();
                if (user) {
                    localStorage.setItem('userInfo', user);
                }
                
                alert(data.message || 'System cache cleared successfully! Page will reload.');
                window.location.reload();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    if (loading) return <div className="loader container">Loading Dashboard...</div>;
    if (error) return <div className="error-message container">{error}</div>;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="section-title" style={{ margin: 0 }}>Admin Dashboard</h1>
                <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                    onClick={clearCacheHandler}
                >
                    Clear System Cache
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '16px', borderRadius: '12px' }}>
                        <Banknote size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Sales</p>
                        <h2 style={{ margin: 0, fontSize: '28px' }}>
                            {currency}{stats && typeof stats.totalSales === 'number' ? stats.totalSales.toFixed(2) : '0.00'}
                        </h2>
                    </div>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '16px', borderRadius: '12px' }}>
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Orders</p>
                        <h2 style={{ margin: 0, fontSize: '28px' }}>{stats ? stats.totalOrders : 0}</h2>
                    </div>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '16px', borderRadius: '12px' }}>
                        <Package size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Products</p>
                        <h2 style={{ margin: 0, fontSize: '28px' }}>{stats ? stats.totalProducts : 0}</h2>
                    </div>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '16px', borderRadius: '12px' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Customers</p>
                        <h2 style={{ margin: 0, fontSize: '28px' }}>{stats ? stats.totalUsers : 0}</h2>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <TrendingUp size={24} style={{ color: 'var(--accent-color)' }} />
                        <h2 style={{ margin: 0, fontSize: '20px' }}>Recent Orders</h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>USER</th>
                                    <th>DATE</th>
                                    <th>TOTAL</th>
                                    <th>PAID</th>
                                    <th>DELIVERED</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats && stats.recentOrders && stats.recentOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{order._id ? `${order._id.substring(0, 8)}...` : 'N/A'}</td>
                                        <td>{order.user ? order.user.name : 'Deleted User'}</td>
                                        <td>{order.createdAt && typeof order.createdAt === 'string' ? order.createdAt.substring(0, 10) : 'N/A'}</td>
                                        <td>{currency}{typeof order.totalPrice === 'number' ? order.totalPrice.toFixed(2) : '0.00'}</td>
                                        <td>{order.isPaid && order.paidAt && typeof order.paidAt === 'string' ? order.paidAt.substring(0, 10) : '✕'}</td>
                                        <td>{order.isDelivered && order.deliveredAt && typeof order.deliveredAt === 'string' ? order.deliveredAt.substring(0, 10) : '✕'}</td>
                                    </tr>
                                ))}
                                {(!stats || !stats.recentOrders || stats.recentOrders.length === 0) && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No recent orders</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                        <Link to="/admin/orderlist" className="btn-secondary" style={{ padding: '8px 16px' }}>View All Orders</Link>
                    </div>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                        <h2 style={{ margin: 0, fontSize: '20px' }}>Low Stock Alert</h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>PRODUCT</th>
                                    <th>STOCK</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats && stats.lowStockProducts && stats.lowStockProducts.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <Link to={`/admin/product/${product._id}/edit`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                                                {product.name}
                                            </Link>
                                        </td>
                                        <td style={{ color: product.countInStock === 0 ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
                                            {product.countInStock}
                                        </td>
                                    </tr>
                                ))}
                                {(!stats || !stats.lowStockProducts || stats.lowStockProducts.length === 0) && (
                                    <tr><td colSpan="2" style={{ textAlign: 'center' }}>All stocks are healthy</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                        <Link to="/admin/productlist" className="btn-secondary" style={{ padding: '8px 16px' }}>View Inventory</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
