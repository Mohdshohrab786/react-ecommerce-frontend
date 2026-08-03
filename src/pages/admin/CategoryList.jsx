import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Folder, FolderOpen, Tag, Settings, Trash2, Edit } from 'lucide-react';

const CategoryList = () => {
    const { userInfo } = useAuthStore();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(`${window.API_BASE_URL}/api/categories`);
            setCategories(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            fetchCategories();
        } else {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? Note: Delete its sub-categories first if any exist.')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/categories/${id}`, config);
                fetchCategories();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const createHandler = () => {
        navigate('/admin/category/new/edit');
    };

    // Recursive function to build tree
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

    const categoryTree = buildTree(categories);

    // Component to render a tree row recursively
    const CategoryRow = ({ category, level = 0 }) => {
        return (
            <>
                <tr style={{ background: level === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <td style={{ paddingLeft: `${16 + (level * 32)}px` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {level > 0 && <span style={{ color: 'var(--text-secondary)' }}>└─</span>}
                            {category.children && category.children.length > 0 ? (
                                <FolderOpen size={16} style={{ color: 'var(--accent-color)' }} />
                            ) : (
                                <Tag size={16} style={{ color: 'var(--text-secondary)' }} />
                            )}
                            <strong style={{ color: level === 0 ? '#fff' : 'var(--text-secondary)', fontSize: level === 0 ? '15px' : '14px' }}>
                                {category.name}
                            </strong>
                        </div>
                    </td>
                    <td>
                        <img 
                            src={category.image ? (category.image.startsWith('http') ? category.image : `${window.API_BASE_URL}${category.image}`) : 'https://via.placeholder.com/40'} 
                            alt={category.name} 
                            style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                    </td>
                    <td>{category.slug}</td>
                    <td>
                        {category.isActive ? (
                            <span style={{ 
                                padding: '4px 8px', 
                                background: 'rgba(16, 185, 129, 0.1)', 
                                color: '#10b981',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>Active</span>
                        ) : (
                            <span style={{ 
                                padding: '4px 8px', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>Inactive</span>
                        )}
                    </td>
                    <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link to={`/admin/category/${category._id}/edit`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Edit size={14} /> Edit
                            </Link>
                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => deleteHandler(category._id)}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </td>
                </tr>
                {category.children && category.children.map(child => (
                    <CategoryRow key={child._id} category={child} level={level + 1} />
                ))}
            </>
        );
    };

    return (
        <div className="fade-in pb-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Categories Management</h1>
                <button className="btn-primary" onClick={createHandler}>
                    + Create Category
                </button>
            </div>

            {loading ? <div className="loader">Loading...</div> : error ? <div className="error-message">{error}</div> : (
                <div className="modern-card">
                    <div className="card-header">
                        <Folder size={20} className="card-icon" />
                        <h2>Category Hierarchy Tree</h2>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '16px' }}>NAME</th>
                                        <th>IMAGE</th>
                                        <th>SLUG</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryTree.map((category) => (
                                        <CategoryRow key={category._id} category={category} level={0} />
                                    ))}
                                    {categoryTree.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '32px 0' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>No categories found.</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;
