import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Save, Plus, Trash2, Edit, Package, Search, MapPin, CheckCircle, XCircle } from 'lucide-react';
import './ProductEdit.css'; 

const ShippingSettingsPage = () => {
    const { userInfo } = useAuthStore();
    
    // Master Switch State
    const [isShippingEnabled, setIsShippingEnabled] = useState(true);
    
    // Shipping Rules State
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        country: 'India',
        state: '',
        city: '',
        pincode: '',
        shippingCharge: 0,
        deliveryDays: '3-5 Days',
        status: true
    });

    useEffect(() => {
        fetchData();
    }, [userInfo]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const { data: settingsData } = await axios.get(`${window.API_BASE_URL}/api/settings/admin`, config);
            setIsShippingEnabled(settingsData.isShippingEnabled !== false);

            const { data: rulesData } = await axios.get(`${window.API_BASE_URL}/api/shipping-rules`, config);
            setRules(rulesData);
            
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMasterSwitchToggle = async () => {
        const newValue = !isShippingEnabled;
        setIsShippingEnabled(newValue);
        try {
            const config = {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.put(`${window.API_BASE_URL}/api/settings`, { isShippingEnabled: newValue }, config);
            await axios.post(`${window.API_BASE_URL}/api/settings/clear-cache`, {}, config);
        } catch (err) {
            alert('Failed to update master switch');
            setIsShippingEnabled(!newValue);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setEditingRule(null);
        setFormData({
            country: 'India',
            state: '',
            city: '',
            pincode: '',
            shippingCharge: 0,
            deliveryDays: '3-5 Days',
            status: true
        });
        setShowModal(true);
    };

    const openEditModal = (rule) => {
        setEditingRule(rule);
        setFormData({
            country: rule.country,
            state: rule.state,
            city: rule.city,
            pincode: rule.pincode,
            shippingCharge: rule.shippingCharge,
            deliveryDays: rule.deliveryDays,
            status: rule.status
        });
        setShowModal(true);
    };

    const saveRule = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            
            if (editingRule) {
                await axios.put(`${window.API_BASE_URL}/api/shipping-rules/${editingRule._id}`, formData, config);
            } else {
                await axios.post(`${window.API_BASE_URL}/api/shipping-rules`, formData, config);
            }
            
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const deleteRule = async (id) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/shipping-rules/${id}`, config);
                fetchData();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const toggleRuleStatus = async (rule) => {
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`${window.API_BASE_URL}/api/shipping-rules/${rule._id}`, { status: !rule.status }, config);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const filteredRules = rules.filter(r => 
        r.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.pincode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="product-edit-container fade-in" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        <Package size={32} color="var(--accent-color)" /> 
                        Shipping Settings
                    </h1>
                    <p className="page-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '16px', marginTop: '8px' }}>
                        Configure dynamic delivery charges based on precise pin codes and cities.
                    </p>
                </div>
            </div>

            {loading && !rules.length ? (
                <div className="loader-container" style={{ minHeight: '300px' }}><div className="loader"></div></div>
            ) : error ? (
                <div className="error-message" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '16px', borderRadius: '12px' }}>
                    {error}
                </div>
            ) : (
                <>
                    {/* Master Switch Section */}
                    <div className="glass-panel p-24" style={{ 
                        marginBottom: '32px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)',
                        borderRadius: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ 
                                width: '48px', height: '48px', borderRadius: '12px', 
                                background: isShippingEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                border: `1px solid ${isShippingEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}>
                                {isShippingEnabled ? <CheckCircle color="#10b981" size={24} /> : <XCircle color="#ef4444" size={24} />}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>Enable Shipping System</h2>
                                <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    When disabled, customers will experience <strong style={{ color: '#10b981' }}>Free Shipping</strong> globally on all orders.
                                </p>
                            </div>
                        </div>
                        <label className="switch" style={{ transform: 'scale(1.2)' }}>
                            <input type="checkbox" checked={isShippingEnabled} onChange={handleMasterSwitchToggle} />
                            <span className="slider round" style={{ boxShadow: isShippingEnabled ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none' }}></span>
                        </label>
                    </div>

                    {/* Rules Management Section */}
                    <div className="glass-panel p-24" style={{ borderRadius: '20px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ position: 'relative', width: '350px' }}>
                                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Search by City or Pincode..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ 
                                        margin: 0, 
                                        paddingLeft: '48px', 
                                        borderRadius: '30px', 
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        fontSize: '15px',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                            <button 
                                onClick={openAddModal} 
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', 
                                    background: 'var(--accent-color)', color: '#fff', 
                                    border: 'none', padding: '12px 24px', borderRadius: '30px', 
                                    fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--accent-rgb), 0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(var(--accent-rgb), 0.3)'; }}
                            >
                                <Plus size={18} /> Create New Rule
                            </button>
                        </div>

                        <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-primary)' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</th>
                                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Pincode</th>
                                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Charge</th>
                                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Delivery Estimate</th>
                                        <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                                        <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRules.map(rule => (
                                        <tr key={rule._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-primary)'}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>{rule.city}</span>
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{rule.state}, {rule.country}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'inline-block', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', letterSpacing: '1px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                                    {rule.pincode === '*' ? 'ALL PINCODES' : rule.pincode}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ fontWeight: '700', fontSize: '16px', color: rule.shippingCharge === 0 ? '#10b981' : 'var(--text-primary)' }}>
                                                    {rule.shippingCharge === 0 ? 'FREE' : `₹${rule.shippingCharge}`}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{rule.deliveryDays}</td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <button 
                                                    onClick={() => toggleRuleStatus(rule)}
                                                    style={{ 
                                                        background: rule.status ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: rule.status ? '#10b981' : '#ef4444',
                                                        border: `1px solid ${rule.status ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                                        padding: '6px 16px',
                                                        borderRadius: '20px',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                                                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                                                >
                                                    {rule.status ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => openEditModal(rule)} style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent-color)', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-color)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)'; e.currentTarget.style.color = 'var(--accent-color)'; }}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => deleteRule(rule._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRules.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-primary)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <MapPin size={32} color="var(--text-secondary)" />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '18px' }}>No Shipping Rules Found</h3>
                                                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>You haven't added any specific location rules yet.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Premium Modal */}
            {showModal && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', 
                    zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div className="glass-panel" style={{ 
                        width: '560px', maxWidth: '95%', padding: '32px', 
                        borderRadius: '24px', border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)',
                        background: 'var(--bg-primary)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {editingRule ? 'Edit Delivery Rule' : 'New Delivery Rule'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={saveRule}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Country</label>
                                    <input type="text" className="input-field" name="country" value={formData.country} onChange={handleFormChange} required style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>State</label>
                                    <input type="text" className="input-field" name="state" value={formData.state} onChange={handleFormChange} required style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>City Name</label>
                                    <input type="text" className="input-field" name="city" value={formData.city} onChange={handleFormChange} required placeholder="e.g. Mumbai" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Pincode (Use * for all)</label>
                                    <input type="text" className="input-field" name="pincode" value={formData.pincode} onChange={handleFormChange} required placeholder="e.g. 400001 or *" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Shipping Charge (₹)</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: '600' }}>₹</span>
                                        <input type="number" className="input-field" name="shippingCharge" value={formData.shippingCharge} onChange={handleFormChange} required min="0" style={{ paddingLeft: '32px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Est. Delivery Time</label>
                                    <input type="text" className="input-field" name="deliveryDays" value={formData.deliveryDays} onChange={handleFormChange} required placeholder="e.g. 2-4 Days" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-primary)' }}>Rule Status</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Inactive rules won't apply at checkout.</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" name="status" checked={formData.status} onChange={handleFormChange} />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px 24px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ background: 'var(--accent-color)', border: 'none', color: '#fff', padding: '12px 32px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--accent-rgb), 0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(var(--accent-rgb), 0.3)'; }}>
                                    {editingRule ? 'Update Rule' : 'Create Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShippingSettingsPage;
