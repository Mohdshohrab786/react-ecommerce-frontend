import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { X, Check } from 'lucide-react';
import './AuthPage.css';

const ProfilePage = () => {
    const getCurrencySymbol = useSettingsStore(state => state.getCurrencySymbol);
    
    // User credentials states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Address states
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [stateName, setStateName] = useState('');
    const [shippingPhone, setShippingPhone] = useState('');
    
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { userInfo, login } = useAuthStore();

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            // Fetch profile data to load fresh address info from DB
            const fetchUserProfile = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                    const { data } = await axios.get(`${window.API_BASE_URL}/api/users/profile`, config);
                    setName(data.name || '');
                    setEmail(data.email || '');
                    setPhone(data.phone || '');
                    if (data.shippingAddress) {
                        setAddress(data.shippingAddress.address || '');
                        setCity(data.shippingAddress.city || '');
                        setPostalCode(data.shippingAddress.postalCode || '');
                        setCountry(data.shippingAddress.country || '');
                        setStateName(data.shippingAddress.state || '');
                        setShippingPhone(data.shippingAddress.phone || '');
                    }
                } catch (err) {
                    console.error('Error fetching user profile', err);
                }
            };

            fetchUserProfile();
        }
    }, [navigate, userInfo.token]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            const { data } = await axios.put(`${window.API_BASE_URL}/api/users/profile`, {
                name,
                email,
                phone,
                password,
                shippingAddress: { address, city, postalCode, country, state: stateName, phone: shippingPhone }
            }, config);
            
            // Save updated user info back to authStore
            login(data);
            setMessage('Profile updated successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="container fade-in" style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                <h2 className="section-title">User Profile</h2>
                <div className="auth-card glass" style={{ maxWidth: '100%', padding: '24px' }}>
                    {message && (
                        <div className="fade-in" style={{
                            position: 'fixed', top: '24px', right: '24px',
                            background: '#f28b00', color: '#fff',
                            padding: '16px 24px', borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(242, 139, 0, 0.4)',
                            zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px',
                            fontWeight: 600, fontSize: '15px'
                        }}>
                            <Check size={20} />
                            {message}
                        </div>
                    )}
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={submitHandler}>
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input type="tel" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                        
                        <div style={{ borderTop: '1px solid var(--border-color, #eaeaea)', margin: '20px 0', paddingTop: '15px' }}>
                            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', color: 'var(--text-primary)' }}>Shipping Address</h3>
                            <div className="form-group">
                                <label>Address</label>
                                <input type="text" className="input-field" placeholder="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" className="input-field" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input type="text" className="input-field" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>State</label>
                                    <input type="text" className="input-field" placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Country</label>
                                    <input type="text" className="input-field" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Contact Phone (Shipping)</label>
                                <input type="tel" className="input-field" placeholder="Phone Number" value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color, #eaeaea)', margin: '20px 0', paddingTop: '15px' }}>
                            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', color: 'var(--text-primary)' }}>Security</h3>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" className="input-field" placeholder="Enter password to update" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" className="input-field" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-100">Update Profile</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
