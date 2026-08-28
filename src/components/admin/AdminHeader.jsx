import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, User, CheckCheck, Trash2, ArrowRight, Shield } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import './AdminHeader.css';

// Helper function to format relative time
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

const AdminHeader = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const { userInfo } = useAuthStore();
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification 
    } = useNotificationStore();

    // Initial fetch & Polling every 20 seconds
    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            fetchNotifications();

            const interval = setInterval(() => {
                fetchNotifications();
            }, 20000); // 20s

            return () => clearInterval(interval);
        }
    }, [userInfo, fetchNotifications]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif._id);
        }
        setIsOpen(false);
        if (notif.link) {
            navigate(notif.link);
        } else if (notif.type === 'new_order') {
            navigate('/admin/orderlist');
        } else if (notif.type === 'new_user') {
            navigate('/admin/userlist');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_order':
                return (
                    <div className="admin-notif-icon order">
                        <ShoppingBag size={18} />
                    </div>
                );
            case 'new_user':
                return (
                    <div className="admin-notif-icon user">
                        <User size={18} />
                    </div>
                );
            default:
                return (
                    <div className="admin-notif-icon default">
                        <Bell size={18} />
                    </div>
                );
        }
    };

    return (
        <header className="admin-top-header">
            <div className="admin-header-title">
                <h2>Admin Control Center</h2>
                <span className="admin-header-badge">
                    <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Live
                </span>
            </div>

            <div className="admin-header-actions" ref={dropdownRef}>
                {/* Notification Bell Button */}
                <button
                    type="button"
                    className="admin-notif-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    title="Notifications"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="admin-notif-badge">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Notifications Dropdown Panel */}
                {isOpen && (
                    <div className="admin-notif-dropdown">
                        <div className="admin-notif-dropdown-header">
                            <div className="admin-notif-dropdown-title">
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="admin-notif-pill">{unreadCount} new</span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    className="admin-notif-mark-read"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markAllAsRead();
                                    }}
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="admin-notif-list">
                            {notifications && notifications.length > 0 ? (
                                notifications.slice(0, 10).map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`admin-notif-item ${!notif.isRead ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        {getIcon(notif.type)}
                                        <div className="admin-notif-content">
                                            <div className="admin-notif-item-title">
                                                <span>{notif.title}</span>
                                                {!notif.isRead && <span className="admin-notif-dot"></span>}
                                            </div>
                                            <div className="admin-notif-item-msg">
                                                {notif.message}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className="admin-notif-item-time">
                                                    {formatTimeAgo(notif.createdAt)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notif._id);
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'rgba(255, 255, 255, 0.3)',
                                                        cursor: 'pointer',
                                                        padding: '2px 4px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="admin-notif-empty">
                                    <Bell size={28} style={{ opacity: 0.3 }} />
                                    <span>No notifications right now</span>
                                </div>
                            )}
                        </div>

                        <div className="admin-notif-dropdown-footer">
                            <Link 
                                to="/admin/notifications" 
                                className="admin-notif-view-all"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Admin Profile Chip */}
                <div className="admin-header-profile">
                    <div className="admin-profile-avatar">
                        {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="admin-profile-info">
                        <span className="admin-profile-name">{userInfo?.name || 'Administrator'}</span>
                        <span className="admin-profile-role">Super Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
