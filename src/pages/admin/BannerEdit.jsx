import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Save, ArrowLeft, Image as ImageIcon, CheckCircle2, Type } from 'lucide-react';
import './ProductEdit.css';

const BannerEdit = () => {
    const { id: bannerId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();

    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [link, setLink] = useState('');
    const [type, setType] = useState('Homepage');
    const [isActive, setIsActive] = useState(true);
    const [categories, setCategories] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/categories`);
                setCategories(data.filter(c => c.isActive));
            } catch (err) {
                console.error("Error loading categories:", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchBanner = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/banners`);
                const banner = data.find(c => c._id === bannerId);
                if (banner) {
                    setTitle(banner.title);
                    setImage(banner.image);
                    setLink(banner.link || '');
                    setType(banner.type || 'Homepage');
                    setIsActive(banner.isActive);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchBanner();
    }, [bannerId]);


    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`${window.API_BASE_URL}/api/banners/${bannerId}`, {
                title, image, link, type, isActive
            }, config);
            setUpdateLoading(false);
            navigate('/admin/banners');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setUpdateLoading(false);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/upload?folder=banners`, formData, config);
            setImage(data.image);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || error.message);
        }
    };

    if (loading) return <div className="loader container">Loading Banner Data...</div>;

    return (
        <div className="fade-in pb-8">
            <form onSubmit={submitHandler}>
                <div className="admin-header glass-panel">
                    <div className="header-content">
                        <div>
                            <Link to="/admin/banners" className="back-link">
                                <ArrowLeft size={16} /> Back to Banners
                            </Link>
                            <h1 className="page-title">Edit Banner</h1>
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
                            <Type size={20} className="card-icon" />
                            <h2>Banner Configuration</h2>
                        </div>
                        <div className="card-body">
                            <div className="grid-2-cols">
                                <div className="form-group">
                                    <label>Banner Title</label>
                                    <input type="text" className="modern-input" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Banner Type</label>
                                    <select className="modern-select" value={type} onChange={e => setType(e.target.value)}>
                                        <option value="Homepage">Homepage Hero</option>
                                        <option value="Offer">Mini Banner (Home Grid)</option>
                                        <option value="Slider">Carousel Slider</option>
                                        <option value="Popup">Promotional Popup</option>
                                        <option value="Festival">Festival Theme</option>
                                        <option value="About">About Page Banner</option>
                                        <option value="Contact">Contact Page Banner</option>
                                        <option value="Blog">Blog Page Banner</option>
                                        <option value="Shop">Shop/Category Page Banner</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label>Target Link (URL when clicked)</label>
                                <input type="text" className="modern-input" value={link} onChange={e => setLink(e.target.value)} placeholder="/product/some-id" />
                            </div>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label>Or Link directly to a Category</label>
                                <select 
                                    className="modern-select" 
                                    value={categories.find(c => link === `/category/${c.slug}`)?._id || ''} 
                                    onChange={e => {
                                        const cat = categories.find(c => c._id === e.target.value);
                                        if (cat) {
                                            setLink(`/category/${cat.slug}`);
                                            if (!title) {
                                                setTitle(cat.name);
                                            }
                                        }
                                    }}
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modern-card">
                        <div className="card-header">
                            <ImageIcon size={20} className="card-icon" />
                            <h2>Media</h2>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label>Image Upload / URL</label>
                                <div className="input-with-preview">
                                    <input type="text" className="modern-input" value={image} onChange={e => setImage(e.target.value)} required placeholder="Image Path or URL" />
                                    <input type="file" className="modern-input" onChange={uploadFileHandler} style={{ marginTop: '10px' }} accept="image/*" />
                                    {image && <img src={image.startsWith('http') ? image : `${window.API_BASE_URL}${image}`} alt="Preview" className="img-preview" style={{ width: '150px', height: '60px' }} />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modern-card">
                        <div className="card-header">
                            <CheckCircle2 size={20} className="card-icon" />
                            <h2>Visibility</h2>
                        </div>
                        <div className="card-body">
                            <label className="modern-toggle">
                                <div className="toggle-text">
                                    <strong>Active Banner</strong>
                                    <span>Will be displayed on the storefront</span>
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

export default BannerEdit;
