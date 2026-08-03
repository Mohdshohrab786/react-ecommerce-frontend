import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useSettingsStore } from '../store/useSettingsStore';
import './ShopPage.css';
import '../pages/CategoryPage.css'; // Reuse some styles like sidebar-widget

const ShopPage = () => {
    const { getCurrencySymbol, settings } = useSettingsStore();
    const currencySymbol = getCurrencySymbol();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtering States
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedRating, setSelectedRating] = useState(0);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');

    // Safe fallback for settings
    const filtersConfig = settings?.filters || {
        isBrandFilterEnabled: true,
        isPriceFilterEnabled: true,
        isRatingFilterEnabled: true,
        isColorFilterEnabled: true,
        isSizeFilterEnabled: true
    };
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch categories
                const categoriesRes = await axios.get(`${window.API_BASE_URL}/api/categories`);
                const activeCategories = categoriesRes.data.filter(c => c.isActive);
                setCategories(activeCategories);

                // Fetch all products
                const productsRes = await axios.get(`${window.API_BASE_URL}/api/products`);
                // Filter active products
                const activeProducts = productsRes.data.filter(p => p.isActive !== false);
                setProducts(activeProducts);
                
                // Initialize max price for the slider
                if (activeProducts.length > 0) {
                    const maxP = Math.max(...activeProducts.map(p => p.price));
                    setMaxPrice(maxP);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching shop page data:", err);
                setError("Failed to load products. Please try again later.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProducts = (() => {
        // Helper to check if a category is a descendant of the selected category
        const isDescendant = (catId, targetParentId) => {
            if (catId === targetParentId) return true;
            const category = categories.find(c => c._id === catId);
            if (!category || !category.parentCategory) return false;
            const parentId = typeof category.parentCategory === 'object' ? category.parentCategory._id : category.parentCategory;
            return isDescendant(parentId, targetParentId);
        };

        let filtered = products;

        if (selectedCategory) {
            filtered = filtered.filter(p => {
                if (!p.category) return false;
                const pCatId = typeof p.category === 'object' ? p.category._id : p.category;
                return isDescendant(pCatId, selectedCategory);
            });
        }

        if (filtersConfig.isPriceFilterEnabled && minPrice !== '') {
            filtered = filtered.filter(p => p.price >= Number(minPrice));
        }

        if (filtersConfig.isPriceFilterEnabled && maxPrice !== '') {
            filtered = filtered.filter(p => p.price <= Number(maxPrice));
        }

        if (filtersConfig.isBrandFilterEnabled && selectedBrand) {
            filtered = filtered.filter(p => p.brand && (p.brand._id === selectedBrand || p.brand.name === selectedBrand));
        }

        if (filtersConfig.isRatingFilterEnabled && selectedRating > 0) {
            filtered = filtered.filter(p => p.rating >= selectedRating);
        }

        if (filtersConfig.isColorFilterEnabled && selectedColor) {
            // Simplified check if product has color variants
            filtered = filtered.filter(p => {
                if (p.variants && p.variants.some(v => v.colorName === selectedColor)) return true;
                return false;
            });
        }

        if (filtersConfig.isSizeFilterEnabled && selectedSize) {
            filtered = filtered.filter(p => p.sizes && p.sizes.includes(selectedSize));
        }

        return filtered;
    })();

    if (loading) {
        return <div className="loader container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading Shop Collection...</div>;
    }

    if (error) {
        return <div className="error-container container">{error}</div>;
    }

    return (
        <div className="shop-page container fade-in">
            <div className="shop-header">
                <div className="breadcrumb">
                    <Link to="/">Home</Link> &gt; <span>Shop</span>
                </div>
                <h1 className="shop-title">Shop All Products</h1>
                <p className="shop-count">{filteredProducts.length} items found</p>
            </div>

            <div className="shop-layout">
                {/* Left Sidebar Filters */}
                <aside className="shop-sidebar">
                    <div className="sidebar-widget">
                        <h3>Categories</h3>
                        <ul className="sidebar-category-list">
                            <li>
                                <button 
                                    className={`filter-btn ${selectedCategory === null ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    All Products
                                </button>
                            </li>
                            {(() => {
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

                                const renderTree = (nodes, level = 0) => {
                                    return nodes.map(cat => (
                                        <li key={cat._id} className={`sidebar-cat-item ${cat.children?.length > 0 ? 'has-children' : ''}`}>
                                            <button 
                                                className={`filter-btn ${selectedCategory === cat._id ? 'active' : ''}`}
                                                onClick={() => setSelectedCategory(cat._id)}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                                            >
                                                {cat.name}
                                                {cat.children?.length > 0 && <ChevronRight size={14} className="cat-chevron" style={{ color: '#888' }} />}
                                            </button>
                                            {cat.children && cat.children.length > 0 && (
                                                <ul className="sidebar-subcat-list">
                                                    {renderTree(cat.children, level + 1)}
                                                </ul>
                                            )}
                                        </li>
                                    ));
                                };

                                const tree = buildTree(categories);
                                return renderTree(tree);
                            })()}
                        </ul>
                    </div>

                    {filtersConfig.isPriceFilterEnabled && (
                        <div className="sidebar-widget">
                            <h3>Max Price: {maxPrice !== '' ? `${currencySymbol}${maxPrice}` : 'Any'}</h3>
                            <div className="price-filter-form" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000} 
                                    value={maxPrice !== '' ? maxPrice : (products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000)} 
                                    onChange={(e) => setMaxPrice(Number(e.target.value))} 
                                    className="price-slider"
                                    style={{ width: '100%', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                                    <span>{currencySymbol}0</span>
                                    <span>{currencySymbol}{products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {filtersConfig.isBrandFilterEnabled && (
                        <div className="sidebar-widget">
                            <h3>Brands</h3>
                            <select 
                                className="modern-input" 
                                value={selectedBrand} 
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                style={{ width: '100%', padding: '10px' }}
                            >
                                <option value="">All Brands</option>
                                {/* Extract unique brands from products */}
                                {Array.from(new Set(products.filter(p => p.brand).map(p => p.brand.name || p.brand))).map((brand, i) => (
                                    <option key={i} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {filtersConfig.isRatingFilterEnabled && (
                        <div className="sidebar-widget">
                            <h3>Minimum Rating</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[5, 4, 3, 2, 1].map(num => (
                                    <label key={num} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input 
                                            type="radio" 
                                            name="rating" 
                                            checked={selectedRating === num}
                                            onChange={() => setSelectedRating(num)} 
                                        />
                                        {num} Stars & Up
                                    </label>
                                ))}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '5px' }}>
                                    <input 
                                        type="radio" 
                                        name="rating" 
                                        checked={selectedRating === 0}
                                        onChange={() => setSelectedRating(0)} 
                                    />
                                    Any Rating
                                </label>
                            </div>
                        </div>
                    )}
                    
                    {filtersConfig.isColorFilterEnabled && (
                        <div className="sidebar-widget">
                            <h3>Color</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {/* Extract unique colors from variants */}
                                {Array.from(new Set(products.flatMap(p => p.variants ? p.variants.map(v => v.colorName) : []).filter(Boolean))).map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            border: `1px solid ${selectedColor === color ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            background: selectedColor === color ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                            color: 'var(--text-primary)',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {filtersConfig.isSizeFilterEnabled && (
                        <div className="sidebar-widget">
                            <h3>Size</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {/* Extract unique sizes from products */}
                                {Array.from(new Set(products.flatMap(p => p.sizes || []).filter(Boolean))).map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            border: `1px solid ${selectedSize === size ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            background: selectedSize === size ? 'var(--primary-color)' : 'transparent',
                                            color: selectedSize === size ? '#111' : 'var(--text-primary)',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Right Product Grid */}
                <main className="shop-products">
                    {filteredProducts.length > 0 ? (
                        <div className="product-grid">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-products-state">
                            <h3>No Products Found</h3>
                            <p>We couldn't find any products at the moment.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ShopPage;
