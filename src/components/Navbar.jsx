import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, ShoppingBag, User, ChevronDown, X, Menu, Mail, Phone, Heart, ChevronRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useSettingsStore } from '../store/useSettingsStore';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { cartItems } = useCartStore();
    const { userInfo, logout } = useAuthStore();
    const { wishlistItems, clearWishlist } = useWishlistStore();
    const wishlistCount = wishlistItems.length;
    const { settings, getCurrencySymbol } = useSettingsStore();
    const currencySymbol = getCurrencySymbol();
    const brandName = settings?.websiteName || 'SuperMarket';
    const [categories, setCategories] = useState([]);

    const buildTree = (cats, parentId = null) => {
        return cats
            .filter(c => {
                const pId = c.parentCategory ? (typeof c.parentCategory === 'object' ? c.parentCategory._id : c.parentCategory) : null;
                return pId === parentId;
            })
            .map(c => ({
                ...c,
                children: buildTree(cats, c._id)
            }));
    };
    
    const categoryTree = buildTree(categories);

    // Search Popup states
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    // Mobile Menu state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

    // Dropdowns state
    const [showAccountDrop, setShowAccountDrop] = useState(false);
    const [showCartDrop, setShowCartDrop] = useState(false);
    const [showCategorySidebar, setShowCategorySidebar] = useState(false);
    const [showCurrencyDrop, setShowCurrencyDrop] = useState(false);
    const [forceCloseMegaMenu, setForceCloseMegaMenu] = useState(false);

    // Cart total display
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/categories`);
                const activeCategories = data.filter(c => c.isActive);
                setCategories(activeCategories);
            } catch (error) {
                console.error("Error fetching categories for navbar:", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products once search popup is opened
    useEffect(() => {
        if (isSearchOpen) {
            const fetchProducts = async () => {
                try {
                    const { data } = await axios.get(`${window.API_BASE_URL}/api/products`);
                    setAllProducts(data.filter(p => p.isActive !== false));
                } catch (error) {
                    console.error("Error fetching search products:", error);
                }
            };
            fetchProducts();
        }
    }, [isSearchOpen]);

    // Live search filtering
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
        } else {
            const filtered = allProducts.filter(product => {
                const matchesName = product.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = product.category && typeof product.category === 'object'
                    ? product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
                    : false;
                const matchesBrand = product.brand && typeof product.brand === 'object'
                    ? product.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
                    : false;
                return matchesName || matchesCategory || matchesBrand;
            });
            setSearchResults(filtered.slice(0, 5));
        }
    }, [searchQuery, allProducts]);

    const handleLogout = () => {
        logout();
        clearWishlist();
        setShowAccountDrop(false);
        navigate('/');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false);
            const query = searchQuery;
            setSearchQuery('');
            navigate(`/?search=${encodeURIComponent(query)}`);
        }
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleHeaderSearch = (e) => {
        e.preventDefault();
        const q = e.target.querySelector('input').value;
        if (q.trim()) navigate(`/?search=${encodeURIComponent(q)}`);
    };

    return (
        <>
            <header className="main-header sticky-header">
            {/* ====== TOP BAR ====== */}
            <div className="header-top-bar">
                <div className="container">
                    <div className="top-bar-left">
                        {settings?.contactDetails?.email && (
                            <span className="contact-info">
                                <Mail size={12} /> Email: <a href={`mailto:${settings.contactDetails.email}`} style={{color: 'inherit'}}>{settings.contactDetails.email}</a>
                            </span>
                        )}
                        {settings?.contactDetails?.phone && (
                            <span className="contact-info">
                                <Phone size={12} /> Hotline: <a href={`tel:${settings.contactDetails.phone}`} style={{color: 'inherit'}}>{settings.contactDetails.phone}</a>
                            </span>
                        )}
                    </div>
                    <div className="top-bar-right">
                        {/* Currency */}
                        <div className="top-link-item" style={{ cursor: 'default' }}>
                            {settings?.currency || 'USD'}
                        </div>

                        {/* Account */}
                        {userInfo ? (
                            <div className="top-link-item" onClick={() => setShowAccountDrop(!showAccountDrop)}>
                                <User size={12} /> {userInfo.name} <ChevronDown size={11} />
                                {showAccountDrop && (
                                    <ul className="top-dropdown">
                                        <li><Link to="/profile" onClick={() => setShowAccountDrop(false)}>My Account</Link></li>
                                        <li><Link to="/orders" onClick={() => setShowAccountDrop(false)}>My Orders</Link></li>
                                        {userInfo.isAdmin && (
                                            <li><Link to="/admin/dashboard" onClick={() => setShowAccountDrop(false)}>Admin Panel</Link></li>
                                        )}
                                        <li><a href="#" onClick={handleLogout}>Logout</a></li>
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <div className="top-link-item">
                                <Link to="/login">Login</Link> / <Link to="/register">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ====== HEADER MIDDLE ====== */}
            <div className="header-middle">
                <div className="container">
                    {/* Logo */}
                    <div className="header-logo">
                        <Link to="/">
                            {settings?.logo && settings.logo !== '/images/logo.png' && settings.logo !== '' ? (
                                <img
                                    src={settings.logo.startsWith('http') ? settings.logo : `${window.API_BASE_URL}${settings.logo}`}
                                    alt={brandName}
                                    style={{ maxHeight: '75px', width: 'auto', display: 'block', objectFit: 'contain' }}
                                    onError={(e) => {
                                        // If image fails to load, fallback to text logo
                                        e.target.style.display = 'none';
                                        e.target.insertAdjacentHTML('afterend', `<span>${brandName}</span>`);
                                    }}
                                />
                            ) : brandName.split(' ').length > 1 ? (
                                <>{brandName.split(' ')[0]}<span> {brandName.split(' ').slice(1).join(' ')}</span></>
                            ) : (
                                brandName
                            )}
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="header-search">
                        <form className="search-form" onSubmit={handleHeaderSearch}>
                            <select className="search-category-select">
                                <option value="">All Categories</option>
                                {categoryTree.map(cat => (
                                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search for products..."
                            />
                            <button type="submit" className="search-submit-btn">
                                <Search size={16} />
                                <span>Search</span>
                            </button>
                        </form>
                    </div>

                    {/* Cart + Account */}
                    <div className="header-cart-block">
                        {/* Wishlist Link */}
                        <Link 
                            to={userInfo ? "/wishlist" : "/login?redirect=wishlist"} 
                            className="wishlist-widget-btn" 
                            style={{ 
                                position: 'relative', 
                                display: 'flex', 
                                alignItems: 'center', 
                                color: 'var(--text-primary)', 
                                textDecoration: 'none', 
                                marginRight: '20px',
                                padding: '8px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                            title="My Wishlist"
                        >
                            <Heart size={20} strokeWidth={1.5} />
                            {wishlistCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: '#ef4444',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    lineHeight: '1'
                                }}>
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart Widget */}
                        <div className="cart-widget">
                            <button
                                className="cart-widget-btn"
                                onClick={() => setShowCartDrop(!showCartDrop)}
                            >
                                <div className="cart-icon-wrap">
                                    <ShoppingBag size={22} strokeWidth={1.5} />
                                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                </div>
                                <div className="cart-info">
                                    <span className="cart-label">My cart</span>
                                </div>
                            </button>
                            {showCartDrop && (
                                <div className="cart-dropdown">
                                    {cartItems.length === 0 ? (
                                        <p style={{ fontSize: 13, color: '#777', textAlign: 'center', padding: '15px 0' }}>
                                            Your cart is empty
                                        </p>
                                    ) : (
                                        <>
                                            {cartItems.slice(0, 3).map(item => (
                                                <div key={item._id} className="cart-dropdown-item">
                                                    <img
                                                        src={item.image?.startsWith('http') ? item.image : `${window.API_BASE_URL}${item.image}`}
                                                        alt={item.name}
                                                    />
                                                    <div className="cart-item-info">
                                                        <div className="cart-item-name">{item.name}</div>
                                                        <div className="cart-item-price">x{item.qty} — {currencySymbol}{(item.qty * item.price).toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="cart-dropdown-footer">
                                                <Link to="/cart" className="cart-view-btn" onClick={() => setShowCartDrop(false)}>
                                                    View Cart
                                                </Link>
                                                <Link to="/checkout" className="cart-checkout-btn" onClick={() => setShowCartDrop(false)}>
                                                    Checkout
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Account */}
                        <div className="header-account-links" style={{ display: 'none' }}>
                            {userInfo ? (
                                <><span>Welcome, {userInfo.name}</span><Link to="/profile">My Account</Link></>
                            ) : (
                                <><span>My Account</span><><Link to="/login">Login</Link> / <Link to="/register">Register</Link></></>
                            )}
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            className="menu-toggle-btn"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ====== HEADER BOTTOM — Main Nav ====== */}
            <div className="header-bottom">
                <div className="container">
                    {/* All Categories */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="all-categories-btn"
                            onClick={() => setShowCategorySidebar(!showCategorySidebar)}
                        >
                            <Menu size={16} />
                            All Categories
                            <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                        </button>

                        {showCategorySidebar && (
                            <div className="categories-sidebar">
                                {categoryTree.length > 0 ? categoryTree.map(parent => (
                                    <div key={parent._id} className="cat-sidebar-item">
                                        <Link to={`/category/${parent.slug}`} onClick={() => setShowCategorySidebar(false)}>
                                            {parent.name}
                                        </Link>
                                        {parent.children && parent.children.length > 0 && (
                                            <div className="cat-sidebar-submenu">
                                                {parent.children.map(child => (
                                                    <div key={child._id} className="submenu-col">
                                                        <Link to={`/category/${child.slug}`} className="submenu-col-title" onClick={() => setShowCategorySidebar(false)}>
                                                            {child.name}
                                                        </Link>
                                                        {child.children && child.children.length > 0 && (
                                                            <ul>
                                                                {child.children.map(grandchild => (
                                                                    <li key={grandchild._id}>
                                                                        <Link to={`/category/${grandchild.slug}`} onClick={() => setShowCategorySidebar(false)}>
                                                                            {grandchild.name}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <>
                                        {[
                                            { name: 'Aromatic Candles', subs: ['Jar Candles', 'Urlis/terracotta jar candles', 'Glass jar candles', 'Concrete jar candles'] },
                                            { name: 'Resin art products', subs: ['Pillar Candles', 'Candle Bouquet', 'Designer/Sculpted candles'] },
                                            { name: 'Festive collection', subs: [] },
                                            { name: 'Home Decor', subs: [] }
                                        ].map(cat => (
                                            <div key={cat.name} className="cat-sidebar-item">
                                                <a href="#">{cat.name}</a>
                                                {cat.subs.length > 0 && (
                                                    <div className="cat-sidebar-submenu">
                                                        <div className="submenu-col">
                                                            <ul>
                                                                {cat.subs.map(sub => <li key={sub}><a href="#" className="submenu-col-title">{sub}</a></li>)}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Horizontal Nav */}
                    <nav className="main-nav">
                        <div className="nav-item">
                            <Link to="/">Home</Link>
                        </div>
                        <div className="nav-item">
                            <Link to="/shop">Shop</Link>
                        </div>

                        {/* Categories Mega Dropdown */}
                        <div 
                            className="nav-item"
                            onMouseEnter={() => forceCloseMegaMenu && setForceCloseMegaMenu(false)}
                            onMouseLeave={() => setForceCloseMegaMenu(false)}
                        >
                            <span>
                                Categories <ChevronDown size={12} />
                            </span>
                            <div 
                                className={`mega-dropdown ${forceCloseMegaMenu ? 'force-hide' : ''}`}
                                onClick={(e) => {
                                    // Only close if it's a link click
                                    if (e.target.closest('a')) {
                                        setForceCloseMegaMenu(true);
                                    }
                                }}
                            >
                                {categoryTree.length > 0 ? categoryTree.map(parent => {
                                    const renderNestedLinks = (nodes, level = 0) => {
                                        let items = [];
                                        nodes.forEach(cat => {
                                            items.push(
                                                <li key={cat._id} style={{ paddingLeft: `${level * 12}px` }}>
                                                    <Link to={`/category/${cat.slug}`} style={{ display: 'flex', alignItems: 'center' }}>
                                                        {level > 0 && <ChevronRight size={14} style={{ marginRight: '4px', color: '#888' }} />}
                                                        {cat.name}
                                                    </Link>
                                                </li>
                                            );
                                            if (cat.children && cat.children.length > 0) {
                                                items = [...items, ...renderNestedLinks(cat.children, level + 1)];
                                            }
                                        });
                                        return items;
                                    };

                                    return (
                                        <div key={parent._id} className="mega-col">
                                            <Link to={`/category/${parent.slug}`} className="mega-col-title">
                                                {parent.name}
                                            </Link>
                                            <ul>
                                                {renderNestedLinks(parent.children)}
                                            </ul>
                                        </div>
                                    );
                                }) : (
                                    <>
                                        {[
                                            { name: 'Electronics', subs: ['Smartphones', 'Laptops', 'Tablets', 'Cameras'] },
                                            { name: 'Fashion', subs: ['Men\'s Wear', 'Women\'s Wear', 'Footwear', 'Accessories'] },
                                            { name: 'Home & Garden', subs: ['Furniture', 'Decor', 'Kitchen', 'Bedroom'] },
                                        ].map(cat => (
                                            <div key={cat.name} className="mega-col">
                                                <a href="#" className="mega-col-title">{cat.name}</a>
                                                <ul>
                                                    {cat.subs.map(sub => <li key={sub}><a href="#">{sub}</a></li>)}
                                                </ul>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="nav-item">
                            <Link to="/blog">Blog</Link>
                        </div>
                        <div className="nav-item">
                            <Link to="/about">About</Link>
                        </div>
                        <div className="nav-item">
                            <Link to="/contact">Contact</Link>
                        </div>

                        {/* Special nav right items */}
                        <div className="nav-item nav-right">
                            <span onClick={() => setIsSearchOpen(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', height: '44px', padding: '0 14px' }}>
                                <Search size={16} color="#fff" />
                            </span>
                        </div>
                    </nav>
                </div>
            </div>
            </header>

            {/* ====== SEARCH POPUP ====== */}
            {isSearchOpen && (
                <div className="search-overlay" onClick={closeSearch}>
                    <div className="search-popup-card" onClick={(e) => e.stopPropagation()}>
                        <div className="search-popup-header">
                            <h3>Search Products</h3>
                            <button className="close-search-btn" onClick={closeSearch}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSearchSubmit} className="search-popup-form">
                            <input
                                type="text"
                                className="search-popup-input"
                                placeholder="Type to search e.g. electronics, dress, bag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="search-popup-submit-btn">
                                <Search size={18} />
                            </button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="search-live-results">
                                <h4>Suggestions</h4>
                                <div className="search-results-list">
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product._id}
                                            to={`/product/${product._id}`}
                                            className="search-result-item"
                                            onClick={closeSearch}
                                        >
                                            <img
                                                src={product.image?.startsWith('http') ? product.image : `${window.API_BASE_URL}${product.image}`}
                                                alt={product.name}
                                                className="search-result-img"
                                            />
                                            <div className="search-result-info">
                                                <span className="search-result-name">{product.name}</span>
                                                <span className="search-result-category">
                                                    {product.category && typeof product.category === 'object' ? product.category.name : ''}
                                                </span>
                                            </div>
                                            <span className="search-result-price">{currencySymbol}{product.price}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {searchQuery && searchResults.length === 0 && (
                            <div className="search-no-results">
                                No suggestions found. Press Enter to search catalog.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ====== MOBILE MENU DRAWER ====== */}
            <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className="mobile-menu-content">
                    <div className="mobile-menu-header">
                        <span className="mobile-menu-title" style={{ display: 'flex', alignItems: 'center' }}>
                            {settings?.logo && settings.logo !== '/images/logo.png' && settings.logo !== '' ? (
                                <img
                                    src={settings.logo.startsWith('http') ? settings.logo : `${window.API_BASE_URL}${settings.logo}`}
                                    alt={brandName}
                                    style={{ maxHeight: '35px', width: 'auto', display: 'block', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.insertAdjacentHTML('afterend', `<span>${brandName}</span>`);
                                    }}
                                />
                            ) : (
                                brandName
                            )}
                        </span>
                        <button className="close-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>
                            <X size={22} />
                        </button>
                    </div>

                    <nav className="mobile-nav-links">
                        <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                        <Link to="/shop" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>

                        <div className="mobile-categories-collapse">
                            <button
                                className="mobile-nav-link collapser"
                                onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                            >
                                Categories {isMobileCategoriesOpen ? <ChevronDown size={16} style={{ transform: 'rotate(180deg)' }} /> : <ChevronDown size={16} />}
                            </button>

                            {isMobileCategoriesOpen && (
                                <div className="mobile-categories-list">
                                    {(() => {
                                        const renderMobileTree = (nodes, level = 0) => {
                                            let items = [];
                                            nodes.forEach(cat => {
                                                items.push(
                                                    <Link 
                                                        key={cat._id}
                                                        to={`/category/${cat.slug}`} 
                                                        className={level === 0 ? "mobile-parent-link" : "mobile-sub-link"} 
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        style={level > 0 ? { paddingLeft: `${level * 16 + 15}px`, display: 'flex', alignItems: 'center' } : { display: 'flex', alignItems: 'center' }}
                                                    >
                                                        {level > 0 && <ChevronRight size={14} style={{ marginRight: '6px', color: '#888' }} />}
                                                        {cat.name}
                                                    </Link>
                                                );
                                                if (cat.children && cat.children.length > 0) {
                                                    items = [...items, ...renderMobileTree(cat.children, level + 1)];
                                                }
                                            });
                                            return items;
                                        };
                                        return renderMobileTree(categoryTree);
                                    })()}
                                </div>
                            )}
                        </div>

                        <Link to="/blog" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                        <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                        <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                        
                        {userInfo ? (
                            <>
                                <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
                                <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
                                {userInfo.isAdmin && (
                                    <Link to="/admin/dashboard" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
                                )}
                                <button className="mobile-nav-link" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                <Link to="/register" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                            </>
                        )}

                        <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Cart {cartCount > 0 && <span style={{ background: '#f28b00', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{cartCount}</span>}
                        </Link>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Navbar;
