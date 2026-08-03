import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Save, ArrowLeft, Image as ImageIcon, CheckCircle2, Type, FileText } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill/dist/quill.snow.css';
import './ProductEdit.css'; // Reuse ProductEdit styling for forms and grids

const BlogEdit = () => {
    const { id: blogId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();

    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [readTime, setReadTime] = useState('5 min read');
    const [author, setAuthor] = useState('Admin');
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/blogs/${blogId}`);
                if (data) {
                    setTitle(data.title);
                    setImage(data.image);
                    setCategory(data.category);
                    setExcerpt(data.excerpt);
                    setContent(data.content);
                    setReadTime(data.readTime || '5 min read');
                    setAuthor(data.author || 'Admin');
                    setIsActive(data.isActive);
                }
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };
        
        if (userInfo && userInfo.isAdmin) {
            fetchBlog();
        } else {
            navigate('/login');
        }
    }, [blogId, userInfo, navigate]);


    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`${window.API_BASE_URL}/api/blogs/${blogId}`, {
                title, image, category, excerpt, content, readTime, author, isActive
            }, config);
            setUpdateLoading(false);
            navigate('/admin/bloglist');
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
            const { data } = await axios.post(`${window.API_BASE_URL}/api/upload?folder=blogs`, formData, config);
            setImage(data.image);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || error.message);
        }
    };

    if (loading) return <div className="loader container">Loading Blog Data...</div>;

    return (
        <div className="fade-in pb-8">
            <form onSubmit={submitHandler}>
                <div className="admin-header glass-panel">
                    <div className="header-content">
                        <div>
                            <Link to="/admin/bloglist" className="back-link">
                                <ArrowLeft size={16} /> Back to Blog List
                            </Link>
                            <h1 className="page-title">Edit Blog Post</h1>
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
                            <h2>Basic Configuration</h2>
                        </div>
                        <div className="card-body">
                            <div className="grid-2-cols">
                                <div className="form-group">
                                    <label>Blog Title</label>
                                    <input type="text" className="modern-input" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" className="modern-input" value={category} onChange={e => setCategory(e.target.value)} required placeholder="e.g. Style, Trends, Sustainability" />
                                </div>
                            </div>
                            <div className="grid-2-cols" style={{ marginTop: '16px' }}>
                                <div className="form-group">
                                    <label>Read Time</label>
                                    <input type="text" className="modern-input" value={readTime} onChange={e => setReadTime(e.target.value)} required placeholder="e.g. 5 min read" />
                                </div>
                                <div className="form-group">
                                    <label>Author</label>
                                    <input type="text" className="modern-input" value={author} onChange={e => setAuthor(e.target.value)} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modern-card">
                        <div className="card-header">
                            <FileText size={20} className="card-icon" />
                            <h2>Content</h2>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label>Excerpt (Short summary shown in listing)</label>
                                <input type="text" className="modern-input" value={excerpt} onChange={e => setExcerpt(e.target.value)} required placeholder="A brief description..." />
                            </div>
                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label>Full Post Content</label>
                                <div style={{ background: '#fff', color: '#000' }}>
                                    <ReactQuill 
                                        theme="snow"
                                        value={content} 
                                        onChange={setContent} 
                                        style={{ height: '300px', marginBottom: '40px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modern-card">
                        <div className="card-header">
                            <ImageIcon size={20} className="card-icon" />
                            <h2>Cover Media</h2>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label>Cover Image URL / Upload</label>
                                <div className="input-with-preview">
                                    <input type="text" className="modern-input" value={image} onChange={e => setImage(e.target.value)} required placeholder="Image path or URL" />
                                    <input type="file" className="modern-input" onChange={uploadFileHandler} style={{ marginTop: '10px' }} accept="image/*" />
                                    {image && <img src={image.startsWith('http') ? image : `${window.API_BASE_URL}${image}`} alt="Preview" className="img-preview" style={{ width: '150px', height: '100px', marginTop: '10px', objectFit: 'cover' }} />}
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
                                    <strong>Active Blog Post</strong>
                                    <span>Will be visible to all customers on the storefront blog page</span>
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

export default BlogEdit;
