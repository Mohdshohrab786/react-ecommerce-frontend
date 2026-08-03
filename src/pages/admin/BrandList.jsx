import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

const BrandList = () => {
    const { userInfo } = useAuthStore();
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBrands = async () => {
        try {
            const { data } = await axios.get(`${window.API_BASE_URL}/api/brands`);
            setBrands(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            fetchBrands();
        } else {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/brands/${id}`, config);
                fetchBrands();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const createHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/brands`, {
                name: 'Sample Brand',
                slug: `sample-brand-${Date.now()}`,
                logo: '/images/sample.jpg'
            }, config);
            navigate(`/admin/brand/${data._id}/edit`);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Brands</h1>
                <button className="btn-primary" onClick={createHandler}>
                    + Create Brand
                </button>
            </div>
            {loading ? <div className="loader">Loading...</div> : error ? <div className="error-message">{error}</div> : (
                <div className="table-container glass">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NAME</th>
                                <th>SLUG</th>
                                <th>ACTIVE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brands.map((brand) => (
                                <tr key={brand._id}>
                                    <td>{brand._id.substring(0, 8)}...</td>
                                    <td>{brand.name}</td>
                                    <td>{brand.slug}</td>
                                    <td>
                                        {brand.isActive ? (
                                            <span style={{ color: '#10b981' }}>Yes</span>
                                        ) : (
                                            <span style={{ color: '#ef4444' }}>No</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Link to={`/admin/brand/${brand._id}/edit`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '14px' }}>
                                                Edit
                                            </Link>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={() => deleteHandler(brand._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {brands.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>No brands found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BrandList;
