import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Save, CreditCard, ShieldCheck } from 'lucide-react';
import './ProductEdit.css'; // Re-use the premium CSS

const PaymentSettingsPage = () => {
    const { userInfo } = useAuthStore();

    // DYNAMIC PAYMENT GATEWAYS
    const [activePaymentGateway, setActivePaymentGateway] = useState('None');
    const [isCodEnabled, setIsCodEnabled] = useState(true);
    
    // 1. Razorpay
    const [razorpayKeyId, setRazorpayKeyId] = useState('');
    const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
    const [razorpayEnvironment, setRazorpayEnvironment] = useState('TEST');

    // 2. PhonePe
    const [phonePeMerchantId, setPhonePeMerchantId] = useState('');
    const [phonePeSaltKey, setPhonePeSaltKey] = useState('');
    const [phonePeSaltIndex, setPhonePeSaltIndex] = useState('');
    const [phonePeEnvironment, setPhonePeEnvironment] = useState('TEST');

    // 3. Cashfree
    const [cashfreeAppId, setCashfreeAppId] = useState('');
    const [cashfreeSecretKey, setCashfreeSecretKey] = useState('');
    const [cashfreeEnvironment, setCashfreeEnvironment] = useState('TEST');

    // UI Tab state
    const [activeGatewayTab, setActiveGatewayTab] = useState('razorpay');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                };
                const { data } = await axios.get(`${window.API_BASE_URL}/api/settings/admin`, config);
                if (data) {
                    setActivePaymentGateway(data.activePaymentGateway || 'None');
                    setIsCodEnabled(data.isCodEnabled !== false);
                    setRazorpayKeyId(data.razorpayKeyId || '');
                    setRazorpayKeySecret(data.razorpayKeySecret || '');
                    setRazorpayEnvironment(data.razorpayEnvironment || 'TEST');
                    setPhonePeMerchantId(data.phonePeMerchantId || '');
                    setPhonePeSaltKey(data.phonePeSaltKey || '');
                    setPhonePeSaltIndex(data.phonePeSaltIndex || '');
                    setPhonePeEnvironment(data.phonePeEnvironment || 'TEST');
                    setCashfreeAppId(data.cashfreeAppId || '');
                    setCashfreeSecretKey(data.cashfreeSecretKey || '');
                    setCashfreeEnvironment(data.cashfreeEnvironment || 'TEST');
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const settingsData = {
                activePaymentGateway,
                isCodEnabled,
                razorpayKeyId, razorpayKeySecret, razorpayEnvironment,
                phonePeMerchantId, phonePeSaltKey, phonePeSaltIndex, phonePeEnvironment,
                cashfreeAppId, cashfreeSecretKey, cashfreeEnvironment,
            };

            await axios.put(`${window.API_BASE_URL}/api/settings`, settingsData, config);
            
            // Sync settings store in memory instantly so Checkout updates
            await useSettingsStore.getState().fetchSettings();
            
            alert('Payment settings updated successfully!');
            setUpdateLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setUpdateLoading(false);
        }
    };

    if (loading) return <div className="loader container">Loading Payment Settings...</div>;

    return (
        <div className="fade-in pb-8">
            <form onSubmit={submitHandler}>
                <div className="admin-header glass-panel">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">Payment Configurations</h1>
                        </div>
                        <div className="header-actions">
                            <button type="submit" className="btn-primary" disabled={updateLoading}>
                                <Save size={18} />
                                {updateLoading ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="modern-grid">
                    {/* LEFT COLUMN: ACTIVE SWITCHES */}
                    <div className="grid-left">
                        {/* active settings */}
                        <div className="modern-card" style={{ marginBottom: '24px', border: '1px solid #f28b00' }}>
                            <div className="card-header" style={{ borderBottom: '1px solid #f28b00' }}>
                                <ShieldCheck size={20} className="card-icon" style={{ color: '#f28b00' }} />
                                <h2>Payment Mode Status</h2>
                            </div>
                            <div className="card-body" style={{ background: '#fffcf5' }}>
                                
                                {/* Online gateway selection */}
                                <div className="form-group">
                                    <label style={{ fontWeight: '600', color: '#555' }}>Active Online Gateway</label>
                                    <select 
                                        className="modern-select" 
                                        value={activePaymentGateway} 
                                        onChange={e => setActivePaymentGateway(e.target.value)}
                                        style={{ border: '2px solid #f28b00', fontWeight: 'bold' }}
                                    >
                                        <option value="None">None (Online Payments Disabled)</option>
                                        <option value="Razorpay">Razorpay</option>
                                        <option value="PhonePe">PhonePe</option>
                                        <option value="Cashfree">Cashfree</option>
                                    </select>
                                </div>

                                {/* COD Status Select Dropdown */}
                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label style={{ fontWeight: '600', color: '#555' }}>Cash On Delivery (COD) Status</label>
                                    <select 
                                        className="modern-select" 
                                        value={isCodEnabled ? 'true' : 'false'} 
                                        onChange={e => setIsCodEnabled(e.target.value === 'true')}
                                    >
                                        <option value="true">Enabled (Active)</option>
                                        <option value="false">Disabled (Inactive)</option>
                                    </select>
                                </div>

                                <p style={{ fontSize: '11px', color: '#f28b00', marginTop: '14px', lineHeight: '1.4' }}>
                                    💡 <strong>Notice:</strong> If COD checkbox is disabled, Cash On Delivery option will be hidden on checkout and customers must pay online.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: DETAILED KEYS */}
                    <div className="grid-right">
                        <div className="modern-card">
                            <div className="card-header">
                                <CreditCard size={20} className="card-icon" />
                                <h2>Gateways Key Setup</h2>
                            </div>

                            {/* Tab selection buttons */}
                            <div className="gateway-tabs-bar" style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' }}>
                                <button 
                                    type="button"
                                    onClick={() => setActiveGatewayTab('razorpay')}
                                    className={`gateway-tab-btn ${activeGatewayTab === 'razorpay' ? 'active' : ''}`}
                                    style={{ flex: 1, padding: '10px 0', border: 'none', borderBottom: activeGatewayTab === 'razorpay' ? '3px solid #f28b00' : '3px solid transparent', background: 'transparent', fontWeight: '600', color: activeGatewayTab === 'razorpay' ? '#f28b00' : '#777', cursor: 'pointer' }}
                                >
                                    Razorpay
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setActiveGatewayTab('phonepe')}
                                    className={`gateway-tab-btn ${activeGatewayTab === 'phonepe' ? 'active' : ''}`}
                                    style={{ flex: 1, padding: '10px 0', border: 'none', borderBottom: activeGatewayTab === 'phonepe' ? '3px solid #f28b00' : '3px solid transparent', background: 'transparent', fontWeight: '600', color: activeGatewayTab === 'phonepe' ? '#f28b00' : '#777', cursor: 'pointer' }}
                                >
                                    PhonePe
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setActiveGatewayTab('cashfree')}
                                    className={`gateway-tab-btn ${activeGatewayTab === 'cashfree' ? 'active' : ''}`}
                                    style={{ flex: 1, padding: '10px 0', border: 'none', borderBottom: activeGatewayTab === 'cashfree' ? '3px solid #f28b00' : '3px solid transparent', background: 'transparent', fontWeight: '600', color: activeGatewayTab === 'cashfree' ? '#f28b00' : '#777', cursor: 'pointer' }}
                                >
                                    Cashfree
                                </button>
                            </div>

                            <div className="card-body" style={{ paddingTop: '20px' }}>
                                
                                {/* 1. Razorpay */}
                                {activeGatewayTab === 'razorpay' && (
                                    <div className="gateway-fields-wrapper">
                                        <div className="form-group">
                                            <label>Environment Mode</label>
                                            <select className="modern-select" value={razorpayEnvironment} onChange={e => setRazorpayEnvironment(e.target.value)}>
                                                <option value="TEST">TEST Mode (Sandbox)</option>
                                                <option value="PRODUCTION">LIVE Mode (Production)</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Razorpay Key ID</label>
                                            <input type="text" className="modern-input" value={razorpayKeyId} onChange={e => setRazorpayKeyId(e.target.value)} placeholder="rzp_test_..." />
                                        </div>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Razorpay Key Secret</label>
                                            <input type="password" className="modern-input" value={razorpayKeySecret} onChange={e => setRazorpayKeySecret(e.target.value)} placeholder="••••••••" />
                                        </div>
                                    </div>
                                )}

                                {/* 2. PhonePe */}
                                {activeGatewayTab === 'phonepe' && (
                                    <div className="gateway-fields-wrapper">
                                        <div className="form-group">
                                            <label>Environment Mode</label>
                                            <select className="modern-select" value={phonePeEnvironment} onChange={e => setPhonePeEnvironment(e.target.value)}>
                                                <option value="TEST">TEST Mode (Sandbox)</option>
                                                <option value="PRODUCTION">LIVE Mode (Production)</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>PhonePe Merchant ID</label>
                                            <input type="text" className="modern-input" value={phonePeMerchantId} onChange={e => setPhonePeMerchantId(e.target.value)} placeholder="MID123456..." />
                                        </div>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>PhonePe Salt Key</label>
                                            <input type="password" className="modern-input" value={phonePeSaltKey} onChange={e => setPhonePeSaltKey(e.target.value)} placeholder="••••••••" />
                                        </div>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>PhonePe Salt Index</label>
                                            <input type="text" className="modern-input" value={phonePeSaltIndex} onChange={e => setPhonePeSaltIndex(e.target.value)} placeholder="1" />
                                        </div>
                                    </div>
                                )}

                                {/* 3. Cashfree */}
                                {activeGatewayTab === 'cashfree' && (
                                    <div className="gateway-fields-wrapper">
                                        <div className="form-group">
                                            <label>Environment Mode</label>
                                            <select className="modern-select" value={cashfreeEnvironment} onChange={e => setCashfreeEnvironment(e.target.value)}>
                                                <option value="TEST">TEST Mode (Sandbox)</option>
                                                <option value="PRODUCTION">LIVE Mode (Production)</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Cashfree App ID (Client ID)</label>
                                            <input type="text" className="modern-input" value={cashfreeAppId} onChange={e => setCashfreeAppId(e.target.value)} placeholder="TEST123456..." />
                                        </div>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Cashfree Secret Key</label>
                                            <input type="password" className="modern-input" value={cashfreeSecretKey} onChange={e => setCashfreeSecretKey(e.target.value)} placeholder="••••••••" />
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PaymentSettingsPage;
