import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Trash2, Plus, X, Percent, DollarSign, Edit } from 'lucide-react';
import './Admin.css';

const CouponList = () => {
    const [coupons, setCoupons] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userInfo } = useAuthStore();
    const { getCurrencySymbol } = useSettingsStore();
    const currencySymbol = getCurrencySymbol();

    // Form modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState('Percentage');
    const [value, setValue] = useState('');
    const [endDate, setEndDate] = useState('');
    const [usageLimit, setUsageLimit] = useState(100);
    const [minimumOrder, setMinimumOrder] = useState(0);
    const [appliesTo, setAppliesTo] = useState('All');
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isActive, setIsActive] = useState(true);
    const [productSearch, setProductSearch] = useState('');
    const [createError, setCreateError] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    const fetchCoupons = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/coupons`, config);
            setCoupons(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${window.API_BASE_URL}/api/products`);
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products', err);
        }
    };

    useEffect(() => {
        fetchCoupons();
        fetchProducts();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/coupons/${id}`, config);
                fetchCoupons();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditId('');
        setCode('');
        setType('Percentage');
        setValue('');
        setEndDate('');
        setUsageLimit(100);
        setMinimumOrder(0);
        setAppliesTo('All');
        setSelectedProductIds([]);
        setIsActive(true);
        setProductSearch('');
        setCreateError('');
        setShowModal(true);
    };

    const editHandler = (coupon) => {
        setIsEditMode(true);
        setEditId(coupon._id);
        setCode(coupon.code);
        setType(coupon.type);
        setValue(coupon.value);
        setEndDate(coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '');
        setUsageLimit(coupon.usageLimit);
        setMinimumOrder(coupon.minimumOrder);
        setAppliesTo(coupon.appliesTo || 'All');
        setSelectedProductIds(coupon.productIds || []);
        setIsActive(coupon.isActive !== undefined ? coupon.isActive : true);
        setProductSearch('');
        setCreateError('');
        setShowModal(true);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setCreateError('');
        setCreateLoading(true);

        if (!code || !value || !endDate) {
            setCreateError('Please fill in code, value, and expiry date.');
            setCreateLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            const payload = {
                code: code.trim().toUpperCase(),
                type,
                value: Number(value),
                endDate,
                usageLimit: Number(usageLimit),
                minimumOrder: Number(minimumOrder),
                appliesTo,
                productIds: appliesTo === 'Specific' ? selectedProductIds : [],
                isActive
            };

            if (isEditMode) {
                await axios.put(`${window.API_BASE_URL}/api/coupons/${editId}`, payload, config);
            } else {
                await axios.post(`${window.API_BASE_URL}/api/coupons`, payload, config);
            }

            setCreateLoading(false);
            setShowModal(false);
            fetchCoupons();
        } catch (err) {
            setCreateError(err.response?.data?.message || err.message);
            setCreateLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Coupons Manager</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                        Create and manage promotional discount codes
                    </p>
                </div>
                <button className="btn-primary" onClick={openCreateModal}>
                    <Plus size={20} /> Create Coupon
                </button>
            </div>

            {loading ? (
                <div className="loader">Loading coupons...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="table-container glass" style={{ padding: '0px' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>CODE</th>
                                <th>TYPE</th>
                                <th>DISCOUNT VALUE</th>
                                <th>APPLIES TO</th>
                                <th>EXPIRY DATE</th>
                                <th>MINIMUM ORDER</th>
                                <th>USAGE (USED/LIMIT)</th>
                                <th>STATUS</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => {
                                const isExpired = new Date() > new Date(coupon.endDate);
                                return (
                                    <tr key={coupon._id}>
                                        <td style={{ fontWeight: 700, letterSpacing: '0.5px' }}>{coupon.code}</td>
                                        <td>
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px',
                                                fontSize: '13px',
                                                color: coupon.type === 'Percentage' ? '#8b5cf6' : '#3b82f6'
                                            }}>
                                                {coupon.type === 'Percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                                                {coupon.type}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {coupon.type === 'Percentage' ? `${coupon.value}%` : `${currencySymbol}${coupon.value}`}
                                        </td>
                                        <td>
                                            <span style={{ 
                                                fontSize: '12px',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                background: coupon.appliesTo === 'Specific' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                color: coupon.appliesTo === 'Specific' ? '#60a5fa' : 'var(--text-secondary)'
                                            }}>
                                                {coupon.appliesTo === 'Specific' ? `Specific (${coupon.productIds?.length || 0})` : 'All Products'}
                                            </span>
                                        </td>
                                        <td>{new Date(coupon.endDate).toLocaleDateString()}</td>
                                        <td>{currencySymbol}{coupon.minimumOrder || 0}</td>
                                        <td>
                                            {coupon.usedCount} / {coupon.usageLimit}
                                        </td>
                                        <td>
                                            {isExpired ? (
                                                <span className="badge badge-danger">Expired</span>
                                            ) : coupon.isActive ? (
                                                <span className="badge badge-success">Active</span>
                                            ) : (
                                                <span className="badge badge-warning">Inactive</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-icon edit" onClick={() => editHandler(coupon)} title="Edit Coupon" style={{ marginRight: '8px' }}>
                                                <Edit size={18} />
                                            </button>
                                            <button className="btn-icon delete" onClick={() => deleteHandler(coupon._id)} title="Delete Coupon">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                                        No coupons created yet. Click "Create Coupon" to add one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Coupon Modal */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal glass" style={{ maxWidth: '600px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', margin: 0 }}>
                                {isEditMode ? 'Edit Discount Coupon' : 'Create Discount Coupon'}
                            </h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        {createError && <div className="error-message" style={{ marginBottom: '16px' }}>{createError}</div>}
                        <form onSubmit={submitHandler}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Coupon Code</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. SUMMER20" 
                                        value={code} 
                                        onChange={(e) => setCode(e.target.value)} 
                                        className="input-field"
                                        style={{ textTransform: 'uppercase' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Discount Type</label>
                                    <select value={type} onChange={(e) => setType(e.target.value)} className="filter-select" style={{ width: '100%', marginBottom: 0, color: '#000' }}>
                                        <option value="Percentage" style={{ color: '#000' }}>Percentage (%)</option>
                                        <option value="Flat" style={{ color: '#000' }}>Flat Amount ({currencySymbol})</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Discount Value</label>
                                    <input 
                                        type="number" 
                                        placeholder={type === 'Percentage' ? 'e.g. 20' : 'e.g. 15'} 
                                        value={value} 
                                        onChange={(e) => setValue(e.target.value)} 
                                        className="input-field"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Expiry Date</label>
                                    <input 
                                        type="date" 
                                        value={endDate} 
                                        onChange={(e) => setEndDate(e.target.value)} 
                                        className="input-field"
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Usage Limit</label>
                                    <input 
                                        type="number" 
                                        value={usageLimit} 
                                        onChange={(e) => setUsageLimit(e.target.value)} 
                                        className="input-field"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Min Order Amount</label>
                                    <input 
                                        type="number" 
                                        value={minimumOrder} 
                                        onChange={(e) => setMinimumOrder(e.target.value)} 
                                        className="input-field"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Applies To</label>
                                    <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} className="filter-select" style={{ width: '100%', marginBottom: 0, color: '#000' }}>
                                        <option value="All" style={{ color: '#000' }}>All Products</option>
                                        <option value="Specific" style={{ color: '#000' }}>Specific Products</option>
                                    </select>
                                </div>
                                {isEditMode && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Status</label>
                                        <select value={isActive} onChange={(e) => setIsActive(e.target.value === 'true')} className="filter-select" style={{ width: '100%', marginBottom: 0, color: '#000' }}>
                                            <option value="true" style={{ color: '#000' }}>Active</option>
                                            <option value="false" style={{ color: '#000' }}>Inactive</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Product Selector for Specific Products */}
                            {appliesTo === 'Specific' && (
                                <div style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Applicable Products</label>
                                    <input 
                                        type="text" 
                                        placeholder="Search products..." 
                                        value={productSearch} 
                                        onChange={(e) => setProductSearch(e.target.value)} 
                                        className="input-field"
                                        style={{ padding: '8px 12px', fontSize: '13px', marginBottom: '10px' }}
                                    />
                                    <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', background: 'rgba(0,0,0,0.1)' }}>
                                        {products
                                            .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                            .map(product => {
                                                const isChecked = selectedProductIds.includes(product._id);
                                                return (
                                                    <label key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                if (isChecked) {
                                                                    setSelectedProductIds(selectedProductIds.filter(id => id !== product._id));
                                                                } else {
                                                                    setSelectedProductIds([...selectedProductIds, product._id]);
                                                                }
                                                            }}
                                                        />
                                                        <span>{product.name}</span>
                                                    </label>
                                                );
                                            })}
                                        {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '10px', fontSize: '13px' }}>
                                                No products match search filter.
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>
                                        Selected: <strong>{selectedProductIds.length}</strong> products
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions" style={{ marginTop: '24px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '10px 20px' }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={createLoading} style={{ padding: '10px 24px' }}>
                                    {createLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponList;
