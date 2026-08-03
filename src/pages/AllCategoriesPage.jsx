import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AllCategoriesPage.css';

// Reuse fallback logic from CategoryList
const CAT_IMAGES = {
    'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400&auto=format&fit=crop',
    'Fashion': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop',
    'Health & Beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop',
    'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop',
    'Toys & Games': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=400&auto=format&fit=crop',
    'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop',
    'Jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop',
    'default': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop',
};

const FALLBACK_CATEGORIES = [
    { _id: 'c1', name: 'Electronics', slug: 'electronics' },
    { _id: 'c2', name: 'Fashion', slug: 'fashion' },
    { _id: 'c3', name: 'Health & Beauty', slug: 'health-beauty' },
    { _id: 'c4', name: 'Furniture', slug: 'furniture' },
    { _id: 'c5', name: 'Toys & Games', slug: 'toys-games' },
    { _id: 'c6', name: 'Sports', slug: 'sports' },
    { _id: 'c7', name: 'Jewelry', slug: 'jewelry' },
];

const AllCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/categories`);
                const active = data.filter(c => c.isActive);
                setCategories(active.length > 0 ? active : FALLBACK_CATEGORIES);
                setLoading(false);
            } catch (err) {
                setCategories(FALLBACK_CATEGORIES);
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const getCatImage = (cat) => {
        if (cat.image) {
            return cat.image.startsWith('http')
                ? cat.image
                : `${window.API_BASE_URL}${cat.image}`;
        }
        return CAT_IMAGES[cat.name] || CAT_IMAGES['default'];
    };

    if (loading) {
        return <div className="loader container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading Categories...</div>;
    }

    return (
        <div className="categories-page container fade-in">
            <div className="categories-header">
                <div className="breadcrumb" style={{ justifyContent: 'center' }}>
                    <Link to="/">Home</Link> &gt; <span>All Categories</span>
                </div>
                <h1 className="categories-title">Shop by Category</h1>
                <p className="categories-subtitle">Discover our wide range of products across all categories</p>
            </div>

            <div className="categories-grid">
                {categories.map((cat) => (
                    <Link key={cat._id} to={`/category/${cat.slug}`} className="category-card">
                        <div className="category-card-img-wrap">
                            <img src={getCatImage(cat)} alt={cat.name} loading="lazy" />
                        </div>
                        <div className="category-card-content">
                            <h3 className="category-card-name">{cat.name}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AllCategoriesPage;
