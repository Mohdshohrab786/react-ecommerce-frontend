import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Save, Globe, Mail, Phone, Share2, MapPin, Clock } from 'lucide-react';
import './ProductEdit.css'; // Re-use the premium CSS

const SettingsPage = () => {
    const { userInfo } = useAuthStore();
    const navigate = useNavigate();

    const [websiteName, setWebsiteName] = useState('');
    const [logo, setLogo] = useState('');
    const [favicon, setFavicon] = useState('');
    const [currency, setCurrency] = useState('USD');
    
    // Social Links
    const [instagram, setInstagram] = useState('');
    const [twitter, setTwitter] = useState('');
    const [facebook, setFacebook] = useState('');
    const [pinterest, setPinterest] = useState('');
    const [youtube, setYoutube] = useState('');
    
    // SMTP
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [smtpUsername, setSmtpUsername] = useState('');
    const [smtpPassword, setSmtpPassword] = useState('');
    const [senderEmail, setSenderEmail] = useState('');

    // Twilio
    const [twilioAccountSid, setTwilioAccountSid] = useState('');
    const [twilioAuthToken, setTwilioAuthToken] = useState('');
    const [twilioNumber, setTwilioNumber] = useState('');
    const [isOtpLoginEnabled, setIsOtpLoginEnabled] = useState(false);

    // Contact Information
    const [contactAddress, setContactAddress] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactHours, setContactHours] = useState('');

    // Shop Filters
    const [isBrandFilterEnabled, setIsBrandFilterEnabled] = useState(true);
    const [isPriceFilterEnabled, setIsPriceFilterEnabled] = useState(true);
    const [isRatingFilterEnabled, setIsRatingFilterEnabled] = useState(true);
    const [isColorFilterEnabled, setIsColorFilterEnabled] = useState(true);
    const [isSizeFilterEnabled, setIsSizeFilterEnabled] = useState(true);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [faviconUploading, setFaviconUploading] = useState(false);
    const [error, setError] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    const uploadFileHandler = async (e, type = 'logo') => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        
        if (type === 'logo') setUploading(true);
        else setFaviconUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post(`${window.API_BASE_URL}/api/upload?folder=settings`, formData, config);
            if (type === 'logo') {
                setLogo(data.image);
                setUploading(false);
            } else {
                setFavicon(data.image);
                setFaviconUploading(false);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || `Error uploading ${type} image`);
            setUploading(false);
            setFaviconUploading(false);
        }
    };

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
                    setWebsiteName(data.websiteName || '');
                    setLogo(data.logo || '');
                    setFavicon(data.favicon || '');
                    setCurrency(data.currency || 'USD');
                    if (data.socialLinks) {
                        setInstagram(data.socialLinks.instagram || '');
                        setTwitter(data.socialLinks.twitter || '');
                        setFacebook(data.socialLinks.facebook || '');
                        setPinterest(data.socialLinks.pinterest || '');
                        setYoutube(data.socialLinks.youtube || '');
                    }
                    setSmtpHost(data.smtpHost || '');
                    setSmtpPort(data.smtpPort || '');
                    setSmtpUsername(data.smtpUsername || '');
                    setSmtpPassword(data.smtpPassword || '');
                    setSenderEmail(data.senderEmail || '');
                    setTwilioAccountSid(data.twilioAccountSid || '');
                    setTwilioAuthToken(data.twilioAuthToken || '');
                    setTwilioNumber(data.twilioNumber || '');
                    setIsOtpLoginEnabled(data.isOtpLoginEnabled || false);
                    
                    // Contact Details
                    if (data.contactDetails) {
                        setContactAddress(data.contactDetails.address || '');
                        setContactPhone(data.contactDetails.phone || '');
                        setContactEmail(data.contactDetails.email || '');
                        setContactHours(data.contactDetails.hours || '');
                    }
                    
                    // Filters
                    if (data.filters) {
                        setIsBrandFilterEnabled(data.filters.isBrandFilterEnabled ?? true);
                        setIsPriceFilterEnabled(data.filters.isPriceFilterEnabled ?? true);
                        setIsRatingFilterEnabled(data.filters.isRatingFilterEnabled ?? true);
                        setIsColorFilterEnabled(data.filters.isColorFilterEnabled ?? true);
                        setIsSizeFilterEnabled(data.filters.isSizeFilterEnabled ?? true);
                    }
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
                websiteName, logo, favicon, currency,
                smtpHost, smtpPort, smtpUsername, smtpPassword, senderEmail,
                twilioAccountSid, twilioAuthToken, twilioNumber, isOtpLoginEnabled,
                socialLinks: { instagram, twitter, facebook, pinterest, youtube },
                contactDetails: {
                    address: contactAddress,
                    phone: contactPhone,
                    email: contactEmail,
                    hours: contactHours,
                },
                filters: {
                    isBrandFilterEnabled,
                    isPriceFilterEnabled,
                    isRatingFilterEnabled,
                    isColorFilterEnabled,
                    isSizeFilterEnabled
                }
            };

            await axios.put(`${window.API_BASE_URL}/api/settings`, settingsData, config);
            
            // Sync settings store in memory instantly so Navbar logo and details update
            await useSettingsStore.getState().fetchSettings();
            
            alert('Settings updated successfully!');
            setUpdateLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setUpdateLoading(false);
        }
    };

    if (loading) return <div className="loader container">Loading Settings...</div>;

    return (
        <div className="fade-in pb-8">
            <form onSubmit={submitHandler}>
                <div className="admin-header glass-panel">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">Global Settings</h1>
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
                    {/* LEFT COLUMN */}
                    <div className="grid-left">
                        {/* Store Config */}
                        <div className="modern-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <Globe size={20} className="card-icon" />
                                <h2>Store Configuration</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Website Name</label>
                                    <input type="text" className="modern-input" value={websiteName} onChange={e => setWebsiteName(e.target.value)} required />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Logo Image</label>
                                    <div className="input-with-preview" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input
                                            type="text"
                                            className="modern-input"
                                            value={logo}
                                            onChange={e => setLogo(e.target.value)}
                                            placeholder="Direct Logo URL / Upload Below"
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => uploadFileHandler(e, 'logo')}
                                                style={{ fontSize: '12px' }}
                                            />
                                            {uploading && <span style={{ fontSize: '12px', color: '#f28b00' }}>Uploading image...</span>}
                                        </div>
                                        {logo && (
                                            <div style={{ padding: '10px', background: '#fafafa', border: '1px solid #eee', borderRadius: '4px', display: 'inline-block', marginTop: '5px' }}>
                                                <img src={logo.startsWith('http') ? logo : `${window.API_BASE_URL}${logo}`} alt="Preview Logo" style={{ maxHeight: '50px', objectFit: 'contain' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Favicon Icon (.ico / .png)</label>
                                    <div className="input-with-preview" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input
                                            type="text"
                                            className="modern-input"
                                            value={favicon}
                                            onChange={e => setFavicon(e.target.value)}
                                            placeholder="Direct Favicon URL / Upload Below"
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => uploadFileHandler(e, 'favicon')}
                                                style={{ fontSize: '12px' }}
                                            />
                                            {faviconUploading && <span style={{ fontSize: '12px', color: '#f28b00' }}>Uploading favicon...</span>}
                                        </div>
                                        {favicon && (
                                            <div style={{ padding: '10px', background: '#fafafa', border: '1px solid #eee', borderRadius: '4px', display: 'inline-block', marginTop: '5px' }}>
                                                <img src={favicon.startsWith('http') ? favicon : `${window.API_BASE_URL}${favicon}`} alt="Preview Favicon" style={{ maxHeight: '30px', maxWidth: '30px', objectFit: 'contain' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Currency</label>
                                    <select className="modern-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="modern-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <MapPin size={20} className="card-icon" />
                                <h2>Contact Information</h2>
                            </div>
                            <div className="card-body">
                                <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                                    These details are automatically displayed in the website footer and contact page.
                                </p>
                                <div className="form-group">
                                    <label><MapPin size={13} style={{display:'inline',marginRight:5}}/>Address</label>
                                    <input
                                        type="text"
                                        className="modern-input"
                                        value={contactAddress}
                                        onChange={e => setContactAddress(e.target.value)}
                                        placeholder="123 Main Street, City, State, ZIP"
                                    />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label><Phone size={13} style={{display:'inline',marginRight:5}}/>Phone Number</label>
                                    <input
                                        type="text"
                                        className="modern-input"
                                        value={contactPhone}
                                        onChange={e => setContactPhone(e.target.value)}
                                        placeholder="(+91) 98765-43210"
                                    />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label><Mail size={13} style={{display:'inline',marginRight:5}}/>Contact Email</label>
                                    <input
                                        type="email"
                                        className="modern-input"
                                        value={contactEmail}
                                        onChange={e => setContactEmail(e.target.value)}
                                        placeholder="info@yourstore.com"
                                    />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label><Clock size={13} style={{display:'inline',marginRight:5}}/>Working Hours</label>
                                    <input
                                        type="text"
                                        className="modern-input"
                                        value={contactHours}
                                        onChange={e => setContactHours(e.target.value)}
                                        placeholder="Mon – Sat: 9:00AM – 6:00PM"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="grid-right">
                        {/* Social Media Links */}
                        <div className="modern-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <Share2 size={20} className="card-icon" />
                                <h2>Social Media Links</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Instagram URL</label>
                                    <input type="text" className="modern-input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/yourbrand" />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Twitter/X URL</label>
                                    <input type="text" className="modern-input" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://twitter.com/yourbrand" />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Facebook URL</label>
                                    <input type="text" className="modern-input" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="https://facebook.com/yourbrand" />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Pinterest URL</label>
                                    <input type="text" className="modern-input" value={pinterest} onChange={e => setPinterest(e.target.value)} placeholder="https://pinterest.com/yourbrand" />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>YouTube Channel URL</label>
                                    <input type="text" className="modern-input" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="https://youtube.com/c/yourchannel" />
                                </div>
                            </div>
                        </div>

                        {/* SMTP Email Configuration */}
                        <div className="modern-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <Mail size={20} className="card-icon" />
                                <h2>SMTP Email Server</h2>
                            </div>
                            <div className="card-body">
                                <div className="grid-2-cols">
                                    <div className="form-group">
                                        <label>SMTP Host</label>
                                        <input type="text" className="modern-input" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>SMTP Port</label>
                                        <input type="text" className="modern-input" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>SMTP Username</label>
                                    <input type="text" className="modern-input" value={smtpUsername} onChange={e => setSmtpUsername(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>SMTP Password</label>
                                    <input type="password" className="modern-input" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Sender Email</label>
                                    <input type="email" className="modern-input" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="noreply@yourstore.com" />
                                </div>
                            </div>
                        </div>

                        {/* Twilio SMS */}
                        <div className="modern-card">
                            <div className="card-header">
                                <Phone size={20} className="card-icon" />
                                <h2>Twilio SMS Settings</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Account SID</label>
                                    <input type="text" className="modern-input" value={twilioAccountSid} onChange={e => setTwilioAccountSid(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Auth Token</label>
                                    <input type="password" className="modern-input" value={twilioAuthToken} onChange={e => setTwilioAuthToken(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Twilio Phone Number</label>
                                    <input type="text" className="modern-input" value={twilioNumber} onChange={e => setTwilioNumber(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" id="otpLoginToggle" checked={isOtpLoginEnabled} onChange={e => setIsOtpLoginEnabled(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                    <label htmlFor="otpLoginToggle" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>Enable Mobile OTP Login</label>
                                </div>
                            </div>
                        </div>

                        {/* Shop Filter Settings */}
                        <div className="modern-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <Globe size={20} className="card-icon" />
                                <h2>Shop Filter Settings</h2>
                            </div>
                            <div className="card-body">
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                    Enable or disable specific filters on the Shop and Category pages. 
                                </p>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isBrandFilterEnabled}
                                        onChange={(e) => setIsBrandFilterEnabled(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label style={{ margin: 0, fontWeight: 500 }}>Brand Filter</label>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isPriceFilterEnabled}
                                        onChange={(e) => setIsPriceFilterEnabled(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label style={{ margin: 0, fontWeight: 500 }}>Price Filter</label>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isRatingFilterEnabled}
                                        onChange={(e) => setIsRatingFilterEnabled(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label style={{ margin: 0, fontWeight: 500 }}>Rating Filter</label>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isColorFilterEnabled}
                                        onChange={(e) => setIsColorFilterEnabled(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label style={{ margin: 0, fontWeight: 500 }}>Color Filter</label>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isSizeFilterEnabled}
                                        onChange={(e) => setIsSizeFilterEnabled(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label style={{ margin: 0, fontWeight: 500 }}>Size Filter</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
