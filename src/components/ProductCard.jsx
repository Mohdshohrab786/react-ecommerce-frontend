import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useSettingsStore } from '../store/useSettingsStore';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCartStore();
    const { userInfo } = useAuthStore();
    const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();
    const [hovered, setHovered] = useState(false);
    const { getCurrencySymbol } = useSettingsStore();

    const isInWishlist = wishlistItems.some((item) => item._id === product._id);
    const isInCart = cartItems.some((item) => item._id === product._id || item.product === product._id);

    const imageUrl = product.image?.startsWith('http')
        ? product.image
        : `${window.API_BASE_URL}${product.image}`;

    // Second image for hover effect (use different variation or overlay)
    const hoverImageUrl = product.image2
        ? (product.image2.startsWith('http') ? product.image2 : `${window.API_BASE_URL}${product.image2}`)
        : imageUrl;

    // Discount calculation
    const originalPrice = product.comparePrice || (product.price * 1.2);
    const discountPct = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : null;

    // Rating stars
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isInCart) {
            navigate('/cart');
            return;
        }

        addToCart({
            product: product._id,
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: 1,
            countInStock: product.countInStock || 99,
        });

        if (isInWishlist && window.location.pathname === '/wishlist') {
            removeFromWishlist(product._id);
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!userInfo) {
            navigate('/login');
            return;
        }
        if (isInWishlist) {
            await removeFromWishlist(product._id);
        } else {
            await addToWishlist(product);
        }
    };

    return (
        <div
            className={`product-card ${hovered ? 'is-hovered' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image Block */}
            <div className="product-img-block">
                {/* Sale / New badge */}
                <div className="product-badges">
                    {discountPct && (
                        <span className="badge badge-sale">-{discountPct}%</span>
                    )}
                    {product.isNew && (
                        <span className="badge badge-new">New</span>
                    )}
                </div>

                {/* Product Image */}
                <Link to={`/product/${product._id}`} className="product-img-link">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className={`product-img img-main ${hovered ? 'fade-out' : ''}`}
                        loading="lazy"
                    />
                    <img
                        src={hoverImageUrl}
                        alt={product.name}
                        className={`product-img img-hover ${hovered ? 'fade-in' : ''}`}
                        loading="lazy"
                    />
                </Link>

                {/* Quick View Overlay */}
                <div className="product-overlay-actions">
                    <Link to={`/product/${product._id}`} className="overlay-btn quickview-btn" title="Quick View">
                        <Eye size={15} />
                        <span>Quick View</span>
                    </Link>
                </div>

                {/* Side Action Buttons */}
                <div className="product-side-actions">
                    <button
                        className={`side-action-btn ${isInWishlist ? 'active' : ''}`}
                        onClick={handleWishlist}
                        title="Add to Wishlist"
                    >
                        <Heart size={15} fill={isInWishlist ? '#f28b00' : 'none'} color={isInWishlist ? '#f28b00' : 'currentColor'} />
                    </button>
                </div>
            </div>

            {/* Product Info Block */}
            <div className="product-info-block">
                {/* Add to Cart Button */}
                <div className="product-cart-row">
                    <button
                        className={`add-to-cart-btn ${isInCart ? 'added' : ''}`}
                        onClick={handleAddToCart}
                        disabled={product.countInStock === 0}
                    >
                        <ShoppingCart size={14} />
                        {isInCart ? 'Added to Cart ✓' : product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>

                {/* Rating */}
                <div className="product-rating">
                    {[...Array(fullStars)].map((_, i) => (
                        <Star key={`f${i}`} size={12} fill="#f28b00" color="#f28b00" />
                    ))}
                    {halfStar && <Star size={12} fill="#f28b00" color="#f28b00" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
                    {[...Array(emptyStars)].map((_, i) => (
                        <Star key={`e${i}`} size={12} fill="none" color="#ddd" />
                    ))}
                    {product.numReviews > 0 && (
                        <span className="rating-count">({product.numReviews})</span>
                    )}
                </div>

                {/* Name */}
                <h4 className="product-name">
                    <Link to={`/product/${product._id}`}>{product.name}</Link>
                </h4>

                {/* Price */}
                <div className="product-price">
                    <span className="price-current">{getCurrencySymbol()}{product.price?.toFixed(2)}</span>
                    {product.comparePrice && (
                        <span className="price-old">{getCurrencySymbol()}{product.comparePrice?.toFixed(2)}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
