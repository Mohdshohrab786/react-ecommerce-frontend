import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import './AuthPage.css';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // OTP states
    const [registerMode, setRegisterMode] = useState('email'); // 'email' or 'otp'
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    
    const { userInfo, login } = useAuthStore();
    const settings = useSettingsStore(state => state.settings);
    const isOtpEnabled = settings?.isOtpLoginEnabled;

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
        }
        if (!isOtpEnabled && registerMode === 'otp') {
            setRegisterMode('email');
        }
    }, [navigate, userInfo, redirect, isOtpEnabled, registerMode]);

    const submitEmailHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/users`, { name, email, password, phone }, config);
            login(data);
            navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    const requestOtpHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/users/send-register-otp`, { phone }, config);
            setOtpSent(true);
            setSuccessMessage(data.message + (data.simulated && data.mockOtp ? ` (Simulated OTP: ${data.mockOtp})` : ''));
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    const submitOtpHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/users/verify-register-otp`, { phone, otp }, config);
            login(data);
            navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card glass">
                <h1 className="auth-title">Register</h1>
                {/* Mode Switcher */}
                {isOtpEnabled && (
                    <div style={{ display: 'flex', marginBottom: '24px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '4px' }}>
                        <button 
                            type="button"
                            onClick={() => { setRegisterMode('email'); setError(null); setSuccessMessage(''); }}
                            style={{ flex: 1, padding: '10px', background: registerMode === 'email' ? '#fff' : 'transparent', border: 'none', borderRadius: '6px', fontWeight: registerMode === 'email' ? 'bold' : 'normal', boxShadow: registerMode === 'email' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                        >
                            Email Registration
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setRegisterMode('otp'); setError(null); setSuccessMessage(''); }}
                            style={{ flex: 1, padding: '10px', background: registerMode === 'otp' ? '#fff' : 'transparent', border: 'none', borderRadius: '6px', fontWeight: registerMode === 'otp' ? 'bold' : 'normal', boxShadow: registerMode === 'otp' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                        >
                            Mobile OTP Registration
                        </button>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>{successMessage}</div>}
                
                {registerMode === 'email' ? (
                    <form onSubmit={submitEmailHandler}>
                        <div className="form-group">
                            <label>Name</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Enter full name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                className="input-field" 
                                placeholder="Enter email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {isOtpEnabled && (
                            <div className="form-group">
                                <label>Mobile Number (Optional)</label>
                                <input 
                                    type="tel" 
                                    className="input-field" 
                                    placeholder="Enter 10-digit mobile number" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="Enter password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="Confirm password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary w-100" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                ) : (
                    !otpSent ? (
                        <form onSubmit={requestOtpHandler}>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input 
                                    type="tel" 
                                    className="input-field" 
                                    placeholder="Enter 10-digit mobile number" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary w-100" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={submitOtpHandler}>
                            <div className="form-group">
                                <label>Enter OTP</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="6-digit OTP" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                />
                                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => { setOtpSent(false); setOtp(''); setError(null); setSuccessMessage(''); }} 
                                        style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        Change Mobile Number
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary w-100" disabled={loading || otp.length < 6}>
                                {loading ? 'Verifying...' : 'Verify & Register'}
                            </button>
                        </form>
                    )
                )}
                
                <div className="auth-footer">
                    Already have an account? <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-accent">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
