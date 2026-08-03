import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Edit, Trash2, Plus } from 'lucide-react';
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

    const fetchProducts = async () => {
        try {
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
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Products</h1>
                <button className="btn-primary" onClick={createProductHandler}>
                    <Plus size={20} /> Create Product
                </button>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
                <input 
                    type="text" 
                    placeholder="Search products by ID, name, brand, or category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', marginBottom: 0 }}
                />
            </div>

            {loading ? <div className="loader">Loading...</div> : error ? <div className="error-message">{error}</div> : (
                <div className="table-container glass">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>IMAGE</th>
                                <th>NAME</th>
                                <th>PRICE</th>
                                <th>CATEGORY</th>
                                <th>BRAND</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProductsList.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <img 
                                            src={product.image?.startsWith('http') ? product.image : `${window.API_BASE_URL}${product.image}`} 
                                            alt={product.name} 
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{currencySymbol}{product.price}</td>
                                    <td>{product.category && typeof product.category === 'object' ? product.category.name : (product.category || 'N/A')}</td>
                                    <td>{product.brand && typeof product.brand === 'object' ? product.brand.name : (product.brand || 'N/A')}</td>
                                    <td>
                                        <Link to={`/admin/product/${product._id}/edit`}>
                                            <button className="btn-icon"><Edit size={20} /></button>
                                        </Link>
                                        <button className="btn-icon delete" onClick={() => deleteHandler(product._id)}>
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>No products found</td>
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
                                style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                            >
                                &larr; Prev
                            </button>
                            {[...Array(totalPages).keys()].map(x => (
                                <button 
                                    key={x + 1}
                                    onClick={() => handlePageChange(x + 1)}
                                    className={currentPage === x + 1 ? "btn-primary" : "btn-secondary"}
                                    style={{ 
                                        width: '28px', 
                                        height: '28px', 
                                        borderRadius: '4px', 
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
                                style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductList;
