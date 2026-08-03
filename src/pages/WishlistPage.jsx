import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
    const { wishlistItems, loading, fetchWishlist } = useWishlistStore();

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    return (
        <div className="container fade-in" style={{ padding: '40px 15px', minHeight: '60vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <Heart size={28} fill="#f28b00" color="#f28b00" />
                <h1 className="section-title" style={{ margin: 0 }}>My Wishlist</h1>
            </div>

            {loading ? (
                <div className="loader" style={{ textAlign: 'center', padding: '50px 0' }}>
                    Loading your wishlist...
                </div>
            ) : wishlistItems.length === 0 ? (
                <div 
                    className="glass" 
                    style={{ 
                        padding: '60px 20px', 
                        textAlign: 'center', 
                        borderRadius: '16px', 
                        border: '1px solid var(--border-color)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}
                >
                    <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(242, 139, 0, 0.1)', color: '#f28b00', marginBottom: '20px' }}>
                        <Heart size={48} fill="none" />
                    </div>
                    <h2 style={{ fontSize: '24px', marginBottom: '10px', fontWeight: 600 }}>Your Wishlist is Empty</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '15px' }}>
                        Keep track of the products you love! Add items to your wishlist and they will appear here.
                    </p>
                    <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '12px 30px' }}>
                        <ShoppingBag size={18} /> Shop Now
                    </Link>
                </div>
            ) : (
                <div 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '30px' 
                    }}
                >
                    {wishlistItems.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
