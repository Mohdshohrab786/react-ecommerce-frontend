import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, Edit, Trash2 } from 'lucide-react';

const BlogList = () => {
    const { userInfo } = useAuthStore();
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBlogs = async () => {
        try {
            const { data } = await axios.get(`${window.API_BASE_URL}/api/blogs`);
            setBlogs(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            fetchBlogs();
        } else {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/blogs/${id}`, config);
                fetchBlogs();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const createHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post(`${window.API_BASE_URL}/api/blogs`, {}, config);
            navigate(`/admin/blog/${data._id}/edit`);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Blog Posts</h1>
                <button className="btn-primary" onClick={createHandler}>
                    <Plus size={18} style={{ marginRight: '6px' }} /> Create Blog Post
                </button>
            </div>
            {loading ? <div className="loader">Loading...</div> : error ? <div className="error-message">{error}</div> : (
                <div className="table-container glass">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>PREVIEW</th>
                                <th>TITLE</th>
                                <th>CATEGORY</th>
                                <th>AUTHOR</th>
                                <th>DATE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((blog) => (
                                <tr key={blog._id}>
                                    <td>
                                        <img src={blog.image.startsWith('http') ? blog.image : `${window.API_BASE_URL}${blog.image}`} alt="Blog" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </td>
                                    <td>{blog.title}</td>
                                    <td><span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px' }}>{blog.category}</span></td>
                                    <td>{blog.author}</td>
                                    <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {blog.isActive ? (
                                            <span style={{ color: '#10b981' }}>Active</span>
                                        ) : (
                                            <span style={{ color: '#ef4444' }}>Inactive</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Link to={`/admin/blog/${blog._id}/edit`} className="btn-icon">
                                                <Edit size={18} />
                                            </Link>
                                            <button className="btn-icon delete" onClick={() => deleteHandler(blog._id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {blogs.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center' }}>No blog posts configured</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BlogList;
