import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Save, ArrowLeft, Tag, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import './ProductEdit.css';

const CategoryEdit = () => {
    const { id: categoryId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [image, setImage] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [parentCategory, setParentCategory] = useState('');
    const [allCategories, setAllCategories] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [slugEdited, setSlugEdited] = useState(false);

    // Auto-generate slug from name
    useEffect(() => {
        if (!slugEdited && name) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [name, slugEdited]);

    useEffect(() => {
        const fetchCategory = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${window.API_BASE_URL}/api/categories`);
                setAllCategories(data);
                
                if (categoryId !== 'new') {
                    const category = data.find(c => c._id === categoryId);
                    if (category) {
                        setName(category.name);
                        setSlug(category.slug);
                        setSlugEdited(true); // Prevent auto-slug override for existing items
                        setImage(category.image);
                        setIsActive(category.isActive);
                        const pCat = category.parentCategory && typeof category.parentCategory === 'object'
                            ? category.parentCategory._id
                            : category.parentCategory;
                        setParentCategory(pCat || '');
                    } else {
                        setError('Category not found.');
                    }
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchCategory();
    }, [categoryId, userInfo.token]);


    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const payload = {
                name, 
                slug, 
                image, 
                parentCategory: parentCategory || null, 
                isActive
            };

            if (categoryId === 'new') {
                await axios.post(`${window.API_BASE_URL}/api/categories`, payload, config);
            } else {
                await axios.put(`${window.API_BASE_URL}/api/categories/${categoryId}`, payload, config);
            }
            
            setUpdateLoading(false);
            navigate('/admin/categories');
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
            setUploading(true);
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/upload?folder=categories`, formData, config);
            setImage(data.image);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || error.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="loader container">Loading Category Data...</div>;

    return (
        <div className="fade-in pb-8">
            <form onSubmit={submitHandler}>
                <div className="admin-header glass-panel">
                    <div className="header-content">
                        <div>
                            <Link to="/admin/categories" className="back-link">
                                <ArrowLeft size={16} /> Back to Categories
                            </Link>
                            <h1 className="page-title">{categoryId === 'new' ? 'Add Category' : 'Edit Category'}</h1>
                        </div>
                        <div className="header-actions">
                            <button type="submit" className="btn-primary" disabled={updateLoading || uploading}>
                                <Save size={18} />
                                {updateLoading ? 'Saving...' : uploading ? 'Uploading Image...' : 'Save Changes'}
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
                                     <label>Category Name</label>
                                     <input type="text" className="modern-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Smartphones" />
                                 </div>
                                 <div className="form-group">
                                     <label>Slug (URL Friendly)</label>
                                     <input type="text" className="modern-input" value={slug} onChange={e => {
                                         setSlug(e.target.value);
                                         setSlugEdited(true);
                                     }} required placeholder="smartphones" />
                                 </div>
                             </div>
                             <div className="form-group" style={{ marginTop: '16px' }}>
                                 <label>Parent Category (Leave empty for top-level categories)</label>
                                 <select className="modern-select" value={parentCategory} onChange={e => setParentCategory(e.target.value)}>
                                     <option value="">None (Top-Level Category)</option>
                                     {(() => {
                                         const buildTree = (cats, parentId = null) => {
                                             return cats
                                                 .filter(c => {
                                                     const pId = c.parentCategory ? (typeof c.parentCategory === 'object' ? c.parentCategory._id : c.parentCategory) : null;
                                                     return pId === parentId;
                                                 })
                                                 .map(c => ({
                                                     ...c,
                                                     children: buildTree(cats, c._id)
                                                 }));
                                         };

                                         const renderTreeOptions = (nodes, level = 0) => {
                                             let options = [];
                                             nodes.forEach(cat => {
                                                 if (cat._id === categoryId) return; // Prevent selecting self or its descendants
                                                 const indent = '\u00A0\u00A0'.repeat(level * 2) + (level > 0 ? '└─ ' : '');
                                                 options.push(<option key={cat._id} value={cat._id}>{indent}{cat.name}</option>);
                                                 if (cat.children && cat.children.length > 0) {
                                                     options = [...options, ...renderTreeOptions(cat.children, level + 1)];
                                                 }
                                             });
                                             return options;
                                         };

                                         const tree = buildTree(allCategories);
                                         return renderTreeOptions(tree);
                                     })()}
                                 </select>
                             </div>
                        </div>
                    </div>

                    <div className="modern-card">
                        <div className="card-header">
                            <ImageIcon size={20} className="card-icon" />
                            <h2>Category Image</h2>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label>Image Upload / URL</label>
                                <div className="input-with-preview">
                                    <input type="text" className="modern-input" value={image || ''} onChange={e => setImage(e.target.value)} placeholder="Image Path or URL" />
                                    <input type="file" className="modern-input" onChange={uploadFileHandler} style={{ marginTop: '10px' }} accept="image/*" />
                                    {uploading && <div style={{ marginTop: '10px', color: '#f28b00' }}>Uploading image... Please wait.</div>}
                                    {image && !uploading && <img src={image.startsWith('http') ? image : `${window.API_BASE_URL}${image}`} alt="Preview" className="img-preview" />}
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
                                    <strong>Active Category</strong>
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

export default CategoryEdit;
