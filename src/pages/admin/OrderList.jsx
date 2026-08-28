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
    Printer, 
    Trash2, 
    CheckSquare, 
    Square,
    Download
} from 'lucide-react';
import { generateInvoice } from '../../utils/invoiceGenerator';
import { exportOrdersToCSV } from '../../utils/csvExporter';
import './Admin.css';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [payFilter, setPayFilter] = useState('all');
    const [deliverFilter, setDeliverFilter] = useState('all');

    // Bulk selection & Deletion States
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

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
            
            if (actionType === 'pay') {
                await axios.put(`${window.API_BASE_URL}/api/orders/${selectedOrder._id}/pay`, {}, config);
                showToast(`Order #${selectedOrder.orderNumber || selectedOrder._id.substring(0, 8)} marked as PAID!`);
            } else if (actionType === 'deliver') {
                await axios.put(`${window.API_BASE_URL}/api/orders/${selectedOrder._id}/deliver`, {}, config);
                showToast(`Order #${selectedOrder.orderNumber || selectedOrder._id.substring(0, 8)} marked as DELIVERED!`);
            }

            setModalOpen(false);
            setSelectedOrder(null);
            fetchOrders();
        } catch (err) {
            setErrorUpdating(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setUpdating(false);
        }
    };

    // Open Details Modal
    const openDetailsModal = (order) => {
        setViewOrderDetails(order);
        setSelectedStatus(order.status || (order.isDelivered ? 'Delivered' : 'Pending'));
    };

    // Update Status from Details Modal
    const handleUpdateStatus = async () => {
        if (!viewOrderDetails || !selectedStatus) return;
        try {
            setUpdatingStatus(true);
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(`${window.API_BASE_URL}/api/orders/${viewOrderDetails._id}/status`, { status: selectedStatus }, config);
            showToast(`Order status updated to: ${selectedStatus}`);
            setViewOrderDetails(data);
            fetchOrders();
        } catch (err) {
            showToast(err.response?.data?.message || err.message, 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Single / Bulk Delete Handlers
    const openDeleteModal = (order = null) => {
        setOrderToDelete(order);
        setDeleteError(null);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleting(true);
            setDeleteError(null);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            if (orderToDelete) {
                const targetId = orderToDelete._id;
                const orderNum = orderToDelete.orderNumber || targetId.substring(0, 8);
                
                await axios.delete(`${window.API_BASE_URL}/api/orders/${targetId}`, config);
                
                setOrders(prev => prev.filter(o => o._id !== targetId));
                setSelectedOrderIds(prev => prev.filter(id => id !== targetId));
                showToast(`Order #${orderNum} deleted successfully`);
            } else if (selectedOrderIds.length > 0) {
                const count = selectedOrderIds.length;
                const idsToDelete = [...selectedOrderIds];
                
                const { data } = await axios.post(`${window.API_BASE_URL}/api/orders/bulk-delete`, { orderIds: idsToDelete }, config);
                
                setOrders(prev => prev.filter(o => !idsToDelete.includes(o._id)));
                setSelectedOrderIds([]);
                showToast(data.message || `${count} orders deleted successfully`);
            }

            setDeleteModalOpen(false);
            setOrderToDelete(null);
            fetchOrders();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to delete order. Please try again.';
            setDeleteError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setDeleting(false);
        }
    };

    // Filter Logic
    const filteredOrders = orders.filter((order) => {
        const orderIdStr = order.orderNumber ? order.orderNumber.toLowerCase() : '';
        const orderMongoId = order._id ? order._id.toLowerCase() : '';
        const userName = order.user?.name ? order.user.name.toLowerCase() : '';
        const userEmail = order.user?.email ? order.user.email.toLowerCase() : '';
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = orderIdStr.includes(search) || orderMongoId.includes(search) || userName.includes(search) || userEmail.includes(search);
        
        // Payment Filter
        let matchesPay = true;
        if (payFilter === 'paid') matchesPay = order.isPaid;
        if (payFilter === 'unpaid') matchesPay = !order.isPaid;

        // Delivery Filter
        let matchesDeliver = true;
        if (deliverFilter === 'delivered') matchesDeliver = order.isDelivered;
        if (deliverFilter === 'pending') matchesDeliver = !order.isDelivered;

        return matchesSearch && matchesPay && matchesDeliver;
    });

    // Pagination Logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrdersList = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Toggle Single Row Selection
    const handleSelectOrder = (id) => {
        setSelectedOrderIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Toggle Select All Visible Orders on Current Page
    const handleSelectAllCurrentPage = () => {
        const currentIds = currentOrdersList.map(o => o._id);
        const allSelected = currentIds.length > 0 && currentIds.every(id => selectedOrderIds.includes(id));
        if (allSelected) {
            setSelectedOrderIds(prev => prev.filter(id => !currentIds.includes(id)));
        } else {
            setSelectedOrderIds(prev => [...new Set([...prev, ...currentIds])]);
        }
    };

    // Summary Statistics
    const totalOrdersCount = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);
    const totalPendingDelivery = orders.filter(o => !o.isDelivered).length;
    const totalUnpaid = orders.filter(o => !o.isPaid).length;

    return (
        <div className="fade-in pb-8">
            {/* Custom Toast Notification */}
            {toast.visible && (
                <div className="admin-toast" style={{ borderColor: toast.type === 'error' ? '#ef4444' : '#10b981' }}>
                    {toast.type === 'error' ? <AlertCircle size={20} color="#ef4444" /> : <CheckCircle size={20} color="#10b981" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingBag size={24} color="var(--accent-color)" /> Orders Management
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Manage, filter, fulfill, download invoices, and delete customer orders.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                        type="button"
                        onClick={() => exportOrdersToCSV(orders, 'shahi_store_all_orders')}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                        title="Download ALL orders from entire database into Excel/CSV"
                    >
                        <Download size={15} /> Export All Orders ({orders.length})
                    </button>
                    {filteredOrders.length !== orders.length && (
                        <button 
                            type="button"
                            onClick={() => exportOrdersToCSV(filteredOrders, 'shahi_store_filtered_orders')}
                            className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
                            title="Download only currently filtered search orders"
                        >
                            <Download size={14} /> Export Filtered ({filteredOrders.length})
                        </button>
                    )}
                    <button 
                        onClick={fetchOrders} 
                        className="btn-secondary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}
                        title="Refresh Orders"
                    >
                        <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="order-stats-container">
                <div className="order-stat-card glass">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)' }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Orders</div>
                        <div className="stat-value">{totalOrdersCount}</div>
                    </div>
                </div>

                <div className="order-stat-card glass">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Banknote size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Paid Revenue</div>
                        <div className="stat-value">{currency}{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div className="order-stat-card glass">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Pending Delivery</div>
                        <div className="stat-value">{totalPendingDelivery}</div>
                    </div>
                </div>

                <div className="order-stat-card glass">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Unpaid Orders</div>
                        <div className="stat-value">{totalUnpaid}</div>
                    </div>
                </div>
            </div>

            {/* Sticky Bulk Selection Toolbar */}
            {selectedOrderIds.length > 0 && (
                <div className="bulk-actions-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="badge badge-info" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            {selectedOrderIds.length} Order(s) Selected
                        </span>
                        <button 
                            type="button" 
                            onClick={() => setSelectedOrderIds([])}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                            Deselect All
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => {
                                const selectedOrders = orders.filter(o => selectedOrderIds.includes(o._id));
                                exportOrdersToCSV(selectedOrders, `selected_${selectedOrders.length}_orders`);
                            }}
                            className="btn-secondary"
                            style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            title="Export Selected Orders to CSV"
                        >
                            <Download size={14} /> Export Selected ({selectedOrderIds.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => openDeleteModal(null)}
                            style={{ 
                                background: '#ef4444', 
                                color: '#ffffff', 
                                border: 'none', 
                                padding: '8px 18px', 
                                borderRadius: '8px', 
                                fontWeight: '600', 
                                fontSize: '13px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            <Trash2 size={15} /> Delete Selected ({selectedOrderIds.length})
                        </button>
                    </div>
                </div>
            )}

            {/* Search & Filter Controls */}
            <div className="order-controls glass" style={{ padding: '16px 20px', marginBottom: '24px' }}>
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by Order ID, Customer Name, or Email..." 
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
                                <th style={{ width: '40px', textAlign: 'center' }}>
                                    <input 
                                        type="checkbox"
                                        checked={currentOrdersList.length > 0 && currentOrdersList.every(o => selectedOrderIds.includes(o._id))}
                                        onChange={handleSelectAllCurrentPage}
                                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                                        title="Select all on this page"
                                    />
                                </th>
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
                                <tr key={order._id} style={{ background: selectedOrderIds.includes(order._id) ? 'rgba(99, 102, 241, 0.08)' : 'transparent' }}>
                                    <td style={{ textAlign: 'center' }}>
                                        <input 
                                            type="checkbox"
                                            checked={selectedOrderIds.includes(order._id)}
                                            onChange={() => handleSelectOrder(order._id)}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </td>
                                    <td style={{ fontWeight: 600, fontSize: '14px' }}>
                                        #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>
                                            {order.user ? order.user.name : (order.shippingAddress?.name || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Customer</span>)}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            {order.user?.email || ''}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{currency}{order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</td>
                                    <td>
                                        {order.isPaid ? (
                                            <span className="badge badge-success">
                                                <Check size={12} /> Paid
                                            </span>
                                        ) : (
                                            <span className="badge badge-danger">
                                                <X size={12} /> {order.paymentMethod === 'COD' ? 'COD (Unpaid)' : 'Unpaid'}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {order.isDelivered ? (
                                            <span className="badge badge-info">
                                                <Truck size={12} /> Delivered
                                            </span>
                                        ) : (
                                            <span className="badge badge-warning">
                                                <Clock size={12} /> {order.status || 'Pending'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => generateInvoice(order, settings)}
                                                className="btn-secondary" 
                                                style={{ padding: '7px 11px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                title="Print or Download Invoice"
                                            >
                                                <Printer size={13} /> Invoice
                                            </button>
                                            {!order.isPaid && (
                                                <button 
                                                    onClick={() => openConfirmModal(order, 'pay')}
                                                    className="btn-primary" 
                                                    style={{ padding: '7px 11px', fontSize: '12px' }}
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                            {order.isPaid && !order.isDelivered && (
                                                <button 
                                                    onClick={() => openConfirmModal(order, 'deliver')}
                                                    className="btn-primary" 
                                                    style={{ padding: '7px 11px', fontSize: '12px', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                                                >
                                                    Mark Delivered
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => openDetailsModal(order)}
                                                className="btn-secondary" 
                                                style={{ padding: '7px 11px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <Eye size={12} /> Details
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(order)}
                                                className="btn-secondary" 
                                                style={{ padding: '7px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                                title="Delete Order"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                                        No orders found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '20px 0 10px 0', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                            >
                                &larr; Prev
                            </button>
                            {[...Array(totalPages).keys()].map(x => (
                                <button 
                                    key={x + 1}
                                    onClick={() => handlePageChange(x + 1)}
                                    className={currentPage === x + 1 ? "btn-primary" : "btn-secondary"}
                                    style={{ 
                                        width: '32px', 
                                        height: '32px', 
                                        borderRadius: '6px', 
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
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
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
                            {actionType === 'pay' ? 'Confirm Payment Update' : 'Confirm Delivery Update'}
                        </h2>
                        <p className="modal-text">
                            Are you sure you want to mark Order <strong>#{selectedOrder.orderNumber || selectedOrder._id.substring(0, 8)}</strong> as 
                            <strong style={{ color: actionType === 'pay' ? '#10b981' : '#3b82f6' }}>
                                {actionType === 'pay' ? ' PAID' : ' DELIVERED'}
                            </strong>?
                        </p>
                        {errorUpdating && <div className="error-message" style={{ marginBottom: '16px' }}>{errorUpdating}</div>}
                        <div className="modal-actions">
                            <button 
                                onClick={() => setModalOpen(false)} 
                                className="btn-secondary"
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmUpdate} 
                                className="btn-primary"
                                style={{ backgroundColor: actionType === 'pay' ? 'var(--accent-color)' : '#3b82f6' }}
                                disabled={updating}
                            >
                                {updating ? 'Updating...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal (Single & Bulk) */}
            {deleteModalOpen && (
                <div className="admin-modal-overlay" style={{ zIndex: 1600 }}>
                    <div className="admin-modal" style={{ maxWidth: '460px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={22} />
                            </div>
                            <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>
                                {orderToDelete ? 'Delete Order' : `Delete ${selectedOrderIds.length} Orders?`}
                            </h2>
                        </div>
                        <p className="modal-text" style={{ color: 'var(--text-secondary)', marginBottom: '18px' }}>
                            {orderToDelete ? (
                                <>
                                    Kya aap Order <strong style={{ color: 'var(--text-primary)' }}>#{orderToDelete.orderNumber || orderToDelete._id.substring(0, 8).toUpperCase()}</strong> ko delete karna chahte hain?
                                </>
                            ) : (
                                <>
                                    Kya aap selected <strong style={{ color: 'var(--text-primary)' }}>{selectedOrderIds.length} orders</strong> ko permanently delete karna chahte hain?
                                </>
                            )}
                        </p>

                        {deleteError && (
                            <div className="error-message" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                                {deleteError}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button 
                                type="button"
                                onClick={() => setDeleteModalOpen(false)} 
                                className="btn-secondary"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={handleConfirmDelete} 
                                style={{
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '10px 22px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline Order Details & Status Update Modal */}
            {viewOrderDetails && (
                <div className="admin-modal-overlay" style={{ zIndex: 1500 }}>
                    <div className="admin-modal" style={{ maxWidth: '800px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
                        
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

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                            {/* Summary Block */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary</h3>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Order ID:</strong> #{viewOrderDetails.orderNumber || viewOrderDetails._id.substring(0, 8).toUpperCase()}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Date:</strong> {new Date(viewOrderDetails.createdAt).toLocaleString()}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Customer:</strong> {viewOrderDetails.user?.name || viewOrderDetails.shippingAddress?.name || 'Customer'}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {viewOrderDetails.user?.email || 'N/A'}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Payment:</strong> {viewOrderDetails.paymentMethod}</p>
                            </div>

                            {/* Shipping Block */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shipping Info</h3>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Address:</strong> {viewOrderDetails.shippingAddress?.address}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>City:</strong> {viewOrderDetails.shippingAddress?.city}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Postal Code:</strong> {viewOrderDetails.shippingAddress?.postalCode}</p>
                                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Phone:</strong> {viewOrderDetails.shippingAddress?.phone || 'N/A'}</p>
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
                                        {viewOrderDetails.orderItems?.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <img 
                                                        src={item.image && item.image.startsWith('http') ? item.image : `${window.API_BASE_URL}${item.image || '/images/sample.jpg'}`} 
                                                        alt={item.name} 
                                                        style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.src = '/images/sample.jpg'; }}
                                                    />
                                                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.qty}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{currency}{item.price?.toFixed(2)}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{currency}{(item.qty * item.price)?.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Order Totals & Change Status Control */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div>
                                <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Update Delivery Status</h3>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <select 
                                        value={selectedStatus} 
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="filter-select"
                                        style={{ minWidth: '160px', padding: '8px 12px' }}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <button 
                                        onClick={handleUpdateStatus} 
                                        className="btn-primary" 
                                        disabled={updatingStatus}
                                        style={{ padding: '8px 16px', fontSize: '13px' }}
                                    >
                                        {updatingStatus ? 'Saving...' : 'Save Status'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Items Subtotal: <strong>{currency}{(viewOrderDetails.itemsPrice || 0).toFixed(2)}</strong>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Shipping Fee: <strong>{currency}{(viewOrderDetails.shippingPrice || 0).toFixed(2)}</strong>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-color)', marginTop: '4px' }}>
                                    Grand Total: {currency}{(viewOrderDetails.totalPrice || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer with Delete Option */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    const order = viewOrderDetails;
                                    setViewOrderDetails(null);
                                    openDeleteModal(order);
                                }}
                                className="btn-secondary"
                                style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                            >
                                <Trash2 size={14} /> Delete Order
                            </button>
                            <button 
                                onClick={() => setViewOrderDetails(null)} 
                                className="btn-secondary"
                                style={{ padding: '8px 20px', fontSize: '13px' }}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList;
