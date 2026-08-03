import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import CategoryList from '../components/CategoryList';
import { Truck, RefreshCw, Shield, Headphones, Lock, Flame, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useWishlistStore } from '../store/useWishlistStore';
import './HomePage.css';

// Mock products fallback with electronics/fashion mix
const MOCK_PRODUCTS = [
    { _id: 'p1', name: 'Smart LED TV 55"', price: 499, comparePrice: 649, image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=600&auto=format&fit=crop', isFeatured: true, isTrending: true, rating: 4.5, numReviews: 22, createdAt: '2026-07-10T00:00:00Z' },
    { _id: 'p2', name: 'Wireless Noise-Cancelling Headphones', price: 129, comparePrice: 179, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop', isFeatured: true, isTrending: false, rating: 4, numReviews: 15, createdAt: '2026-07-09T00:00:00Z' },
    { _id: 'p3', name: 'Running Sneakers Pro', price: 89, comparePrice: 120, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', isFeatured: false, isTrending: true, rating: 5, numReviews: 30, createdAt: '2026-07-08T00:00:00Z' },
    { _id: 'p4', name: 'Leather Crossbody Handbag', price: 75, comparePrice: 99, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop', isFeatured: true, isTrending: true, rating: 4, numReviews: 12, createdAt: '2026-07-07T00:00:00Z' },
    { _id: 'p5', name: 'Stainless Steel Watch', price: 189, comparePrice: 249, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', isFeatured: false, isTrending: true, rating: 4.5, numReviews: 8, createdAt: '2026-07-06T00:00:00Z' },
    { _id: 'p6', name: 'Portable Bluetooth Speaker', price: 59, comparePrice: 79, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop', isFeatured: true, isTrending: false, rating: 4, numReviews: 19, createdAt: '2026-07-05T00:00:00Z' },
    { _id: 'p7', name: 'Men\'s Casual Polo Shirt', price: 35, comparePrice: null, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop', isFeatured: true, isTrending: true, rating: 3.5, numReviews: 7, createdAt: '2026-07-04T00:00:00Z' },
    { _id: 'p8', name: 'Gaming Mechanical Keyboard', price: 115, comparePrice: 149, image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop', isFeatured: false, isTrending: true, rating: 5, numReviews: 35, createdAt: '2026-07-03T00:00:00Z' },
];

// POLICY_ITEMS is now dynamic inside the component

// const TABS = ['New Arrivals', 'Featured', 'Best Sellers', "Editor's Picks"];

const TABS = ['New Arrivals', 'Best Sellers', "Editor's Picks"];


// Countdown Timer Component
const CountdownTimer = ({ targetDate }) => {
    const calculateTime = useCallback(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        if (distance <= 0) return { d: 0, h: 0, m: 0, s: 0 };
        return {
            d: Math.floor(distance / (1000 * 60 * 60 * 24)),
            h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            s: Math.floor((distance % (1000 * 60)) / 1000),
        };
    }, [targetDate]);

    const [time, setTime] = useState(calculateTime());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(calculateTime());
        }, 1000);
        return () => clearInterval(interval);
    }, [calculateTime]);

    const pad = n => String(n).padStart(2, '0');

    return (
        <div className="countdown-timer">
            <span className="countdown-label"><Clock size={14} /> Ends in:</span>
            <div className="countdown-blocks">
                <div className="countdown-block"><span className="count-num">{pad(time.d)}</span><span className="count-unit">Days</span></div>
                <span className="count-sep">:</span>
                <div className="countdown-block"><span className="count-num">{pad(time.h)}</span><span className="count-unit">Hrs</span></div>
                <span className="count-sep">:</span>
                <div className="countdown-block"><span className="count-num">{pad(time.m)}</span><span className="count-unit">Min</span></div>
                <span className="count-sep">:</span>
                <div className="countdown-block"><span className="count-num">{pad(time.s)}</span><span className="count-unit">Sec</span></div>
            </div>
        </div>
    );
};

const SWIPER_BREAKPOINTS = {
    320: { slidesPerView: 2, spaceBetween: 10 },
    480: { slidesPerView: 2, spaceBetween: 12 },
    768: { slidesPerView: 3, spaceBetween: 15 },
    1024: { slidesPerView: 4, spaceBetween: 15 },
    1200: { slidesPerView: 5, spaceBetween: 15 },
};

const HomePage = () => {
    const [searchParams] = useSearchParams();
    const querySearch = searchParams.get('search') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(querySearch);
    const [activeTab, setActiveTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;
    const { getCurrencySymbol } = useSettingsStore();
    const showToast = useWishlistStore((state) => state.showToast);

    // Newsletter States
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return showToast('Please enter your email', 'error');
        
        try {
            setIsSubscribing(true);
            const res = await axios.post(`${window.API_BASE_URL}/api/newsletter/subscribe`, { email: newsletterEmail });
            showToast(res.data.message || 'Subscribed successfully!', 'success');
            setNewsletterEmail('');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to subscribe', 'error');
        } finally {
            setIsSubscribing(false);
        }
    };

    const POLICY_ITEMS = [
        { icon: <Truck size={28} />, title: 'Free Shipping', sub: `From ${getCurrencySymbol()}99.00` },
        { icon: <RefreshCw size={28} />, title: 'Money Guarantee', sub: '30 days back' },
        { icon: <Shield size={28} />, title: 'Payment Method', sub: 'Secure System' },
        { icon: <Headphones size={28} />, title: 'Online Support', sub: '24 hours a day' },
        { icon: <Lock size={28} />, title: '100% Safe', sub: 'Secure shopping' },
    ];

    // Flash sale target: 2 days from now
    const flashSaleTarget = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;

    useEffect(() => { setSearchTerm(querySearch); }, [querySearch]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/products`);
                const active = data.filter(p => p.isActive !== false);
                setProducts(active.length === 0 ? MOCK_PRODUCTS : active);
            } catch {
                setProducts(MOCK_PRODUCTS);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    // Product groups
    const newestProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
    const trendingProducts = products.filter(p => p.isTrending);
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 10);
    const picksProducts = products.filter(p => p.rating >= 4).slice(0, 10);
    const bestSellers = [...products].sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0)).slice(0, 10);
    const flashSaleProducts = [...products].filter(p => p.comparePrice).slice(0, 8);

    // Tab products mapping
    const tabProducts = [newestProducts, featuredProducts, bestSellers, picksProducts.length >= 3 ? picksProducts : products.slice(2, 12)];

    // Search
    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        const matchName = product.name?.toLowerCase().includes(q);
        const matchBrand = (product.brand && typeof product.brand === 'object' ? product.brand.name : product.brand || '').toLowerCase().includes(q);
        const matchCat = (product.category && typeof product.category === 'object' ? product.category.name : product.category || '').toLowerCase().includes(q);
        return matchName || matchBrand || matchCat;
    });

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const currentList = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

    const handlePageChange = (pg) => {
        setCurrentPage(pg);
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const renderPagination = () => (
        <div className="pagination-row">
            <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="page-btn">‹ Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button key={pg} onClick={() => handlePageChange(pg)} className={`page-btn ${currentPage === pg ? 'active' : ''}`}>{pg}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="page-btn">Next ›</button>
        </div>
    );

    return (
        <div className="home-page">
            {/* Hero Slider */}
            <HeroSlider />

            {/* Policy Bar */}
            <div className="policy-bar-section">
                <div className="container">
                    <ul className="policy-bar">
                        {POLICY_ITEMS.map((item, idx) => (
                            <li key={idx} className="policy-item">
                                <div className="policy-icon">{item.icon}</div>
                                <div className="policy-text">
                                    <b>{item.title}</b>
                                    <span>{item.sub}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="container">
                {/* Category Slider */}
                <CategoryList />

                {loading ? (
                    <div className="loader">Loading products...</div>
                ) : searchTerm ? (
                    /* ===== SEARCH RESULTS ===== */
                    <section id="catalog-section" className="home-section">
                        <h2 className="section-title">
                            Search Results for &quot;{searchTerm}&quot; ({filteredProducts.length})
                        </h2>
                        {currentList.length > 0 ? (
                            <>
                                <div className="product-grid">
                                    {currentList.map(p => <ProductCard key={p._id} product={p} />)}
                                </div>
                                {totalPages > 1 && renderPagination()}
                            </>
                        ) : (
                            <div className="no-results">No products found. Try different keywords.</div>
                        )}
                    </section>
                ) : (
                    <>
                        {/* ===== FLASH SALE ===== */}
                        {flashSaleProducts.length > 0 && (
                            <section className="home-section flash-sale-section">
                                <div className="flash-sale-header">
                                    <div className="flash-sale-title">
                                        <Flame size={22} color="#e74c3c" />
                                        <h3 className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Flash Sale</h3>
                                    </div>
                                    <CountdownTimer targetDate={flashSaleTarget} />
                                    <div className="slider-controls">
                                        <button className="cat-arrow-btn flash-prev">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button className="cat-arrow-btn flash-next">
                                            <ChevronRight size={16} />
                                        </button>
                                        <Link to="/shop" className="view-all-link">View All →</Link>
                                    </div>
                                </div>

                                <Swiper
                                    modules={[Navigation]}
                                    spaceBetween={15}
                                    slidesPerView={2}
                                    breakpoints={SWIPER_BREAKPOINTS}
                                    navigation={{
                                        prevEl: '.flash-prev',
                                        nextEl: '.flash-next',
                                    }}
                                    className="products-swiper"
                                >
                                    {flashSaleProducts.map(p => (
                                        <SwiperSlide key={p._id}>
                                            <ProductCard product={p} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </section>
                        )}

                        {/* ===== TABBED PRODUCT SECTIONS ===== */}
                        {products.length > 0 && (
                            <section className="home-section tabbed-products-section">
                                <div className="tabs-header">
                                    <div className="tabs-list">
                                        {TABS.map((tab, idx) => (
                                            <button
                                                key={idx}
                                                className={`tab-btn ${activeTab === idx ? 'active' : ''}`}
                                                onClick={() => setActiveTab(idx)}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="slider-controls">
                                        <button className="cat-arrow-btn tabs-prev">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button className="cat-arrow-btn tabs-next">
                                            <ChevronRight size={16} />
                                        </button>
                                        <Link to="/shop" className="view-all-link">View All →</Link>
                                    </div>
                                </div>

                                <Swiper
                                    key={activeTab}
                                    modules={[Navigation]}
                                    spaceBetween={15}
                                    slidesPerView={2}
                                    breakpoints={SWIPER_BREAKPOINTS}
                                    navigation={{
                                        prevEl: '.tabs-prev',
                                        nextEl: '.tabs-next',
                                    }}
                                    className="products-swiper"
                                >
                                    {(tabProducts[activeTab] || newestProducts).map(p => (
                                        <SwiperSlide key={p._id}>
                                            <ProductCard product={p} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </section>
                        )}

                        {/* ===== TRENDING PRODUCTS ===== */}
                        {trendingProducts.length > 0 && (
                            <section className="home-section">
                                <div className="section-header-row">
                                    <h3 className="section-title">Trending Products</h3>
                                    <div className="slider-controls">
                                        <button className="cat-arrow-btn trend-prev">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button className="cat-arrow-btn trend-next">
                                            <ChevronRight size={16} />
                                        </button>
                                        <Link to="/shop" className="view-all-link">View All →</Link>
                                    </div>
                                </div>
                                <Swiper
                                    modules={[Navigation]}
                                    spaceBetween={15}
                                    slidesPerView={2}
                                    breakpoints={SWIPER_BREAKPOINTS}
                                    navigation={{
                                        prevEl: '.trend-prev',
                                        nextEl: '.trend-next',
                                    }}
                                    className="products-swiper"
                                >
                                    {trendingProducts.map(p => (
                                        <SwiperSlide key={p._id}>
                                            <ProductCard product={p} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </section>
                        )}

                        {/* ===== PROMO BANNERS ===== */}
                        <section className="home-section promo-banners-section">
                            <div className="promo-banners-grid">
                                <Link to="/" className="promo-banner-item promo-banner-large">
                                    <img
                                        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=700&auto=format&fit=crop"
                                        alt="Electronics Sale"
                                    />
                                    <div className="promo-banner-content">
                                        <span className="promo-tag">Up to 40% Off</span>
                                        <h4>Electronics & Gadgets</h4>
                                        <span className="promo-cta">Shop Now →</span>
                                    </div>
                                </Link>
                                <div className="promo-banner-slider" style={{ minWidth: 0 }}>
                                    <div className="section-header-row" style={{ marginBottom: '15px' }}>
                                        <h3 className="section-title" style={{ margin: 0, fontSize: '18px' }}>Featured Products</h3>
                                        <div className="slider-controls" style={{ margin: 0 }}>
                                            <button className="cat-arrow-btn feat-prev">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <button className="cat-arrow-btn feat-next">
                                                <ChevronRight size={16} />
                                            </button>
                                            <Link to="/shop" className="view-all-link">View All →</Link>
                                        </div>
                                    </div>
                                    <Swiper
                                        modules={[Navigation]}
                                        spaceBetween={15}
                                        slidesPerView={2}
                                        breakpoints={{
                                            ...SWIPER_BREAKPOINTS,
                                            992: { slidesPerView: 3, spaceBetween: 15 },
                                            1200: { slidesPerView: 4, spaceBetween: 15 },
                                        }}
                                        navigation={{
                                            prevEl: '.feat-prev',
                                            nextEl: '.feat-next',
                                        }}
                                        className="products-swiper"
                                    >
                                        {featuredProducts.map(p => (
                                            <SwiperSlide key={p._id}>
                                                <ProductCard product={p} />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                        </section>
                        <section className="newsletter-section">
                            <div className="newsletter-inner">
                                <div className="newsletter-text">
                                    <h3>Subscribe to Our Newsletter</h3>
                                    <p>Get the latest deals, new arrivals and exclusive offers</p>
                                </div>
                                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address..."
                                        className="newsletter-input"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="newsletter-btn" disabled={isSubscribing}>
                                        {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                                    </button>
                                </form>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;
