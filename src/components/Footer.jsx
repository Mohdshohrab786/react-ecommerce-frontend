import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import {
    MapPin, Phone, Mail, Clock, ArrowUp,
    Send, ChevronRight, ShoppingBag, Shield, Truck, Headphones
} from 'lucide-react';
import './Footer.css';

/* ── Custom Social SVGs (lucide-react v1.x has no social icons) ── */
const FbIcon = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);
const TwIcon = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);
const IgIcon = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);
const YtIcon = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#111" />
    </svg>
);
const LiIcon = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const Footer = () => {
    const navigate = useNavigate();
    const { settings, getCurrencySymbol } = useSettingsStore(state => state);
    const { userInfo, logout } = useAuthStore();

    const brandName   = settings?.websiteName  || 'SuperMarket';
    const socialLinks = settings?.socialLinks  || {};
    const contactDetails = settings?.contactDetails || {};

    /* pull contact details from settings.contactDetails, else show empty */
    const address = contactDetails.address || '';
    const phone   = contactDetails.phone   || '';
    const email   = contactDetails.email   || '';
    const hours   = contactDetails.hours   || '';

    const [newsEmail, setNewsEmail]   = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [categories, setCategories] = useState([]);

    /* fetch parent categories from API */
    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await axios.get(
                    `${window.API_BASE_URL}/api/categories`
                );
                setCategories(
                    data.filter(c => c.isActive !== false && !c.parentCategory)
                );
            } catch { /* silent */ }
        };
        load();
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (newsEmail.trim()) {
            setSubscribed(true);
            setNewsEmail('');
            setTimeout(() => setSubscribed(false), 4000);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    /* ── Quick Links — all real routes ── */
    const quickLinks = [
        { to: '/',        label: 'Home' },
        { to: '/about',   label: 'About Us' },
        { to: '/blog',    label: 'Blog' },
        { to: '/contact', label: 'Contact Us' },
        { to: '/cart',    label: 'My Cart' },
    ];

    /* ── My Account links — depend on login state ── */
    const accountLinks = userInfo
        ? [
            { to: '/profile',  label: 'My Profile' },
            { to: '/profile',  label: 'My Orders' },
            { to: '/cart',     label: 'My Cart' },
            ...(userInfo.isAdmin ? [
                { to: '/admin/dashboard',   label: 'Admin Dashboard' },
                { to: '/admin/productlist', label: 'Manage Products' },
                { to: '/admin/orderlist',   label: 'Manage Orders' },
            ] : []),
          ]
        : [
            { to: '/login',    label: 'Sign In' },
            { to: '/register', label: 'Create Account' },
            { to: '/cart',     label: 'My Cart' },
            { to: '/contact',  label: 'Customer Support' },
          ];

    /* ── Social links ── */
    const socials = [
        { href: socialLinks.facebook  || '#', icon: <FbIcon />, label: 'Facebook',  cls: 'fb' },
        { href: socialLinks.twitter   || '#', icon: <TwIcon />, label: 'Twitter',   cls: 'tw' },
        { href: socialLinks.instagram || '#', icon: <IgIcon />, label: 'Instagram', cls: 'ig' },
        { href: socialLinks.youtube   || '#', icon: <YtIcon />, label: 'YouTube',   cls: 'yt' },
        { href: '#',                          icon: <LiIcon />, label: 'LinkedIn',  cls: 'li' },
    ];

    return (
        <footer className="footer-modern">

            {/* ── TRUST BAR ── */}
            <div className="footer-trust-bar">
                <div className="container">
                    <div className="trust-items">
                        {[
                            { icon: <Truck size={20} />,       title: 'Free Shipping',  sub: `On orders over ${getCurrencySymbol()}99` },
                            { icon: <Shield size={20} />,      title: 'Secure Payment', sub: '100% protected' },
                            { icon: <Headphones size={20} />,  title: '24/7 Support',   sub: 'We\'re always here' },
                            { icon: <ShoppingBag size={20} />, title: 'Easy Returns',   sub: '30-day policy' },
                        ].map((item, i) => (
                            <div key={i} className="trust-item">
                                <div className="trust-icon">{item.icon}</div>
                                <div>
                                    <div className="trust-title">{item.title}</div>
                                    <div className="trust-sub">{item.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MAIN BODY ── */}
            <div className="footer-body">
                <div className="container">
                    <div className="footer-grid">

                        {/* ── Col 1: Brand + Contact ── */}
                        <div className="footer-col col-brand">
                            <Link to="/" className="footer-brand-logo" style={{ display: 'flex', alignItems: 'center' }}>
                                {settings?.logo && settings.logo !== '/images/logo.png' && settings.logo !== '' ? (
                                    <img
                                        src={settings.logo.startsWith('http') ? settings.logo : `${window.API_BASE_URL}${settings.logo}`}
                                        alt={brandName}
                                        style={{ maxHeight: '50px', width: 'auto', display: 'block', objectFit: 'contain' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.insertAdjacentHTML('afterend', `<span>${brandName}</span>`);
                                        }}
                                    />
                                ) : (
                                    brandName
                                )}
                            </Link>
                            <p className="footer-brand-desc">
                                Your one-stop destination for electronics, fashion, home essentials and more.
                                Shop smarter, live better.
                            </p>

                            <div className="footer-socials">
                                {socials.map(s => (
                                    <a key={s.cls} href={s.href} target="_blank" rel="noreferrer"
                                        className={`social-icon-btn ${s.cls}`} title={s.label}>
                                        {s.icon}
                                    </a>
                                ))}
                            </div>

                            
                        </div>

                        {/* ── Col 2: Quick Links ── */}
                        <div className="footer-col">
                            <h4 className="footer-heading">Quick Links</h4>
                            <ul className="footer-nav-links">
                                {quickLinks.map(({ to, label }) => (
                                    <li key={label}>
                                        <Link to={to}>
                                            <ChevronRight size={12} />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ── Col 3: My Account ── */}
                        <div className="footer-col">
                            <h4 className="footer-heading">My Account</h4>
                            <ul className="footer-nav-links">
                                {accountLinks.map(({ to, label }) => (
                                    <li key={label}>
                                        <Link to={to}>
                                            <ChevronRight size={12} />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                                {/* Logout button if logged in */}
                                {userInfo && (
                                    <li>
                                        <button className="footer-logout-btn" onClick={handleLogout}>
                                            <ChevronRight size={12} />
                                            Logout
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* ── Col 4: Categories (from API) ── */}
                        <div className="footer-col">
                            <h4 className="footer-heading">Categories</h4>
                            <ul className="footer-nav-links">
                                {categories.length > 0 ? (
                                    categories.slice(0, 8).map(cat => (
                                        <li key={cat._id}>
                                            <Link to={`/category/${cat.slug}`}>
                                                <ChevronRight size={12} />
                                                {cat.name}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    /* shimmer skeleton while loading */
                                    [1, 2, 3, 4, 5, 6].map(i => (
                                        <li key={i}>
                                            <span className="footer-skeleton-link" />
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        {/* ── Col 5: Address ── */}
                        <div className="footer-col col-newsletter">
                            <h4 className="footer-heading">Address</h4>
                            {address && (
                                <p className="newsletter-desc" style={{ marginBottom: '10px', color: '#fff' }}>
                                    {address}
                                </p>
                            )}
                            {phone && (
                                <p className="newsletter-desc" style={{ marginBottom: '10px', color: '#fff' }}>
                                    {phone}
                                </p>
                            )}
                            {email && (
                                <p className="newsletter-desc" style={{ marginBottom: '10px', color: '#fff' }}>
                                    {email}
                                </p>
                            )}
                            {hours && (
                                <p className="newsletter-desc" style={{ color: '#fff' }}>
                                    {hours}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BOTTOM BAR ── */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-inner">
                        <p className="footer-copyright">
                            © {new Date().getFullYear()} <span>{brandName}</span>. All Rights Reserved.
                        </p>
                        <div className="footer-bottom-links footer-payment-section" style={{ display: 'flex', alignItems: 'center' }}>
                            <p className="payment-label" style={{ margin: 0, marginRight: '15px' }}>We Accept</p>
                            <div className="payment-methods" style={{ display: 'flex', gap: '8px' }}>
                                {['VISA', 'MasterCard', 'PayPal', 'AmEx', 'Stripe'].map(m => (
                                    <span key={m} className="payment-chip">{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BACK TO TOP ── */}
            <button className="back-to-top-btn" onClick={scrollToTop} title="Back to top">
                <ArrowUp size={18} />
            </button>
        </footer>
    );
};

export default Footer;
