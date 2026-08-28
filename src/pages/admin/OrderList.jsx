import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { 
    Search, 
    CheckCircle, 
    Clock, 
    Truck, 
    Eye, 
    Check, 
    X, 
    Banknote, 
    ShoppingBag, 
    RotateCw,
    AlertCircle,
    X as CloseIcon,
    Package,
    Printer
} from 'lucide-react';
import { generateInvoice } from '../../utils/invoiceGenerator';
import './Admin.css';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [payFilter, setPayFilter] = useState('all');
    const [deliverFilter, setDeliverFilter] = useState('all');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    // Inline Details & Status Update Modal State
    const [viewOrderDetails, setViewOrderDetails] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Quick Update Modal States (for quick actions)
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionType, setActionType] = useState(null); // 'pay' or 'deliver'
    const [modalOpen, setModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [errorUpdating, setErrorUpdating] = useState(null);

    // Toast Notification State
    const [toast, setToast] = useState({ message: '', type: '', visible: false });

    const { userInfo } = useAuthStore();
    const { getCurrencySymbol, settings } = useSettingsStore();
    const currency = getCurrencySymbol();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/orders`, config);
            setOrders(data);
            setLoading(false);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [userInfo.token]);

    // Reset pagination to page 1 when search term or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, payFilter, deliverFilter]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 4000);
    };

    const openConfirmModal = (order, type) => {
        setSelectedOrder(order);
        setActionType(type);
        setErrorUpdating(null);
        setModalOpen(true);
    };

    const handleConfirmUpdate = async () => {
        if (!selectedOrder) return;
        
        try {
            setUpdating(true);
            setErrorUpdating(null);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            let responseData;
            if (actionType === 'pay') {
                const { data } = await axios.put(`${window.API_BASE_URL}/api/orders/${selectedOrder._id}/pay`, {}, config);
                responseData = data;
                showToast(`Order #${selectedOrder._id.substring(0, 8)} marked as Paid!`, 'success');
            } else if (actionType === 'deliver') {
                const { data } = await axios.put(`${window.API_BASE_URL}/api/orders/${selectedOrder._id}/deliver`, {}, config);
                responseData = data;
                showToast(`Order #${selectedOrder._id.substring(0, 8)} marked as Delivered!`, 'success');
            }

            // Update local state dynamically without full reload
            setOrders(prevOrders => 
                prevOrders.map(order => order._id === selectedOrder._id ? responseData : order)
            );
            
            setModalOpen(false);
            setSelectedOrder(null);
            setActionType(null);
        } catch (err) {
            setErrorUpdating(err.response?.data?.message || err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!viewOrderDetails || !selectedStatus) return;
        
        try {
            setUpdatingStatus(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const { data } = await axios.put(`${window.API_BASE_URL}/api/orders/${viewOrderDetails._id}/status`, {
                status: selectedStatus
            }, config);

            // Update local state dynamically
            setOrders(prevOrders => 
                prevOrders.map(order => order._id === viewOrderDetails._id ? data : order)
            );
            
            setViewOrderDetails(data); // update modal data too
            showToast(`Order Status updated to ${selectedStatus}!`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Error updating status', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // KPI Metrics calculation
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, item) => acc + (item.isPaid ? item.totalPrice : 0), 0);
    const pendingPayments = orders.filter(o => !o.isPaid).length;
    const pendingDeliveries = orders.filter(o => o.isPaid && !o.isDelivered).length;

    // Filters and Search Application
    const filteredOrders = orders.filter((order) => {
        const matchesSearch = 
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.user && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesPay = 
            payFilter === 'all' ? true :
            payFilter === 'paid' ? order.isPaid :
            !order.isPaid;

        const matchesDeliver = 
            deliverFilter === 'all' ? true :
            deliverFilter === 'delivered' ? order.isDelivered :
            !order.isDelivered;

        return matchesSearch && matchesPay && matchesDeliver;
    });

    // Pagination calculations
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrdersList = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const openDetailsModal = (order) => {
        setViewOrderDetails(order);
        setSelectedStatus(order.status || 'Pending');
    };

    const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];

    return (
        <div className="fade-in">
            {/* Custom Toast Notification */}
            {toast.visible && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '16px 24px',
                    zIndex: 2000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontWeight: 500,
                    animation: 'fadeIn 0.2s ease',
                    borderRadius: '8px'
                }}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Orders Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                        Track, monitor and update customer orders
                    </p>
                </div>
                <button 
                    onClick={fetchOrders} 
                    className="btn-secondary" 
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                >
                    <RotateCw size={14} /> Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="order-stats-container">
                <div className="order-stat-card">
                    <div className="order-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div className="order-stat-info">
                        <p>Total Orders</p>
                        <h3>{totalOrders}</h3>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                        <Banknote size={24} />
                    </div>
                    <div className="order-stat-info">
                        <p>Total Revenue</p>
                        <h3>{currency}{totalRevenue.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                        <Clock size={24} />
                    </div>
                    <div className="order-stat-info">
                        <p>Unpaid Orders</p>
                        <h3>{pendingPayments}</h3>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                        <Truck size={24} />
                    </div>
                    <div className="order-stat-info">
                        <p>Pending Delivery</p>
                        <h3>{pendingDeliveries}</h3>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="order-controls glass" style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by Order ID or User name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filters-wrapper">
                    <select 
                        value={payFilter} 
                        onChange={(e) => setPayFilter(e.target.value)} 
                        className="filter-select"
                    >
                        <option value="all">Payment: All</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                    </select>

                    <select 
                        value={deliverFilter} 
                        onChange={(e) => setDeliverFilter(e.target.value)} 
                        className="filter-select"
                    >
                        <option value="all">Delivery: All</option>
                        <option value="delivered">Delivered</option>
                        <option value="pending">Pending Delivery</option>
                    </select>
                </div>
            </div>

            {/* Loading/Error/Table */}
            {loading ? (
                <div className="loader" style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</div>
            ) : error ? (
                <div className="error-message" style={{ padding: '20px', background: '#fdf2f2', color: '#ef4444' }}>{error}</div>
            ) : (
                <div className="table-container glass" style={{ padding: '0px' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ORDER ID</th>
                                <th>USER</th>
                                <th>DATE</th>
                                <th>TOTAL</th>
                                <th>PAYMENT STATUS</th>
                                <th>DELIVERY STATUS</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrdersList.map((order) => (
                                <tr key={order._id}>
                                    <td style={{ fontWeight: 600, fontSize: '14px' }}>
                                        #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                                    </td>
                                    <td>{order.user ? order.user.name : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Deleted User</span>}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 700 }}>{currency}{order.totalPrice.toFixed(2)}</td>
                                    <td>
                                        {order.isPaid ? (
                                            <span className="badge badge-success">
                                                <Check size={12} /> Paid ({new Date(order.paidAt).toLocaleDateString()})
                                            </span>
                                        ) : (
                                            <span className="badge badge-danger">
                                                <X size={12} /> Unpaid
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {order.isDelivered ? (
                                            <span className="badge badge-info">
                                                <Truck size={12} /> Delivered ({new Date(order.deliveredAt).toLocaleDateString()})
                                            </span>
                                        ) : (
                                            <span className="badge badge-warning">
                                                <Clock size={12} /> {order.status || 'Pending'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => generateInvoice(order, settings)}
                                                className="btn-secondary" 
                                                style={{ padding: '8px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                                title="Print or Download Invoice"
                                            >
                                                <Printer size={13} /> Invoice
                                            </button>
                                            {!order.isPaid && (
                                                <button 
                                                    onClick={() => openConfirmModal(order, 'pay')}
                                                    className="btn-primary" 
                                                    style={{ padding: '8px 12px', fontSize: '12px' }}
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                            {order.isPaid && !order.isDelivered && (
                                                <button 
                                                    onClick={() => openConfirmModal(order, 'deliver')}
                                                    className="btn-primary" 
                                                    style={{ padding: '8px 12px', fontSize: '12px', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                                                >
                                                    Mark Delivered
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => openDetailsModal(order)}
                                                className="btn-secondary" 
                                                style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Eye size={12} /> Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                                        No orders found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '20px 0 10px 0', borderTop: '1px solid var(--border-color)' }}>
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                            >
                                &larr; Prev
                            </button>
                            {[...Array(totalPages).keys()].map(x => (
                                <button 
                                    key={x + 1}
                                    onClick={() => handlePageChange(x + 1)}
                                    className={currentPage === x + 1 ? "btn-primary" : "btn-secondary"}
                                    style={{ 
                                        width: '28px', 
                                        height: '28px', 
                                        borderRadius: '4px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '12px', 
                                        fontWeight: 600,
                                        padding: 0,
                                        cursor: 'pointer' 
                                    }}
                                >
                                    {x + 1}
                                </button>
                            ))}
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Action Confirmation Modal */}
            {modalOpen && selectedOrder && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h2 className="modal-title">
                            Confirm Order Update
                        </h2>
                        <p className="modal-text">
                            Are you sure you want to mark Order <strong>#{selectedOrder._id}</strong> as{' '}
                            <strong style={{ color: actionType === 'pay' ? '#10b981' : '#3b82f6' }}>
                                {actionType === 'pay' ? 'PAID' : 'DELIVERED'}
                            </strong>? This action will update the database permanently.
                        </p>
                        {errorUpdating && (
                            <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px', background: '#fdf2f2', padding: '10px' }}>
                                {errorUpdating}
                            </div>
                        )}
                        <div className="modal-actions">
                            <button 
                                onClick={() => setModalOpen(false)} 
                                className="btn-secondary" 
                                style={{ padding: '10px 20px', fontSize: '13px' }}
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmUpdate} 
                                className="btn-primary" 
                                style={{ 
                                    padding: '10px 20px', 
                                    fontSize: '13px', 
                                    backgroundColor: actionType === 'pay' ? '#10b981' : '#3b82f6', 
                                    borderColor: actionType === 'pay' ? '#10b981' : '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                disabled={updating}
                            >
                                {updating ? 'Updating...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline Order Details & Status Update Modal */}
            {viewOrderDetails && (
                <div className="admin-modal-overlay" style={{ zIndex: 1500 }}>
                    <div className="admin-modal" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                                <Package size={22} color="var(--accent-color)" /> Order Details
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => generateInvoice(viewOrderDetails, settings)}
                                    className="btn-primary"
                                    style={{ padding: '8px 14px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                    title="Download or Print Invoice"
                                >
                                    <Printer size={14} /> Download Invoice
                                </button>
                                <button onClick={() => setViewOrderDetails(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                                    <CloseIcon size={22} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            {/* Summary Block */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary</h3>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Order ID:</strong> #{viewOrderDetails.orderNumber || viewOrderDetails._id.substring(0, 8).toUpperCase()}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Date:</strong> {new Date(viewOrderDetails.createdAt).toLocaleString()}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Customer:</strong> {viewOrderDetails.user?.name || 'Unknown'}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {viewOrderDetails.user?.email || 'Unknown'}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Payment:</strong> {viewOrderDetails.paymentMethod}</p>
                            </div>

                            {/* Shipping Block */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shipping Info</h3>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Address:</strong> {viewOrderDetails.shippingAddress?.address}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>City:</strong> {viewOrderDetails.shippingAddress?.city}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Postal Code:</strong> {viewOrderDetails.shippingAddress?.postalCode}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Country:</strong> {viewOrderDetails.shippingAddress?.country}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Items</h3>
                            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                                        <tr>
                                            <th style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Item</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'center', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Qty</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Price</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewOrderDetails.orderItems && viewOrderDetails.orderItems.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <img src={item.image?.startsWith('http') ? item.image : `${window.API_BASE_URL}${item.image}`} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                                                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</span>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{item.qty}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{currency}{item.price?.toFixed(2)}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-primary)' }}>{currency}{(item.qty * item.price)?.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Order Summary Financials & Status Manager */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
                            
                            {/* Update Status Form */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '13px', marginBottom: '12px', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Update Order Status</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Current Lifecycle Status</label>
                                        <select 
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="filter-select"
                                            style={{ width: '100%' }}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleUpdateStatus}
                                        disabled={updatingStatus || selectedStatus === (viewOrderDetails.status || 'Pending')}
                                        className="btn-primary"
                                        style={{ padding: '10px', fontSize: '13px', width: '100%', textAlign: 'center' }}
                                    >
                                        {updatingStatus ? 'Updating...' : 'Save New Status'}
                                    </button>
                                </div>
                            </div>

                            {/* Totals */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Totals</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <span>Items Subtotal:</span>
                                    <span>{currency}{viewOrderDetails.itemsPrice?.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <span>Shipping:</span>
                                    <span>{currency}{viewOrderDetails.shippingPrice?.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <span>Tax:</span>
                                    <span>{currency}{viewOrderDetails.taxPrice?.toFixed(2)}</span>
                                </div>
                                {viewOrderDetails.discountAmount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                                        <span>Discount:</span>
                                        <span>-{currency}{viewOrderDetails.discountAmount?.toFixed(2)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    <span>Total:</span>
                                    <span style={{ color: 'var(--accent-color)' }}>{currency}{viewOrderDetails.totalPrice?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList;
