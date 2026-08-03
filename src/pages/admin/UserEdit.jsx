import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import '../AuthPage.css';

const UserEdit = () => {
    const { id: userId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${window.API_BASE_URL}/api/users/${userId}`, config);
                setName(data.name);
                setEmail(data.email);
                setIsAdmin(data.isAdmin);
                setLoading(false);
            } catch (err) {
                setError(err.response && err.response.data.message ? err.response.data.message : err.message);
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId, userInfo.token]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`${window.API_BASE_URL}/api/users/${userId}`, { name, email, isAdmin }, config);
            navigate('/admin/userlist');
        } catch (err) {
            alert(err.response && err.response.data.message ? err.response.data.message : err.message);
        }
    };

    return (
        <div className="fade-in">
            <Link to="/admin/userlist" className="btn-secondary" style={{ display: 'inline-block', marginBottom: '24px' }}>Go Back</Link>
            <div className="auth-card glass" style={{ maxWidth: '100%' }}>
                <h1 className="auth-title" style={{ fontSize: '28px' }}>Edit User</h1>
                {loading ? <div className="loader">Loading...</div> : error ? <div className="error-message">{error}</div> : (
                    <form onSubmit={submitHandler}>
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input type="checkbox" id="isadmin" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                            <label htmlFor="isadmin" style={{ marginBottom: 0 }}>Is Admin</label>
                        </div>
                        <button type="submit" className="btn-primary w-100" style={{ marginTop: '24px' }}>Update User</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserEdit;
