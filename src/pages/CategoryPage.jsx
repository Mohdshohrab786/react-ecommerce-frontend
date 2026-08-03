import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useSettingsStore } from '../store/useSettingsStore';
import './CategoryPage.css';

const CategoryPage = () => {
    const { slug } = useParams();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [error, setError] = useState(null);
    const [banner, setBanner] = useState(null);

    const { getCurrencySymbol, settings } = useSettingsStore();
    const currencySymbol = getCurrencySymbol();

    // Filtering States
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

                // Find currently selected category
                const selectedCat = activeCategories.find(c => c.slug === slug);
                setCurrentCategory(selectedCat);

                // Fetch all products
                const productsRes = await axios.get(`${window.API_BASE_URL}/api/products`);
                // Filter active products in this category
                const activeProducts = productsRes.data.filter(p => p.isActive !== false);
                setProducts(activeProducts);

                // Initialize max price for the slider
                if (activeProducts.length > 0) {
                    const maxP = Math.max(...activeProducts.map(p => p.price));
                    setMaxPrice(maxP);
                }

                // Fetch page banner
                try {
                    const bannerRes = await axios.get(`${window.API_BASE_URL}/api/banners`);
                    const pageBanner = bannerRes.data.find(b => b.type === 'Shop' && b.isActive);
                    if (pageBanner) {
                        setBanner(pageBanner);
                    }
                } catch (bErr) {
                    console.error("Error loading shop page banner:", bErr);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching category page data:", err);
                setError("Failed to load products. Please try again later.");
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) {
        return <div className="loader container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading Category Collection...</div>;
    }

    if (error) {
        return <div className="error-container container">{error}</div>;
    }

    // Filter products for the current category
    const categoryProducts = (() => {
        let filtered = products.filter(product => {
            if (!currentCategory) return false;
            
            // Match by ID for maximum robustness
            const productCategoryId = product.category ? (typeof product.category === 'object' ? product.category._id : product.category) : null;
            const isMainCategoryMatch = productCategoryId === currentCategory._id;
            
            const subCats = product.subCategories || [];
            const isSubCategoryMatch = subCats.some(sub => {
                const subId = typeof sub === 'object' ? sub._id : sub;
                return subId === currentCategory._id;
            });
            
            return isMainCategoryMatch || isSubCategoryMatch;
        });

        // Apply additional filters
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

    return (
        <div className="category-page container fade-in">
            {/* Top breadcrumb / header */}
            {banner ? (
                <div className="page-hero-banner" style={{ backgroundImage: `url(${banner.image.startsWith('http') ? banner.image : `${window.API_BASE_URL}${banner.image}`})`, marginBottom: '40px' }}>
                    <div className="banner-overlay"></div>
                    <div className="banner-content">
                        <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
                            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)' }}>Home</Link> &gt; <span style={{ color: '#ffffff' }}>{currentCategory ? currentCategory.name : 'Collection'}</span>
                        </div>
                        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '2.5rem' }}>{currentCategory ? `${currentCategory.name} Collection` : 'Explore Collection'}</h1>
                        <p className="collection-count" style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginTop: '8px' }}>{categoryProducts.length} items found</p>
                    </div>
                </div>
            ) : (
                <div className="collection-header">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link> &gt; <span>{currentCategory ? currentCategory.name : 'Collection'}</span>
                    </div>
                    <h1 className="collection-title">
                        {currentCategory ? `${currentCategory.name} Collection` : 'Explore Collection'}
                    </h1>
                    <p className="collection-count">{categoryProducts.length} items found</p>
                </div>
            )}

            <div className="collection-layout">
                {/* Left Sidebar Filters */}
                <aside className="collection-sidebar">
                    <div className="sidebar-widget">
                        <h3>Categories</h3>
                        <ul className="sidebar-category-list">
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

                                const findNode = (nodes, id) => {
                                    for (let node of nodes) {
                                        if (node._id === id) return node;
                                        if (node.children && node.children.length > 0) {
                                            const found = findNode(node.children, id);
                                            if (found) return found;
                                        }
                                    }
                                    return null;
                                };

                                const renderTree = (nodes, level = 0) => {
                                    let items = [];
                                    nodes.forEach(cat => {
                                        items.push(
                                            <li key={cat._id} style={{ paddingLeft: `${level * 16}px` }}>
                                                <Link 
                                                    to={`/category/${cat.slug}`} 
                                                    className={currentCategory && currentCategory._id === cat._id ? 'active' : ''}
                                                    style={{ display: 'flex', alignItems: 'center' }}
                                                >
                                                    {level > 0 && <ChevronRight size={14} style={{ marginRight: '4px', color: '#888' }} />}
                                                    {cat.name}
                                                </Link>
                                            </li>
                                        );
                                        if (cat.children && cat.children.length > 0) {
                                            items = [...items, ...renderTree(cat.children, level + 1)];
                                        }
                                    });
                                    return items;
                                };

                                const tree = buildTree(categories);
                                let displayTree = tree;
                                
                                if (currentCategory) {
                                    const activeNode = findNode(tree, currentCategory._id);
                                    if (activeNode) {
                                        displayTree = [activeNode];
                                    }
                                }
                                
                                return renderTree(displayTree);
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
                                {/* Extract unique brands from category products */}
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
                <main className="collection-products">
                    {categoryProducts.length > 0 ? (
                        <div className="product-grid">
                            {categoryProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-products-state">
                            <h3>No Products Found</h3>
                            <p>We couldn't find any products in this category at the moment. Please explore our other collections.</p>
                            <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>Shop All Products</Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CategoryPage;
