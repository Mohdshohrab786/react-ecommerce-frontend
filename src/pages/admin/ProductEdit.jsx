import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Save, ArrowLeft, Image as ImageIcon, Tag, DollarSign, BarChart2, CheckCircle2, Box, X } from 'lucide-react';
import './ProductEdit.css';

const ProductEdit = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const { getCurrencySymbol } = useSettingsStore();

    // Basic
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [sku, setSku] = useState('');
    const [barcode, setBarcode] = useState('');
    const [description, setDescription] = useState('');
    
    // Pricing
    const [price, setPrice] = useState(0);
    const [salePrice, setSalePrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [gstPercentage, setGstPercentage] = useState(0);
    
    // Inventory
    const [countInStock, setCountInStock] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isTrending, setIsTrending] = useState(false);

    // Taxonomy
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    
    // Media
    const [image, setImage] = useState('');
    const [gallery, setGallery] = useState([]);
    
    // SEO
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');

    // Variations
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState([]);

    // Sizes
    const [sizes, setSizes] = useState([]);
    const [customSizeInput, setCustomSizeInput] = useState('');

    // Related Products
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [relatedCategoryFilter, setRelatedCategoryFilter] = useState('');

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                
                const [productRes, catRes, brandRes, allProdsRes] = await Promise.all([
                    axios.get(`${window.API_BASE_URL}/api/products/${productId}`),
                    axios.get(`${window.API_BASE_URL}/api/categories`),
                    axios.get(`${window.API_BASE_URL}/api/brands`),
                    axios.get(`${window.API_BASE_URL}/api/products`)
                ]);

                setCategories(catRes.data);
                setBrands(brandRes.data);
                
                // Exclude current product from allProducts list
                setAllProducts(allProdsRes.data.filter(p => p._id !== productId));

                const product = productRes.data;
                setName(product.name || '');
                setSlug(product.slug || '');
                setSku(product.sku || '');
                setBarcode(product.barcode || '');
                setDescription(product.description || '');
                setPrice(product.price || 0);
                setSalePrice(product.salePrice || 0);
                setDiscount(product.discount || 0);
                setGstPercentage(product.gstPercentage || 0);
                setCountInStock(product.countInStock || 0);
                setIsActive(product.isActive !== undefined ? product.isActive : true);
                setIsFeatured(product.isFeatured || false);
                setIsTrending(product.isTrending || false);
                setBrand(product.brand?._id || product.brand || '');
                setCategory(product.category?._id || product.category || '');
                if (product.subCategories && product.subCategories.length > 0) {
                    setSubCategories(product.subCategories.map(c => typeof c === 'object' ? c._id : c));
                }
                setImage(product.image || '');
                setGallery(product.gallery || []);
                setHasVariants(product.hasVariants || false);
                setVariants(product.variants || []);
                setSizes(product.sizes || []);
                
                if (product.relatedProducts && product.relatedProducts.length > 0) {
                    setRelatedProducts(product.relatedProducts.map(p => typeof p === 'object' ? p._id : p));
                }
                
                if (product.seo) {
                    setSeoTitle(product.seo.title || '');
                    setSeoDescription(product.seo.description || '');
                    setSeoKeywords(product.seo.keywords || '');
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchData();
    }, [productId, userInfo.token]);


    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const productData = {
                name, slug, sku, barcode, description,
                price, salePrice, discount, gstPercentage,
                countInStock, isActive, isFeatured, isTrending,
                image, gallery: gallery,
                seo: { title: seoTitle, description: seoDescription, keywords: seoKeywords },
                hasVariants, variants, sizes, relatedProducts, subCategories
            };

            if (brand) productData.brand = brand;
            if (category) productData.category = category;

            await axios.put(`${window.API_BASE_URL}/api/products/${productId}`, productData, config);
            
            setUpdateLoading(false);
            navigate('/admin/productlist');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setUpdateLoading(false);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/upload?folder=products`, formData, config);
            setImage(data.image);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || error.message);
        }
    };

    const uploadGalleryHandler = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('image', files[i]);
            try {
                const config = {
                    headers: { 'Content-Type': 'multipart/form-data' }
                };
                const { data } = await axios.post(`${window.API_BASE_URL}/api/upload?folder=products`, formData, config);
                uploadedUrls.push(data.image);
            } catch (error) {
                console.error('Gallery image upload failed', error);
            }
        }

        if (uploadedUrls.length > 0) {
            setGallery(prev => [...prev, ...uploadedUrls]);
        }
    };

    const removeGalleryImage = (indexToRemove) => {
        setGallery(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const addVariantHandler = () => {
        setVariants(prev => [...prev, { colorName: '', colorCode: '#000000', price: 0, countInStock: 0, image: '' }]);
    };

    const removeVariantHandler = (indexToRemove) => {
        setVariants(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const updateVariantField = (index, field, value) => {
        setVariants(prev => prev.map((variant, i) => i === index ? { ...variant, [field]: value } : variant));
    };

    const uploadVariantImageHandler = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/upload?folder=products`, formData, config);
            updateVariantField(index, 'image', data.image);
        } catch (error) {
            console.error('Variant image upload failed', error);
            alert(error.response?.data?.message || error.message);
        }
    };

    if (loading) return <div className="loader container">Loading Product Data...</div>;

    return (
        <div className="fade-in pb-8">
            <form onSubmit={submitHandler}>
                <div className="admin-header glass-panel">
                    <div className="header-content">
                        <div>
                            <Link to="/admin/productlist" className="back-link">
                                <ArrowLeft size={16} /> Back to Products
                            </Link>
                            <h1 className="page-title">Edit Product</h1>
                        </div>
                        <div className="header-actions">
                            <button type="submit" className="btn-primary" disabled={updateLoading}>
                                <Save size={18} />
                                {updateLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="modern-grid">
                    {/* LEFT COLUMN - MAIN DETAILS */}
                    <div className="grid-left">
                        {/* Basic Info */}
                        <div className="modern-card">
                            <div className="card-header">
                                <Box size={20} className="card-icon" />
                                <h2>Basic Information</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" className="modern-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. iPhone 15 Pro" />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea className="modern-input" rows="6" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Enter product description here..."></textarea>
                                </div>
                                <div className="grid-2-cols">
                                    <div className="form-group">
                                        <label>Slug (URL Friendly)</label>
                                        <input type="text" className="modern-input" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="iphone-15-pro" />
                                    </div>
                                    <div className="form-group">
                                        <label>SKU</label>
                                        <input type="text" className="modern-input" value={sku} onChange={e => setSku(e.target.value)} placeholder="IPH-15P-256" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="modern-card">
                            <div className="card-header">
                                <ImageIcon size={20} className="card-icon" />
                                <h2>Media & Gallery</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Main Image Upload / URL</label>
                                    <div className="input-with-preview">
                                        <input type="text" className="modern-input" value={image} onChange={e => setImage(e.target.value)} required placeholder="Image Path or URL" />
                                        <input type="file" className="modern-input" onChange={uploadFileHandler} style={{ marginTop: '10px' }} accept="image/*" />
                                        {image && <img src={image.startsWith('http') ? image : `${window.API_BASE_URL}${image}`} alt="Preview" className="img-preview" />}
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label>Product Gallery (Multiple Images)</label>
                                    <input 
                                        type="file" 
                                        className="modern-input" 
                                        onChange={uploadGalleryHandler} 
                                        multiple 
                                        accept="image/*" 
                                    />
                                    {gallery.length > 0 && (
                                        <div className="gallery-preview-grid">
                                            {gallery.map((imgUrl, index) => (
                                                <div key={index} className="gallery-preview-item">
                                                    <img 
                                                        src={imgUrl.startsWith('http') ? imgUrl : `${window.API_BASE_URL}${imgUrl}`} 
                                                        alt={`gallery-${index}`} 
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeGalleryImage(index)} 
                                                        className="gallery-remove-btn"
                                                        title="Remove Image"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Optional Product Sizes */}
                        <div className="modern-card">
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Tag size={20} className="card-icon" />
                                    <h2>Product Sizes (Optional)</h2>
                                </div>
                            </div>
                            <div className="card-body">
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                                    Select the sizes available for this product. If no sizes are selected, the size selector will be hidden on the product page.
                                </p>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                                    {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((sz) => {
                                        const isSelected = sizes.includes(sz);
                                        return (
                                            <button
                                                type="button"
                                                key={sz}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSizes(prev => prev.filter(s => s !== sz));
                                                    } else {
                                                        setSizes(prev => [...prev, sz]);
                                                    }
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    border: isSelected ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                                                    background: isSelected ? 'var(--accent-color)' : 'transparent',
                                                    color: '#fff',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {sz}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Add custom size (e.g. 28, 32, 8, 9.5)" 
                                        value={customSizeInput}
                                        onChange={(e) => setCustomSizeInput(e.target.value)}
                                        className="input-field"
                                        style={{ marginBottom: 0, flex: 1 }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const cleanSize = customSizeInput.trim();
                                            if (cleanSize && !sizes.includes(cleanSize)) {
                                                setSizes(prev => [...prev, cleanSize]);
                                                setCustomSizeInput('');
                                            }
                                        }}
                                        className="btn-secondary"
                                        style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}
                                    >
                                        Add Size
                                    </button>
                                </div>

                                {sizes.length > 0 && (
                                    <div>
                                        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Active Sizes:</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {sizes.map((sz, idx) => (
                                                <span 
                                                    key={idx}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 10px',
                                                        background: 'rgba(255,255,255,0.08)',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}
                                                >
                                                    {sz}
                                                    <X 
                                                        size={14} 
                                                        style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }} 
                                                        onClick={() => setSizes(prev => prev.filter(s => s !== sz))}
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Variations */}
                        <div className="modern-card">
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Tag size={20} className="card-icon" />
                                    <h2>Product Variations</h2>
                                </div>
                                <label className="modern-toggle" style={{ margin: 0, padding: 0 }}>
                                    <input 
                                        type="checkbox" 
                                        checked={hasVariants} 
                                        onChange={(e) => setHasVariants(e.target.checked)} 
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="card-body">
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                                    Enable variations if this design has multiple colors. Each color variation can have its own price, stock count, and specific image.
                                </p>
                                
                                {hasVariants && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {variants.map((variant, index) => (
                                            <div key={index} style={{
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                background: 'rgba(0, 0, 0, 0.1)',
                                                padding: '20px',
                                                position: 'relative'
                                            }}>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeVariantHandler(index)}
                                                    className="gallery-remove-btn"
                                                    style={{ top: '10px', right: '10px' }}
                                                    title="Remove Variant"
                                                >
                                                    <X size={12} />
                                                </button>
                                                
                                                <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>
                                                    Variant #{index + 1}
                                                </h4>
                                                
                                                <div className="grid-2-cols" style={{ marginBottom: '16px' }}>
                                                    <div className="form-group">
                                                        <label>Color Name</label>
                                                        <input 
                                                            type="text" 
                                                            className="modern-input" 
                                                            value={variant.colorName} 
                                                            onChange={e => updateVariantField(index, 'colorName', e.target.value)} 
                                                            required
                                                            placeholder="e.g. Space Gray" 
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Color Code (Hex/ColorPicker)</label>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <input 
                                                                type="color" 
                                                                className="modern-input" 
                                                                value={variant.colorCode || '#000000'} 
                                                                onChange={e => updateVariantField(index, 'colorCode', e.target.value)} 
                                                                style={{ width: '48px', padding: '0', height: '48px', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                                            />
                                                            <input 
                                                                type="text" 
                                                                className="modern-input" 
                                                                value={variant.colorCode} 
                                                                onChange={e => updateVariantField(index, 'colorCode', e.target.value)} 
                                                                required
                                                                placeholder="#53565a" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid-2-cols" style={{ marginBottom: '16px' }}>
                                                    <div className="form-group">
                                                        <label>Variant Price ({getCurrencySymbol()})</label>
                                                        <input 
                                                            type="number" 
                                                            className="modern-input" 
                                                            value={variant.price} 
                                                            onChange={e => updateVariantField(index, 'price', Number(e.target.value))} 
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Stock Count</label>
                                                        <input 
                                                            type="number" 
                                                            className="modern-input" 
                                                            value={variant.countInStock} 
                                                            onChange={e => updateVariantField(index, 'countInStock', Number(e.target.value))} 
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                    <label>Variant Specific Image</label>
                                                    <div className="input-with-preview">
                                                        <input 
                                                            type="text" 
                                                            className="modern-input" 
                                                            value={variant.image} 
                                                            onChange={e => updateVariantField(index, 'image', e.target.value)} 
                                                            required
                                                            placeholder="Image Path or URL" 
                                                        />
                                                        <input 
                                                            type="file" 
                                                            className="modern-input" 
                                                            onChange={e => uploadVariantImageHandler(e, index)} 
                                                            accept="image/*" 
                                                        />
                                                        {variant.image && (
                                                            <img 
                                                                src={variant.image.startsWith('http') ? variant.image : `${window.API_BASE_URL}${variant.image}`} 
                                                                alt="Variant Preview" 
                                                                className="img-preview" 
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <button 
                                            type="button" 
                                            onClick={addVariantHandler}
                                            className="btn-secondary"
                                            style={{ width: '100%', padding: '12px 24px', fontSize: '14px', borderStyle: 'dashed' }}
                                        >
                                            + Add Variant
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="modern-card">
                            <div className="card-header">
                                <BarChart2 size={20} className="card-icon" />
                                <h2>Search Engine Optimization</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Meta Title</label>
                                    <input type="text" className="modern-input" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Buy iPhone 15 Pro Online" />
                                </div>
                                <div className="form-group">
                                    <label>Meta Description</label>
                                    <textarea className="modern-input" rows="2" value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder="Get the best deals on iPhone 15 Pro..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - PRICING, ORG, STATUS */}
                    <div className="grid-right">
                        {/* Pricing */}
                        <div className="modern-card">
                            <div className="card-header">
                                <DollarSign size={20} className="card-icon" />
                                <h2>Pricing & Stock</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Base Price ({getCurrencySymbol()})</label>
                                    <input type="number" className="modern-input lg-price" value={price} onChange={e => setPrice(Number(e.target.value))} required />
                                </div>
                                <div className="grid-2-cols">
                                    <div className="form-group">
                                        <label>Sale Price ({getCurrencySymbol()})</label>
                                        <input type="number" className="modern-input" value={salePrice} onChange={e => setSalePrice(Number(e.target.value))} />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount (%)</label>
                                        <input type="number" className="modern-input" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="grid-2-cols">
                                    <div className="form-group">
                                        <label>GST/Tax (%)</label>
                                        <input type="number" className="modern-input" value={gstPercentage} onChange={e => setGstPercentage(Number(e.target.value))} />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock Count</label>
                                        <input type="number" className="modern-input stock-input" value={countInStock} onChange={e => setCountInStock(Number(e.target.value))} required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Organization */}
                        <div className="modern-card">
                            <div className="card-header">
                                <Tag size={20} className="card-icon" />
                                <h2>Organization</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Main Category</label>
                                    <select className="modern-select" value={category} onChange={e => setCategory(e.target.value)}>
                                        <option value="">Select a Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Sub Categories / Additional Categories</label>
                                    <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {(() => {
                                            // Build Tree
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
                                            
                                            const catTree = buildTree(categories.filter(c => c._id !== category)); // Exclude main category from tree

                                            const renderCheckboxTree = (nodes, level = 0) => {
                                                return nodes.map(cat => (
                                                    <div key={cat._id} style={{ display: 'flex', flexDirection: 'column', marginTop: level === 0 ? '8px' : '4px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', paddingLeft: `${level * 24}px` }}>
                                                            {level > 0 && <span style={{ color: 'var(--text-secondary)', marginRight: '-4px' }}>└</span>}
                                                            <input 
                                                                type="checkbox" 
                                                                checked={subCategories.includes(cat._id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSubCategories(prev => [...prev, cat._id]);
                                                                    } else {
                                                                        setSubCategories(prev => prev.filter(id => id !== cat._id));
                                                                    }
                                                                }}
                                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                            />
                                                            <span style={{ fontSize: '14px', color: level === 0 ? '#fff' : 'var(--text-secondary)', fontWeight: level === 0 ? '600' : '400' }}>
                                                                {cat.name}
                                                            </span>
                                                        </label>
                                                        {cat.children && cat.children.length > 0 && (
                                                            <div style={{ marginTop: '4px' }}>
                                                                {renderCheckboxTree(cat.children, level + 1)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ));
                                            };

                                            return catTree.length > 0 ? renderCheckboxTree(catTree) : <span style={{ color: 'var(--text-secondary)' }}>No additional categories available.</span>;
                                        })()}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Brand</label>
                                    <select className="modern-select" value={brand} onChange={e => setBrand(e.target.value)}>
                                        <option value="">Select a Brand</option>
                                        {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="modern-card">
                            <div className="card-header">
                                <CheckCircle2 size={20} className="card-icon" />
                                <h2>Visibility & Flags</h2>
                            </div>
                            <div className="card-body">
                                <label className="modern-toggle">
                                    <div className="toggle-text">
                                        <strong>Active Product</strong>
                                        <span>Visible to customers</span>
                                    </div>
                                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                                
                                <div className="divider"></div>

                                <label className="modern-toggle">
                                    <div className="toggle-text">
                                        <strong>Featured</strong>
                                        <span>Show on homepage slider</span>
                                    </div>
                                    <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                                    <span className="slider"></span>
                                </label>

                                <div className="divider"></div>

                                <label className="modern-toggle">
                                    <div className="toggle-text">
                                        <strong>Trending</strong>
                                        <span>Add trending badge</span>
                                    </div>
                                    <input type="checkbox" checked={isTrending} onChange={e => setIsTrending(e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>

                        {/* Related Products */}
                        <div className="modern-card">
                            <div className="card-header">
                                <Box size={20} className="card-icon" />
                                <h2>Related Products</h2>
                            </div>
                            <div className="card-body">
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>
                                    Filter by category to find and select products to show in the "Related Products" section on this product's page.
                                </p>
                                
                                <select 
                                    className="modern-select" 
                                    style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)' }}
                                    value={relatedCategoryFilter}
                                    onChange={(e) => setRelatedCategoryFilter(e.target.value)}
                                >
                                    <option value="" style={{ color: '#000' }}>All Categories</option>
                                    {categories.map(c => <option key={c._id} value={c._id} style={{ color: '#000' }}>{c.name}</option>)}
                                </select>

                                <div style={{ 
                                    maxHeight: '250px', 
                                    overflowY: 'auto', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}>
                                    {(() => {
                                        const filteredProducts = relatedCategoryFilter 
                                            ? allProducts.filter(p => (p.category?._id === relatedCategoryFilter) || (p.category === relatedCategoryFilter)) 
                                            : allProducts;
                                        
                                        if (filteredProducts.length === 0) {
                                            return <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>No products available in this category.</div>;
                                        }

                                        return filteredProducts.map(p => (
                                            <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={relatedProducts.includes(p._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setRelatedProducts(prev => [...prev, p._id]);
                                                        } else {
                                                            setRelatedProducts(prev => prev.filter(id => id !== p._id));
                                                        }
                                                    }}
                                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <img src={p.image?.startsWith('http') ? p.image : `${window.API_BASE_URL}${p.image}`} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                                                    <span style={{ fontSize: '14px', color: '#fff' }}>{p.name}</span>
                                                </div>
                                            </label>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;
