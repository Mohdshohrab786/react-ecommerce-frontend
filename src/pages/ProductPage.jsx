import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { 
    Truck, 
    ShieldCheck, 
    RefreshCw, 
    Info, 
    Check, 
    MapPin, 
    Star,
    ShoppingBag,
    Heart,
    Share2,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from '../components/ProductCard';
import './ProductPage.css';

const SWIPER_BREAKPOINTS = {
    320: { slidesPerView: 2, spaceBetween: 10 },
    480: { slidesPerView: 2, spaceBetween: 12 },
    768: { slidesPerView: 3, spaceBetween: 15 },
    1024: { slidesPerView: 4, spaceBetween: 15 },
    1200: { slidesPerView: 5, spaceBetween: 15 },
};

const ProductPage = () => {
    const getCurrencySymbol = useSettingsStore(state => state.getCurrencySymbol);
    const currencySymbol = getCurrencySymbol();

    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({});
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { userInfo } = useAuthStore();
    const { wishlistItems, addToWishlist, removeFromWishlist, showToast } = useWishlistStore();
    const isInWishlist = wishlistItems.some(item => item._id === product._id);

    const handleWishlistClick = async () => {
        if (!userInfo) {
            navigate(`/login?redirect=product/${id}`);
            return;
        }
        if (isInWishlist) {
            await removeFromWishlist(product._id);
        } else {
            await addToWishlist(product);
        }
    };

    // Dynamic Image Gallery State
    const [activeImage, setActiveImage] = useState('');
    const [activeCoupons, setActiveCoupons] = useState([]);
    const [copiedCode, setCopiedCode] = useState('');

    // Review States
    const [ratingInput, setRatingInput] = useState(5);
    const [commentInput, setCommentInput] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    // Hover Zoom States
    const [zoomOrigin, setZoomOrigin] = useState('center');
    const [isZoomed, setIsZoomed] = useState(false);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomOrigin(`${x}% ${y}%`);
    };

    // Thumbnail Carousel States
    const [startIndex, setStartIndex] = useState(0);

    const handleNextThumbnails = () => {
        if (startIndex < imagesList.length - 6) {
            setStartIndex(prev => prev + 1);
        }
    };

    const handlePrevThumbnails = () => {
        if (startIndex > 0) {
            setStartIndex(prev => prev - 1);
        }
    };

    // Color & Size Option States
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');

    // Active Variant State (if product has variations)
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Pincode/Delivery Estimator States
    const [pincode, setPincode] = useState('');
    const [deliveryEstimate, setDeliveryEstimate] = useState('');
    const [checkingPincode, setCheckingPincode] = useState(false);

    // Mock options for Fashion/General categories since schema has no options fields
    const defaultColors = [
        { name: 'Matte Black', value: '#111111' },
        { name: 'Cloud White', value: '#f3f4f6' },
        { name: 'Crimson Red', value: '#dc2626' },
        { name: 'Slate Blue', value: '#2563eb' }
    ];
    const defaultSizes = ['S', 'M', 'L', 'XL'];

    const { addToCart } = useCartStore();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/products/${id}`);
                setProduct(data);
                if (data.hasVariants && data.variants && data.variants.length > 0) {
                    const firstVariant = data.variants[0];
                    setSelectedVariant(firstVariant);
                    setSelectedColor(firstVariant.colorName);
                    setActiveImage(firstVariant.image);
                } else {
                    setActiveImage(data.image);
                    setSelectedColor('');
                }
                setSelectedSize(data.sizes && data.sizes.length > 0 ? data.sizes[0] : '');
                setLoading(false);
            } catch (err) {
                setError(err.response && err.response.data.message ? err.response.data.message : err.message);
                setLoading(false);
            }
        };
        const fetchActiveCoupons = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/coupons/active/${id}`);
                setActiveCoupons(data);
            } catch (err) {
                console.error('Error fetching active coupons', err);
            }
        };

        fetchProduct();
        fetchActiveCoupons();
    }, [id]);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        setReviewError('');
        setReviewSuccess('');
        setReviewLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            await axios.post(`${window.API_BASE_URL}/api/products/${id}/reviews`, {
                rating: ratingInput,
                comment: commentInput
            }, config);
            
            setReviewSuccess('Review submitted successfully!');
            setCommentInput('');
            setRatingInput(5);
            // Refresh product details
            const { data } = await axios.get(`${window.API_BASE_URL}/api/products/${id}`);
            setProduct(data);
            setReviewLoading(false);
        } catch (err) {
            setReviewError(err.response?.data?.message || err.message);
            setReviewLoading(false);
        }
    };

    const addToCartHandler = () => {
        addToCart({
            product: product._id,
            name: product.name,
            image: selectedVariant ? selectedVariant.image : product.image,
            price: selectedVariant ? selectedVariant.price : product.price,
            countInStock: selectedVariant ? selectedVariant.countInStock : product.countInStock,
            qty: Number(qty),
            color: selectedColor,
            size: selectedSize
        });
        navigate('/cart');
    };

    const buyNowHandler = () => {
        addToCart({
            product: product._id,
            name: product.name,
            image: selectedVariant ? selectedVariant.image : product.image,
            price: selectedVariant ? selectedVariant.price : product.price,
            countInStock: selectedVariant ? selectedVariant.countInStock : product.countInStock,
            qty: Number(qty),
            color: selectedColor,
            size: selectedSize
        });
        navigate('/checkout');
    };

    const handleShareClick = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Check out this amazing product: ${product.name}`,
                url: window.location.href,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            // Fallback for browsers that do not support Web Share API
            navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!', 'success');
        }
    };

    const handlePincodeCheck = async (e) => {
        e.preventDefault();
        if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
            setDeliveryEstimate('Please enter a valid 6-digit Pincode.');
            return;
        }
        
        setCheckingPincode(true);
        setDeliveryEstimate('');
        
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/shipping-rules/calculate`, {
                city: '', 
                pincode: pincode
            }, config);

            if (data.isAvailable) {
                setDeliveryEstimate(`Available! Delivery within ${data.deliveryDays} (${currencySymbol}${data.shippingCharge})`);
            } else {
                setDeliveryEstimate(data.message || 'Delivery not available for this location.');
            }
        } catch (err) {
            setDeliveryEstimate(err.response?.data?.message || 'Error checking delivery availability.');
        } finally {
            setCheckingPincode(false);
        }
    };

    // Calculate GST Details if gstPercentage is set
    const gstPercentage = product.gstPercentage || 0;
    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentCountInStock = selectedVariant ? selectedVariant.countInStock : product.countInStock;
    const basePrice = gstPercentage > 0 ? (currentPrice / (1 + gstPercentage / 100)) : currentPrice;
    const totalGst = currentPrice - basePrice;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;

    // Create complete list of images for gallery
    const imagesList = product.image ? [product.image, ...(product.gallery || [])] : [];

    const getImageUrl = (image) => {
        if (!image) return '';
        return image.startsWith('http') ? image : `${window.API_BASE_URL}${image}`;
    };

    const handlePrevImage = () => {
        const currentIndex = imagesList.indexOf(activeImage);
        if (currentIndex > 0) {
            setActiveImage(imagesList[currentIndex - 1]);
        } else {
            setActiveImage(imagesList[imagesList.length - 1]);
        }
    };

    const handleNextImage = () => {
        const currentIndex = imagesList.indexOf(activeImage);
        if (currentIndex < imagesList.length - 1) {
            setActiveImage(imagesList[currentIndex + 1]);
        } else {
            setActiveImage(imagesList[0]);
        }
    };

    return (
        <div className="product-page container fade-in" style={{ paddingBottom: '60px' }}>
            {loading ? <div className="loader" style={{ textAlign: 'center', padding: '100px 0' }}>Loading Product Details...</div> : error ? <div className="error">{error}</div> : (
                <div className="product-details">
                    
                    {/* Left Column: Image & Gallery */}
                    <div className="product-gallery">
                            <div 
                            className="product-image-container" 
                            style={{ 
                                position: 'relative', 
                                overflow: 'hidden', 
                                cursor: 'zoom-in'
                            }}
                            onMouseMove={(e) => {
                                if (window.innerWidth > 992) handleMouseMove(e);
                            }}
                            onMouseEnter={() => {
                                if (window.innerWidth > 992) setIsZoomed(true);
                            }}
                            onMouseLeave={() => setIsZoomed(false)}
                        >
                            {activeImage && (
                                <img 
                                    src={getImageUrl(activeImage)} 
                                    alt={product.name} 
                                    style={{
                                        transform: isZoomed ? 'scale(2)' : 'scale(1)',
                                        transformOrigin: zoomOrigin,
                                        transition: isZoomed ? 'none' : 'transform 0.3s ease',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            )}
                        </div>
                        {imagesList.length > 1 && (
                            <div className="gallery-thumbnails-carousel" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', width: '100%', maxWidth: '540px' }}>
                                {imagesList.length > 6 && (
                                    <button 
                                        onClick={handlePrevThumbnails}
                                        disabled={startIndex === 0}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: startIndex === 0 ? 'not-allowed' : 'pointer',
                                            opacity: startIndex === 0 ? 0.4 : 1,
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}
                                    >
                                        &#10094;
                                    </button>
                                )}
                                
                                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', overflowY: 'hidden', flex: 1, paddingBottom: '4px' }} className="hide-scrollbar">
                                    {imagesList.slice(startIndex, startIndex + 6).map((img, index) => {
                                        if (!img) return null;
                                        const globalIndex = startIndex + index;
                                        return (
                                            <button 
                                                key={globalIndex}
                                                onClick={() => setActiveImage(img)}
                                                onMouseEnter={() => setActiveImage(img)}
                                                className={`thumbnail-btn ${activeImage === img ? 'active' : ''}`}
                                                style={{ width: '70px', height: '70px', flexShrink: 0, padding: '6px', border: activeImage === img ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: '#fff', transition: 'all 0.2s' }}
                                            >
                                                <img 
                                                    src={getImageUrl(img)} 
                                                    alt={`view-${globalIndex}`} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>

                                {imagesList.length > 6 && (
                                    <button 
                                        onClick={handleNextThumbnails}
                                        disabled={startIndex >= imagesList.length - 6}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: startIndex >= imagesList.length - 6 ? 'not-allowed' : 'pointer',
                                            opacity: startIndex >= imagesList.length - 6 ? 0.4 : 1,
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}
                                    >
                                        &#10095;
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Trust Badges */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '12px',
                            marginTop: '24px',
                            borderTop: '1px solid var(--border-color)',
                            paddingTop: '20px'
                        }}>
                            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <ShieldCheck size={20} style={{ margin: '0 auto 8px', color: '#10b981' }} />
                                <strong>100% Genuine</strong>
                                <p style={{ fontSize: '10px', marginTop: '2px' }}>Direct from brand</p>
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <RefreshCw size={20} style={{ margin: '0 auto 8px', color: 'var(--accent-color)' }} />
                                <strong>7 Day Returns</strong>
                                <p style={{ fontSize: '10px', marginTop: '2px' }}>Easy replacements</p>
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <Truck size={20} style={{ margin: '0 auto 8px', color: '#3b82f6' }} />
                                <strong>Free Delivery</strong>
                                <p style={{ fontSize: '10px', marginTop: '2px' }}>On all orders</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column: Product Information */}
                    <div className="product-info-container">
                        <div className="product-brand">{product.brand ? product.brand.name : 'GENERIC'}</div>
                        <h1>{product.name}</h1>
                        
                        {/* Rating Summary */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', color: '#f59e0b' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={14} 
                                        fill={i < Math.round(product.rating || 0) ? '#f59e0b' : 'none'} 
                                    />
                                ))}
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {product.rating || 0} / 5 ({product.numReviews || 0} customer reviews)
                            </span>
                        </div>

                        {/* Price & GST Section */}
                        <div className="product-price-section">
                            <div className="price-row">
                                <span className="product-price-large">{currencySymbol}{currentPrice.toFixed(2)}</span>
                                {product.discount > 0 && (
                                    <>
                                        <span className="original-price">{currencySymbol}{(currentPrice * (1 + product.discount/100)).toFixed(2)}</span>
                                        <span className="discount-badge">{product.discount}% OFF</span>
                                    </>
                                )}
                            </div>

                            {/* GST Breakdown (Tax Estimator) */}
                            <div className="gst-breakdown">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    <Info size={14} /> Tax details:
                                </div>
                                <div className="gst-row">
                                    <span>Base Price (excluding GST):</span>
                                    <span>{currencySymbol}{basePrice.toFixed(2)}</span>
                                </div>
                                <div className="gst-row">
                                    <span>GST Rate:</span>
                                    <span>{gstPercentage}%</span>
                                </div>
                                {gstPercentage > 0 && (
                                    <>
                                        <div className="gst-row">
                                            <span>CGST ({gstPercentage / 2}%):</span>
                                            <span>{currencySymbol}{cgst.toFixed(2)}</span>
                                        </div>
                                        <div className="gst-row">
                                            <span>SGST ({gstPercentage / 2}%):</span>
                                            <span>{currencySymbol}{sgst.toFixed(2)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="gst-row">
                                    <span>Total Price (Inclusive of GST):</span>
                                    <span>{currencySymbol}{currentPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Active Coupons Display Widget */}
                        {activeCoupons.length > 0 && (
                            <div className="active-coupons-widget glass" style={{ padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px dashed rgba(16, 185, 129, 0.4)' }}>
                                <h3 style={{ fontSize: '15px', color: '#10b981', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                    <Star size={16} fill="#10b981" /> Available Special Offers:
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {activeCoupons.map((coupon) => (
                                        <div key={coupon._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--accent-color)' }}>{coupon.code}</span>
                                                    <span style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '2px 6px', borderRadius: '12px', fontWeight: 600 }}>
                                                        {coupon.type === 'Percentage' ? `${coupon.value}% OFF` : `${currencySymbol}${coupon.value} OFF`}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    Min. order: {currencySymbol}{coupon.minimumOrder || 0}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleCopyCode(coupon.code)}
                                                className="btn-secondary"
                                                style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                                            >
                                                {copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <p className="product-desc">{product.description}</p>
                        
                        {/* Optional Color Swatch Selector */}
                        {/* Color Swatch Selector (Only shown if variations are configured) */}
                        {product.hasVariants && product.variants && product.variants.length > 0 && (
                            <div className="option-select-group">
                                <div className="option-title">Select Color: <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{selectedColor}</span></div>
                                <div className="color-swatches">
                                    {product.variants.map((variant) => (
                                        <button 
                                            key={variant._id || variant.colorName}
                                            onClick={() => {
                                                setSelectedVariant(variant);
                                                setSelectedColor(variant.colorName);
                                                setActiveImage(variant.image);
                                            }}
                                            className={`color-swatch-btn ${selectedColor === variant.colorName ? 'active' : ''}`}
                                            title={variant.colorName}
                                        >
                                            <span className="color-dot" style={{ backgroundColor: variant.colorCode || '#000000' }}></span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Optional Size Selector */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="option-select-group">
                                <div className="option-title">Select Size: <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{selectedSize}</span></div>
                                <div className="size-options">
                                    {product.sizes.map((size) => (
                                        <button 
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`size-option-btn ${selectedSize === size ? 'active' : ''}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sleek Purchase Section */}
                        <div className="purchase-section">
                            <div className="price-qty-row" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap', gap: '24px', marginBottom: '20px' }}>
                                <div className="purchase-total-price" style={{ margin: 0 }}>
                                    Total Price: <strong>{currencySymbol}{(currentPrice * qty).toFixed(2)}</strong>
                                </div>
                                
                                {/* Quantity Selector */}
                                <div className="qty-selector" style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', height: '48px', width: '120px' }}>
                                    <button onClick={() => setQty(prev => Math.max(1, prev - 1))} disabled={qty <= 1} style={{ padding: '0 15px', background: '#f9f9f9', borderRight: '1px solid var(--border-color)', fontSize: '18px', cursor: qty <= 1 ? 'not-allowed' : 'pointer' }}>-</button>
                                    <input type="number" value={qty} readOnly style={{ width: '40px', textAlign: 'center', border: 'none', fontWeight: 'bold' }} />
                                    <button onClick={() => setQty(prev => Math.min(currentCountInStock, prev + 1))} disabled={qty >= currentCountInStock} style={{ padding: '0 15px', background: '#f9f9f9', borderLeft: '1px solid var(--border-color)', fontSize: '18px', cursor: qty >= currentCountInStock ? 'not-allowed' : 'pointer' }}>+</button>
                                </div>
                            </div>

                            <div className="action-buttons-row" style={{ display: 'flex', gap: '10px' }}>
                                {currentCountInStock > 0 ? (
                                    <>
                                        <button 
                                            className="btn-secondary" 
                                            onClick={addToCartHandler}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '48px' }}
                                        >
                                            <ShoppingBag size={18} /> Add To Cart
                                        </button>

                                        <button 
                                            className="btn-primary" 
                                            onClick={buyNowHandler}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '48px' }}
                                        >
                                            Buy Now
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="btn-primary" 
                                        disabled
                                        style={{ width: '100%', height: '48px' }}
                                    >
                                        Out Of Stock
                                    </button>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button 
                                    onClick={handleWishlistClick}
                                    className="btn-secondary"
                                    style={{
                                        flex: 1,
                                        height: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: 0,
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        color: isInWishlist ? '#ef4444' : 'inherit',
                                        background: isInWishlist ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                                    }}
                                    title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                >
                                    <Heart size={20} fill={isInWishlist ? '#ef4444' : 'none'} color={isInWishlist ? '#ef4444' : 'currentColor'} />
                                    <span>{isInWishlist ? 'Wishlisted' : 'Wishlist'}</span>
                                </button>
                                
                                <button 
                                    onClick={handleShareClick}
                                    className="btn-secondary"
                                    style={{
                                        flex: 1,
                                        height: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: 0,
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)'
                                    }}
                                    title="Share Product"
                                >
                                    <Share2 size={20} />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>

                        {/* Pincode Delivery Estimator */}
                        <div className="delivery-checker">
                            <div className="option-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={14} /> Check Delivery Availability:
                            </div>
                            <form onSubmit={handlePincodeCheck} className="delivery-input-group">
                                <input 
                                    type="text" 
                                    placeholder="Enter 6-digit Pincode" 
                                    maxLength="6"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="pincode-input"
                                />
                                <button type="submit" className="btn-check-delivery">
                                    {checkingPincode ? 'Checking...' : 'Check'}
                                </button>
                            </form>
                            {deliveryEstimate && (
                                <div className="delivery-result" style={{ color: deliveryEstimate.includes('Available') ? '#10b981' : '#ef4444' }}>
                                    {deliveryEstimate.includes('Available') ? <Check size={16} /> : <X size={16} />}
                                    <span>{deliveryEstimate}</span>
                                </div>
                            )}
                        </div>

                        {/* Product Specifications Table */}
                        <h2 className="option-title" style={{ marginTop: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            Specifications
                        </h2>
                        <table className="specs-table">
                            <tbody>
                                <tr>
                                    <td>Brand</td>
                                    <td>{product.brand ? product.brand.name : 'Generic'}</td>
                                </tr>
                                <tr>
                                    <td>Category</td>
                                    <td>{product.category ? product.category.name : 'General'}</td>
                                </tr>
                                {product.sku && (
                                    <tr>
                                        <td>SKU</td>
                                        <td>{product.sku}</td>
                                    </tr>
                                )}
                                {product.barcode && (
                                    <tr>
                                        <td>Barcode</td>
                                        <td>{product.barcode}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td>Stock Status</td>
                                    <td style={{ color: currentCountInStock > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                        {currentCountInStock > 0 ? `In Stock (${currentCountInStock} items left)` : 'Out of Stock'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
            )}

            {/* Explicitly Related Products Section */}
            {!loading && !error && product.relatedProducts && product.relatedProducts.length > 0 && (
                <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '40px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '22px', margin: 0 }}>Related Products</h2>
                        <div className="slider-controls" style={{ display: 'flex', gap: '8px' }}>
                            <button className="cat-arrow-btn related-prev">
                                <ChevronLeft size={16} />
                            </button>
                            <button className="cat-arrow-btn related-next">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={15}
                        slidesPerView={2}
                        breakpoints={SWIPER_BREAKPOINTS}
                        navigation={{
                            prevEl: '.related-prev',
                            nextEl: '.related-next',
                        }}
                        className="products-swiper"
                        style={{ paddingBottom: '10px' }}
                    >
                        {product.relatedProducts.map(rp => (
                            <SwiperSlide key={rp._id}>
                                <ProductCard product={rp} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}

            {/* Reviews Section */}
            {!loading && !error && product._id && (
                <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
                    <div className="reviews-grid">
                        
                        {/* Reviews list */}
                        <div>
                            <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Customer Reviews ({product.reviews?.length || 0})</h2>
                            {product.reviews && product.reviews.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {product.reviews.map((review) => (
                                        <div key={review._id} className="glass" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <strong style={{ fontSize: '14px' }}>{review.name}</strong>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '10px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={14} 
                                                        fill={i < review.rating ? '#f59e0b' : 'none'} 
                                                    />
                                                ))}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                    No reviews yet. Be the first to review this product!
                                </div>
                            )}
                        </div>

                        {/* Submit review form */}
                        <div>
                            <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Write a Customer Review</h2>
                            {userInfo ? (
                                <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                    {reviewSuccess && <div style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{reviewSuccess}</div>}
                                    {reviewError && <div className="error-message" style={{ marginBottom: '16px', fontSize: '13px' }}>{reviewError}</div>}
                                    
                                    <form onSubmit={submitReviewHandler}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Rating</label>
                                            <select 
                                                value={ratingInput} 
                                                onChange={(e) => setRatingInput(Number(e.target.value))} 
                                                className="filter-select"
                                                style={{ width: '100%', marginBottom: 0 }}
                                            >
                                                <option value="5">5 Stars - Excellent</option>
                                                <option value="4">4 Stars - Very Good</option>
                                                <option value="3">3 Stars - Good</option>
                                                <option value="2">2 Stars - Fair</option>
                                                <option value="1">1 Star - Poor</option>
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Comment</label>
                                            <textarea 
                                                rows="4" 
                                                placeholder="Write your comments here..." 
                                                value={commentInput} 
                                                onChange={(e) => setCommentInput(e.target.value)} 
                                                className="input-field"
                                                style={{ width: '100%', padding: '12px', fontSize: '14px', marginBottom: 0 }}
                                                required
                                            ></textarea>
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="btn-primary w-100" 
                                            disabled={reviewLoading}
                                            style={{ height: '44px' }}
                                        >
                                            {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                    Please <span style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate(`/login?redirect=product/${id}`)}>Login</span> to submit a review.
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
