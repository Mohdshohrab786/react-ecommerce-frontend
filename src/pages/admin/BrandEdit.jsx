import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Save, ArrowLeft, Tag, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import './ProductEdit.css';

const BrandEdit = () => {
    const { id: brandId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [logo, setLogo] = useState('');
    const [isActive, setIsActive] = useState(true);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchBrand = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${window.API_BASE_URL}/api/brands`);
                const brand = data.find(c => c._id === brandId);
                if (brand) {
                    setName(brand.name);
                    setSlug(brand.slug);
                    setLogo(brand.logo);
                    setIsActive(brand.isActive);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchBrand();
    }, [brandId, userInfo.token]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`${window.API_BASE_URL}/api/brands/${brandId}`, {
                name, slug, logo, isActive
            }, config);
            setUpdateLoading(false);
            navigate('/admin/brands');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setUpdateLoading(false);
        }
    };

    if (loading) return <div className="loader container">Loading Brand Data...</div>;

    return (
        <div className="fade-in pb-8">
            <form onSubmit={submitHandler}>
                <div className="admin-header glass-panel">
                    <div className="header-content">
                        <div>
                            <Link to="/admin/brands" className="back-link">
                                <ArrowLeft size={16} /> Back to Brands
                            </Link>
                            <h1 className="page-title">Edit Brand</h1>
                        </div>
                        <div className="header-actions">
                            <button type="submit" className="btn-primary" disabled={updateLoading}>
                                <Save size={18} />
                                {updateLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="modern-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="modern-card">
                        <div className="card-header">
                            <Tag size={20} className="card-icon" />
                            <h2>Basic Information</h2>
                        </div>
                        <div className="card-body">
                            <div className="grid-2-cols">
                                <div className="form-group">
                                    <label>Brand Name</label>
                                    <input type="text" className="modern-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Apple" />
                                </div>
                                <div className="form-group">
                                    <label>Slug (URL Friendly)</label>
                                    <input type="text" className="modern-input" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="apple" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modern-card">
                        <div className="card-header">
                            <ImageIcon size={20} className="card-icon" />
                            <h2>Brand Logo</h2>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label>Logo URL</label>
                                <div className="input-with-preview">
                                    <input type="text" className="modern-input" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://example.com/logo.jpg" />
                                    {logo && <img src={logo} alt="Preview" className="img-preview" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modern-card">
                        <div className="card-header">
                            <CheckCircle2 size={20} className="card-icon" />
                            <h2>Visibility & Flags</h2>
                        </div>
                        <div className="card-body">
                            <label className="modern-toggle">
                                <div className="toggle-text">
                                    <strong>Active Brand</strong>
                                    <span>Visible to customers on the frontend</span>
                                </div>
                                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BrandEdit;
