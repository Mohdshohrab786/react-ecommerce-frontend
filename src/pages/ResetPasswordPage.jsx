import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [countdown, setCountdown] = useState(5);

    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (successMessage && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (successMessage && countdown === 0) {
            navigate('/login');
        }
        return () => clearTimeout(timer);
    }, [successMessage, countdown, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.put(
                `${window.API_BASE_URL}/api/users/resetpassword/${token}`,
                { password },
                config
            );
            
            setSuccessMessage(data.message || 'Password reset successfully!');
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card glass">
                <h1 className="auth-title">Reset Password</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                {successMessage ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            border: '1px solid rgba(34, 197, 94, 0.2)'
                        }}>
                            {successMessage}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Redirecting to Login page in {countdown} seconds...
                        </p>
                        <Link to="/login" className="btn-primary w-100" style={{ display: 'block', textDecoration: 'none' }}>
                            Go to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={submitHandler}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center', fontSize: '15px' }}>
                            Enter and confirm your new password below.
                        </p>
                        
                        <div className="form-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="Enter new password" 
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
                                placeholder="Confirm new password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button type="submit" className="btn-primary w-100" disabled={loading}>
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
