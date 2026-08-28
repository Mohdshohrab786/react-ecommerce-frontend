import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Bell, 
    ShoppingBag, 
    User, 
    CheckCheck, 
    Trash2, 
    RefreshCw, 
    ExternalLink, 
    Check, 
    Search,
    Clock,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import './Admin.css';

const formatFullDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return past.toLocaleDateString();
};

const NotificationList = () => {
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const { 
        notifications, 
        unreadCount, 
        totalCount, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        clearAll 
    } = useNotificationStore();

    const [activeTab, setActiveTab] = useState('all'); // 'all', 'new_order', 'new_user', 'unread'
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            fetchNotifications();
        }
    }, [userInfo, fetchNotifications]);

    // Reset pagination to page 1 on filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm, itemsPerPage]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchNotifications();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to delete all notifications? This cannot be undone.')) {
            await clearAll();
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notif => {
        // Tab Filter
        if (activeTab === 'unread' && notif.isRead) return false;
        if (activeTab === 'new_order' && notif.type !== 'new_order') return false;
        if (activeTab === 'new_user' && notif.type !== 'new_user') return false;

        // Search Filter
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            const titleMatch = notif.title?.toLowerCase().includes(term);
            const msgMatch = notif.message?.toLowerCase().includes(term);
            const userMatch = notif.user?.name?.toLowerCase().includes(term) || notif.user?.email?.toLowerCase().includes(term);
            const orderNumberMatch = notif.meta?.orderNumber?.toLowerCase().includes(term);
            return titleMatch || msgMatch || userMatch || orderNumberMatch;
        }

        return true;
    });

    const orderCount = notifications.filter(n => n.type === 'new_order').length;
    const userCount = notifications.filter(n => n.type === 'new_user').length;

    // Pagination calculation
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentNotifications = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Generate smart page numbers (e.g., [1, 2, 3, 4, 5])
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_order':
                return (
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <ShoppingBag size={22} />
                    </div>
                );
            case 'new_user':
                return (
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <User size={22} />
                    </div>
                );
            default:
                return (
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: '#a78bfa',
                        border: '1px solid rgba(139, 92, 246, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Bell size={22} />
                    </div>
                );
        }
    };

    return (
        <div className="fade-in">
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="section-title" style={{ margin: '0 0 6px 0' }}>Notifications Center</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
                        Real-time alerts for new orders, user registrations, and system updates
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleRefresh}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                        title="Refresh notifications"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
                        Refresh
                    </button>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={markAllAsRead}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            <CheckCheck size={16} />
                            Mark All As Read
                        </button>
                    )}

                    {notifications.length > 0 && (
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleClearAll}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            title="Clear all notifications"
                        >
                            <Trash2 size={16} />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <div 
                    className="glass" 
                    onClick={() => setActiveTab('all')}
                    style={{ 
                        padding: '18px 20px', 
                        borderRadius: '14px', 
                        cursor: 'pointer',
                        border: activeTab === 'all' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Total Alerts</span>
                        <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '26px' }}>{totalCount || notifications.length}</h2>
                </div>

                <div 
                    className="glass" 
                    onClick={() => setActiveTab('unread')}
                    style={{ 
                        padding: '18px 20px', 
                        borderRadius: '14px', 
                        cursor: 'pointer',
                        border: activeTab === 'unread' ? '1px solid #ef4444' : '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#f87171', fontSize: '13px', fontWeight: '500' }}>Unread</span>
                        <span style={{ 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '50%', 
                            background: '#ef4444',
                            display: 'inline-block' 
                        }}></span>
                    </div>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '26px', color: '#f87171' }}>{unreadCount}</h2>
                </div>

                <div 
                    className="glass" 
                    onClick={() => setActiveTab('new_order')}
                    style={{ 
                        padding: '18px 20px', 
                        borderRadius: '14px', 
                        cursor: 'pointer',
                        border: activeTab === 'new_order' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '500' }}>New Orders</span>
                        <ShoppingBag size={18} style={{ color: '#60a5fa' }} />
                    </div>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '26px', color: '#60a5fa' }}>{orderCount}</h2>
                </div>

                <div 
                    className="glass" 
                    onClick={() => setActiveTab('new_user')}
                    style={{ 
                        padding: '18px 20px', 
                        borderRadius: '14px', 
                        cursor: 'pointer',
                        border: activeTab === 'new_user' ? '1px solid #10b981' : '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#34d399', fontSize: '13px', fontWeight: '500' }}>New Users</span>
                        <User size={18} style={{ color: '#34d399' }} />
                    </div>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '26px', color: '#34d399' }}>{userCount}</h2>
                </div>
            </div>

            {/* Filter Bar, Search & Per Page */}
            <div className="glass" style={{ padding: '16px 20px', borderRadius: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'unread', label: `Unread (${unreadCount})` },
                        { id: 'new_order', label: `Orders (${orderCount})` },
                        { id: 'new_user', label: `Users (${userCount})` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: activeTab === tab.id ? 'var(--accent-color)' : 'var(--border-color)',
                                background: activeTab === tab.id ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.03)',
                                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                                fontWeight: activeTab === tab.id ? '600' : '500',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Items per page selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Show:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="input-field"
                            style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px' }}
                        >
                            <option value={5}>5 / page</option>
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                            <option value={50}>50 / page</option>
                        </select>
                    </div>

                    <div style={{ position: 'relative', minWidth: '240px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentNotifications.length > 0 ? (
                    currentNotifications.map((notif) => (
                        <div
                            key={notif._id}
                            className="glass"
                            style={{
                                padding: '18px 22px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '18px',
                                borderLeft: !notif.isRead ? '4px solid var(--accent-color)' : '1px solid var(--border-color)',
                                background: !notif.isRead ? 'rgba(99, 102, 241, 0.06)' : 'var(--glass-bg)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                                {getIcon(notif.type)}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                            {notif.title}
                                        </h3>
                                        {!notif.isRead ? (
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                background: 'rgba(239, 68, 68, 0.15)',
                                                color: '#f87171',
                                                fontWeight: '600'
                                            }}>
                                                Unread
                                            </span>
                                        ) : (
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                color: 'var(--text-secondary)',
                                                fontWeight: '500'
                                            }}>
                                                Read
                                            </span>
                                        )}
                                    </div>

                                    <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                                        {notif.message}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} />
                                            {formatTimeAgo(notif.createdAt)}
                                        </span>
                                        <span>•</span>
                                        <span>{formatFullDate(notif.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                {notif.link && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => {
                                            if (!notif.isRead) markAsRead(notif._id);
                                            navigate(notif.link);
                                        }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        <ExternalLink size={13} />
                                        {notif.type === 'new_order' ? 'View Orders' : notif.type === 'new_user' ? 'View Users' : 'Open'}
                                    </button>
                                )}

                                {!notif.isRead && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => markAsRead(notif._id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer', color: '#10b981' }}
                                        title="Mark as Read"
                                    >
                                        <Check size={13} />
                                        Mark Read
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => deleteNotification(notif._id)}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.08)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        color: '#f87171',
                                        padding: '7px 10px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                                    title="Delete notification"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass" style={{ padding: '60px 20px', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <Bell size={28} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>No Notifications Found</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', maxWidth: '400px' }}>
                            {searchTerm ? `No notifications matching "${searchTerm}"` : 'All caught up! New orders and registered users will appear here automatically.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {filteredNotifications.length > 0 && (
                <div 
                    className="glass" 
                    style={{ 
                        marginTop: '24px', 
                        padding: '16px 24px', 
                        borderRadius: '14px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        flexWrap: 'wrap', 
                        gap: '16px' 
                    }}
                >
                    {/* Showing summary */}
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Showing <strong style={{ color: 'var(--text-primary)' }}>{indexOfFirstItem + 1}</strong> to{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{Math.min(indexOfLastItem, filteredNotifications.length)}</strong> of{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{filteredNotifications.length}</strong> alerts
                    </div>

                    {/* Pagination Buttons */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* First Page */}
                            <button
                                type="button"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '6px 8px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: currentPage === 1 ? 'rgba(255, 255, 255, 0.2)' : 'var(--text-primary)',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="First Page"
                            >
                                <ChevronsLeft size={16} />
                            </button>

                            {/* Previous Page */}
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: currentPage === 1 ? 'rgba(255, 255, 255, 0.2)' : 'var(--text-primary)',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>

                            {/* Numbered Page Buttons */}
                            {getPageNumbers().map(pageNum => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => handlePageChange(pageNum)}
                                    style={{
                                        minWidth: '34px',
                                        height: '34px',
                                        padding: '0 8px',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        borderColor: currentPage === pageNum ? 'var(--accent-color)' : 'var(--border-color)',
                                        background: currentPage === pageNum ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.03)',
                                        color: currentPage === pageNum ? '#ffffff' : 'var(--text-primary)',
                                        fontWeight: currentPage === pageNum ? '700' : '500',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            {/* Next Page */}
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: currentPage === totalPages ? 'rgba(255, 255, 255, 0.2)' : 'var(--text-primary)',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>

                            {/* Last Page */}
                            <button
                                type="button"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '6px 8px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: currentPage === totalPages ? 'rgba(255, 255, 255, 0.2)' : 'var(--text-primary)',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Last Page"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationList;
