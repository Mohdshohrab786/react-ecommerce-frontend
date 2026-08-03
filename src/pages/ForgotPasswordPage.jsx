import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(
                `${window.API_BASE_URL}/api/users/forgotpassword`,
                { email },
                config
            );
            
            setSuccessMessage(data.message);
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
                <h1 className="auth-title">Forgot Password</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                {successMessage && (
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        textAlign: 'center',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                        {successMessage}
                    </div>
                )}
                
                {!successMessage && (
                    <form onSubmit={submitHandler}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center', fontSize: '15px' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                        
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
                        
                        <button type="submit" className="btn-primary w-100" disabled={loading}>
                            {loading ? 'Sending Request...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                
                <div className="auth-footer">
                    Back to <Link to="/login" className="text-accent" style={{ textDecoration: 'none' }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
