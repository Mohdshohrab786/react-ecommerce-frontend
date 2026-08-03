import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, Tag, Image as ImageIcon, CreditCard, FileText, Globe, LogOut, Mail } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useSettingsStore();
    const { logout } = useAuthStore();
    const brandName = settings?.websiteName || 'SuperMarket';

    const logoutHandler = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Orders', path: '/admin/orderlist', icon: <ShoppingBag size={20} /> },
        { name: 'Products', path: '/admin/productlist', icon: <Package size={20} /> },
        { name: 'Categories', path: '/admin/categories', icon: <Tag size={20} /> },
        { name: 'Brands', path: '/admin/brands', icon: <Tag size={20} /> },
        { name: 'Banners', path: '/admin/banners', icon: <ImageIcon size={20} /> },
        { name: 'Blogs', path: '/admin/bloglist', icon: <FileText size={20} /> },
        { name: 'Payments', path: '/admin/payments', icon: <CreditCard size={20} /> },
        { name: 'Coupons', path: '/admin/coupons', icon: <Tag size={20} /> },
        { name: 'Users', path: '/admin/userlist', icon: <Users size={20} /> },
        { name: 'Website Settings', path: '/admin/settings', icon: <Settings size={20} /> },
        { name: 'Payment Settings', path: '/admin/payment-settings', icon: <Settings size={20} /> },
        { name: 'Shipping Settings', path: '/admin/shipping-settings', icon: <Package size={20} /> },
        { name: 'Newsletter', path: '/admin/newsletter', icon: <Mail size={20} /> },
    ];

    return (
        <aside style={{
            width: '260px',
            background: 'var(--glass-bg)',
            borderRight: '1px solid var(--border-color)',
            height: '100vh',
            position: 'sticky',
            top: '0px',
            overflowY: 'auto',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            {/* Admin Brand Logo/Name */}
            <div className="admin-logo-container" style={{ padding: '0 12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <Link to="/admin/dashboard" style={{ textDecoration: 'none', display: 'block' }}>
                    {settings?.logo && settings.logo !== '/images/logo.png' && settings.logo !== '' ? (
                        <img 
                            src={settings.logo.startsWith('http') ? settings.logo : `${window.API_BASE_URL}${settings.logo}`} 
                            alt={brandName} 
                            style={{ maxHeight: '35px', maxWidth: '100%', objectFit: 'contain', display: 'block' }} 
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.insertAdjacentHTML('afterend', `<span style="font-size: 18px; font-weight: bold; color: #fff; text-transform: uppercase; letter-spacing: 1px;">${brandName}</span>`);
                            }}
                        />
                    ) : (
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {brandName}
                        </span>
                    )}
                </Link>
            </div>

            <div style={{ marginBottom: '8px', paddingLeft: '12px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Admin Menu
            </div>
            
            {menuItems.map((item) => {
                const isActive = location.pathname.includes(item.path);
                return (
                    <Link
                        key={item.name}
                        to={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            color: isActive ? '#fff' : 'var(--text-primary)',
                            background: isActive ? 'var(--accent-color)' : 'transparent',
                            textDecoration: 'none',
                            fontWeight: isActive ? '600' : '500',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {item.icon}
                        {item.name}
                    </Link>
                );
            })}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0' }} />

            <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    background: 'transparent',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    marginTop: 'auto'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                <Globe size={20} />
                View Website
            </a>
            
            <button
                onClick={logoutHandler}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: '#ef4444',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                <LogOut size={20} />
                Logout
            </button>
        </aside>
    );
};

export default AdminSidebar;
