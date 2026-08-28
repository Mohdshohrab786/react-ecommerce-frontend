import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { 
    Edit, 
    Trash2, 
    Plus, 
    Download, 
    UploadCloud, 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    X,
    RotateCw,
    Package
} from 'lucide-react';
import { exportProductsToCSV, downloadSampleProductTemplate, parseProductCSV } from '../../utils/productCsvUtils';
import './Admin.css';

const ProductList = () => {
    const { getCurrencySymbol, settings } = useSettingsStore();
    const currencySymbol = getCurrencySymbol();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userInfo } = useAuthStore();
    const navigate = useNavigate();

    // Search and Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    // Bulk Import Modal States
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [parsedProducts, setParsedProducts] = useState([]);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState(null);
    const [importResult, setImportResult] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${window.API_BASE_URL}/api/products`);
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Reset pagination to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/products/${id}`, config);
                fetchProducts();
            } catch (err) {
                alert(err.response && err.response.data.message ? err.response.data.message : err.message);
            }
        }
    };

    const createProductHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/products`, {}, config);
            navigate(`/admin/product/${data._id}/edit`);
        } catch (err) {
            alert(err.response && err.response.data.message ? err.response.data.message : err.message);
        }
    };

    // File selection & CSV parsing
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFileName(file.name);
        setImportError(null);
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const items = parseProductCSV(text);
                if (items.length === 0) {
                    setImportError('No valid product rows found in this CSV file. Please check column headers.');
                    setParsedProducts([]);
                } else {
                    setParsedProducts(items);
                }
            } catch (err) {
                setImportError(err.message || 'Failed to parse CSV file.');
                setParsedProducts([]);
            }
        };
        reader.readAsText(file);
    };

    // Confirm Bulk Upload to Backend
    const handleConfirmImport = async () => {
        if (!parsedProducts || parsedProducts.length === 0) return;

        try {
            setImporting(true);
            setImportError(null);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/products/bulk-import`, { products: parsedProducts }, config);
            
            setImportResult(data);
            fetchProducts();
        } catch (err) {
            setImportError(err.response?.data?.message || err.message || 'Failed to import products.');
        } finally {
            setImporting(false);
        }
    };

    const closeImportModal = () => {
        setImportModalOpen(false);
        setParsedProducts([]);
        setSelectedFileName('');
        setImportError(null);
        setImportResult(null);
    };

    // Filter products based on search term
    const filteredProducts = products.filter(product => {
        const matchesName = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const brandName = product.brand && typeof product.brand === 'object' ? product.brand.name : product.brand;
        const matchesBrand = brandName ? brandName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const categoryName = product.category && typeof product.category === 'object' ? product.category.name : product.category;
        const matchesCategory = categoryName ? categoryName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        return matchesName || matchesBrand || matchesCategory || product._id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Pagination calculations
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProductsList = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="fade-in pb-8">
            {/* Header with Title and Import / Export Actions */}
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Package size={24} color="var(--accent-color)" /> Products ({products.length})
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Manage product inventory, export CSV data, or bulk import new items.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => exportProductsToCSV(products, 'shahi_store_products')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
                        title="Download all products in CSV format"
                    >
                        <Download size={15} /> Export CSV ({products.length})
                    </button>

                    <button 
                        type="button" 
                        className="btn-primary" 
                        onClick={() => setImportModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                        title="Upload products via CSV file"
                    >
                        <UploadCloud size={16} /> Import CSV
                    </button>

                    <button className="btn-primary" onClick={createProductHandler} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}>
                        <Plus size={16} /> Create Product
                    </button>
                </div>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '20px', maxWidth: '440px' }}>
                <input 
                    type="text" 
                    placeholder="Search products by ID, name, brand, or category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', marginBottom: 0 }}
                />
            </div>

            {loading ? <div className="loader">Loading products...</div> : error ? <div className="error-message">{error}</div> : (
                <div className="table-container glass" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>IMAGE</th>
                                <th>NAME</th>
                                <th>PRICE</th>
                                <th>STOCK</th>
                                <th>CATEGORY</th>
                                <th>BRAND</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProductsList.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <img 
                                            src={product.image?.startsWith('http') ? product.image : `${window.API_BASE_URL}${product.image || '/images/sample.jpg'}`} 
                                            alt={product.name} 
                                            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                            onError={(e) => { e.target.src = '/images/sample.jpg'; }}
                                        />
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{product.sku ? `SKU: ${product.sku}` : `ID: ${product._id.substring(0, 8)}`}</div>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>
                                        {currencySymbol}{product.price?.toFixed(2)}
                                        {product.discount > 0 && (
                                            <span style={{ fontSize: '11px', color: '#10b981', marginLeft: '6px', fontWeight: 600 }}>
                                                ({product.discount}% OFF)
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {product.countInStock > 0 ? (
                                            <span className="badge badge-success">{product.countInStock} In Stock</span>
                                        ) : (
                                            <span className="badge badge-danger">Out of Stock</span>
                                        )}
                                    </td>
                                    <td>{product.category && typeof product.category === 'object' ? product.category.name : (product.category || 'N/A')}</td>
                                    <td>{product.brand && typeof product.brand === 'object' ? product.brand.name : (product.brand || 'N/A')}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                                            <Link to={`/admin/product/${product._id}/edit`}>
                                                <button className="btn-icon" title="Edit Product"><Edit size={16} /></button>
                                            </Link>
                                            <button className="btn-icon delete" onClick={() => deleteHandler(product._id)} title="Delete Product">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                                        No products found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '20px 0 10px 0', borderTop: '1px solid var(--border-color)' }}>
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                            >
                                &larr; Prev
                            </button>
                            {[...Array(totalPages).keys()].map(x => (
                                <button 
                                    key={x + 1}
                                    onClick={() => handlePageChange(x + 1)}
                                    className={currentPage === x + 1 ? "btn-primary" : "btn-secondary"}
                                    style={{ 
                                        width: '30px', 
                                        height: '30px', 
                                        borderRadius: '6px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '12px', 
                                        fontWeight: 600,
                                        padding: 0,
                                        cursor: 'pointer' 
                                    }}
                                >
                                    {x + 1}
                                </button>
                            ))}
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Bulk Product CSV Import Modal */}
            {importModalOpen && (
                <div className="admin-modal-overlay" style={{ zIndex: 1600 }}>
                    <div className="admin-modal" style={{ maxWidth: '640px', width: '92%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
                            <h2 style={{ fontSize: '19px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                                <UploadCloud size={22} color="#10b981" /> Bulk Import Products (CSV)
                            </h2>
                            <button onClick={closeImportModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Step 1: Download Sample Template */}
                        <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '14px 16px', borderRadius: '10px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>Need a sample CSV format?</strong>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Download ready-to-fill sample template with all columns.</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={downloadSampleProductTemplate} 
                                className="btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <Download size={13} /> Sample Template
                            </button>
                        </div>

                        {/* Step 2: Upload File Box */}
                        {!importResult && (
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                                    Select Product CSV File:
                                </label>
                                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', position: 'relative' }}>
                                    <input 
                                        type="file" 
                                        accept=".csv, text/csv" 
                                        onChange={handleFileChange}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                    />
                                    <FileText size={32} color="var(--accent-color)" style={{ margin: '0 auto 8px', display: 'block' }} />
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {selectedFileName ? `Selected: ${selectedFileName}` : 'Click or Drag & Drop .CSV file here'}
                                    </p>
                                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                                        Supports UTF-8 CSV with Product Name, Price, Stock, Category, Brand, Description
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Error Message Display */}
                        {importError && (
                            <div className="error-message" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} /> {importError}
                            </div>
                        )}

                        {/* Success Result Display */}
                        {importResult && (
                            <div style={{ padding: '18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', marginBottom: '18px', textAlign: 'center' }}>
                                <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 8px', display: 'block' }} />
                                <strong style={{ fontSize: '15px', color: '#10b981', display: 'block', marginBottom: '6px' }}>
                                    {importResult.message}
                                </strong>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                                    {importResult.createdCount} new products created, {importResult.updatedCount} existing products updated.
                                </p>
                            </div>
                        )}

                        {/* Preview of Parsed Products */}
                        {parsedProducts.length > 0 && !importResult && (
                            <div style={{ marginBottom: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#10b981' }}>
                                        ✓ Found {parsedProducts.length} products ready to upload
                                    </span>
                                </div>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.04)', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th style={{ padding: '6px 10px', textAlign: 'left' }}>#</th>
                                                <th style={{ padding: '6px 10px', textAlign: 'left' }}>Product Name</th>
                                                <th style={{ padding: '6px 10px', textAlign: 'right' }}>Price</th>
                                                <th style={{ padding: '6px 10px', textAlign: 'center' }}>Stock</th>
                                                <th style={{ padding: '6px 10px', textAlign: 'left' }}>Category</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedProducts.slice(0, 10).map((p, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{idx + 1}</td>
                                                    <td style={{ padding: '6px 10px', fontWeight: 500 }}>{p.name}</td>
                                                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>{currencySymbol}{p.price}</td>
                                                    <td style={{ padding: '6px 10px', textAlign: 'center' }}>{p.countInStock}</td>
                                                    <td style={{ padding: '6px 10px' }}>{p.category || 'Default'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {parsedProducts.length > 10 && (
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', textAlign: 'right' }}>
                                        + {parsedProducts.length - 10} more items in file
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Modal Footer Actions */}
                        <div className="modal-actions" style={{ marginTop: '16px' }}>
                            <button 
                                type="button" 
                                onClick={closeImportModal} 
                                className="btn-secondary"
                                disabled={importing}
                            >
                                {importResult ? 'Done' : 'Cancel'}
                            </button>

                            {!importResult && (
                                <button 
                                    type="button" 
                                    onClick={handleConfirmImport} 
                                    className="btn-primary"
                                    style={{ backgroundColor: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    disabled={importing || parsedProducts.length === 0}
                                >
                                    {importing ? (
                                        <>
                                            <RotateCw size={14} className="animate-spin" /> Importing Products...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud size={15} /> Upload & Import ({parsedProducts.length})
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
