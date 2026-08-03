import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Trash2, Send, X } from 'lucide-react';

const NewsletterList = () => {
    const { userInfo } = useAuthStore();
    const navigate = useNavigate();
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Broadcast Modal State
    const [showModal, setShowModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [productLink, setProductLink] = useState('');
    const [sending, setSending] = useState(false);

    const fetchSubscribers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/newsletter`, config);
            setSubscribers(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            fetchSubscribers();
        } else {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to remove this subscriber?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/newsletter/${id}`, config);
                fetchSubscribers();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const sendNewsletterHandler = async (e) => {
        e.preventDefault();
        if (!subject || !message) return alert('Subject and message are required');

        try {
            setSending(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post(
                `${window.API_BASE_URL}/api/newsletter/send`, 
                { subject, message, productLink }, 
                config
            );
            alert(data.message);
            setShowModal(false);
            setSubject('');
            setMessage('');
            setProductLink('');
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Newsletter Subscribers</h2>
                <div className="admin-header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500' }}>Total: {subscribers.length}</span>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => setShowModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Send size={16} /> Broadcast Newsletter
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loader">Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Subscribed At</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub) => (
                                <tr key={sub._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Mail size={16} color="#666" />
                                            {sub.email}
                                        </div>
                                    </td>
                                    <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${sub.isActive ? 'active' : 'inactive'}`}>
                                            {sub.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-icon delete" 
                                                onClick={() => deleteHandler(sub._id)}
                                                title="Delete Subscriber"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>
                                        No subscribers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Broadcast Modal */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div className="modal-content" style={{
                        background: 'var(--bg-primary)', padding: '30px', 
                        borderRadius: '8px', width: '90%', maxWidth: '600px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        position: 'relative'
                    }}>
                        <button 
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={24} color="var(--text-secondary)" />
                        </button>
                        
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            Send Broadcast Email
                        </h3>

                        <form onSubmit={sendNewsletterHandler}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Subject <span style={{color: 'red'}}>*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g., Mega Diwali Sale - Flat 50% Off!"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Message Body <span style={{color: 'red'}}>*</span></label>
                                <textarea 
                                    className="form-control"
                                    rows="6"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write your email content here. You can include coupon codes, offers, etc."
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Product / Offer Link (Optional)</label>
                                <input 
                                    type="url" 
                                    className="form-control"
                                    value={productLink}
                                    onChange={(e) => setProductLink(e.target.value)}
                                    placeholder="http://localhost:5173/shop"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />
                                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '5px' }}>
                                    If provided, a "View Offer / Product" button will be added to the email.
                                </small>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={sending}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={sending}>
                                    {sending ? 'Sending Emails...' : 'Send Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsletterList;
