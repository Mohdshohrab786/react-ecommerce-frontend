import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

const BannerList = () => {
    const { userInfo } = useAuthStore();
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBanners = async () => {
        try {
            const { data } = await axios.get(`${window.API_BASE_URL}/api/banners`);
            setBanners(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            fetchBanners();
        } else {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/banners/${id}`, config);
                fetchBanners();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const createHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/banners`, {
                title: 'New Banner',
                image: '/images/sample-banner.jpg',
                type: 'Homepage'
            }, config);
            navigate(`/admin/banner/${data._id}/edit`);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Promotional Banners</h1>
                <button className="btn-primary" onClick={createHandler}>
                    + Create Banner
                </button>
            </div>
            {loading ? <div className="loader">Loading...</div> : error ? <div className="error-message">{error}</div> : (
                <div className="table-container glass">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>PREVIEW</th>
                                <th>TITLE</th>
                                <th>TYPE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.map((banner) => (
                                <tr key={banner._id}>
                                    <td>
                                        <img src={banner.image} alt="Banner" style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </td>
                                    <td>{banner.title}</td>
                                    <td><span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px' }}>{banner.type === 'Offer' ? 'Mini Banner (Home Grid)' : banner.type}</span></td>
                                    <td>
                                        {banner.isActive ? (
                                            <span style={{ color: '#10b981' }}>Active</span>
                                        ) : (
                                            <span style={{ color: '#ef4444' }}>Inactive</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Link to={`/admin/banner/${banner._id}/edit`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '14px' }}>
                                                Edit
                                            </Link>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={() => deleteHandler(banner._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {banners.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>No banners configured</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BannerList;
