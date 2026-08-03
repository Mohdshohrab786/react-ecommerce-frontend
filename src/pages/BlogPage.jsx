import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './BlogPage.css';

const MOCK_POSTS = [
    {
        _id: 'mock1',
        title: 'The Art of Minimalism: building a capsule wardrobe',
        category: 'Style Guide',
        createdAt: '2026-07-10T00:00:00Z',
        excerpt: 'Discover how to declutter your closet and curate a collection of high-quality, versatile essentials that never go out of style.',
        image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop',
        readTime: '5 min read'
    },
    {
        _id: 'mock2',
        title: 'Summer Trends: lightweight fabrics and soft palettes',
        category: 'Trends',
        createdAt: '2026-07-05T00:00:00Z',
        excerpt: 'From organic linen to breathable cotton blends, explore the textures and light colors that will keep you cool and elegant all summer long.',
        image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop',
        readTime: '4 min read'
    },
    {
        _id: 'mock3',
        title: 'Sourcing Sustainably: what goes into eco-luxury',
        category: 'Sustainability',
        createdAt: '2026-06-28T00:00:00Z',
        excerpt: 'An inside look at our ethical manufacturing partnerships and our commitment to sourcing certified organic and recycled raw materials.',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop',
        readTime: '7 min read'
    }
];

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [banner, setBanner] = useState(null);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                // Fetch blogs
                const { data: blogData } = await axios.get(`${window.API_BASE_URL}/api/blogs`);
                const activeBlogs = blogData.filter(b => b.isActive);
                if (activeBlogs.length === 0) {
                    setBlogs(MOCK_POSTS);
                } else {
                    setBlogs(activeBlogs);
                }

                // Fetch page banner
                const { data: bannerData } = await axios.get(`${window.API_BASE_URL}/api/banners`);
                const pageBanner = bannerData.find(b => b.type === 'Blog' && b.isActive);
                if (pageBanner) {
                    setBanner(pageBanner);
                }
            } catch (error) {
                console.error("Error fetching blog data:", error);
                setBlogs(MOCK_POSTS);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []);

    if (loading) {
        return <div className="loader container">Loading Editorial Articles...</div>;
    }

    return (
        <div className="blog-page container fade-in">
            {banner ? (
                <div className="page-hero-banner" style={{ backgroundImage: `url(${banner.image.startsWith('http') ? banner.image : `${window.API_BASE_URL}${banner.image}`})` }}>
                    <div className="banner-overlay"></div>
                    <div className="banner-content">
                        <h1>{banner.title}</h1>
                        <p className="subtitle">Insights on sustainable luxury, design philosophy, and curating your signature style.</p>
                    </div>
                </div>
            ) : (
                <header className="blog-header">
                    <h1>The Editorial</h1>
                    <p className="subtitle">Insights on sustainable luxury, design philosophy, and curating your signature style.</p>
                </header>
            )}

            <div className="blog-grid">
                {blogs.map((post) => (
                    <article key={post._id} className="blog-post-card">
                        <div className="blog-post-image-wrapper">
                            <img 
                                src={post.image.startsWith('http') ? post.image : `${window.API_BASE_URL}${post.image}`} 
                                alt={post.title} 
                                className="blog-post-image" 
                            />
                            <span className="blog-post-category">{post.category}</span>
                        </div>
                        <div className="blog-post-content">
                            <div className="blog-post-meta">
                                <span className="date">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                <span className="separator">•</span>
                                <span className="read-time">{post.readTime}</span>
                            </div>
                            <Link to={`/blog/${post._id}`}>
                                <h2 className="blog-post-title">{post.title}</h2>
                            </Link>
                            <p className="blog-post-excerpt">{post.excerpt}</p>
                            <Link to={`/blog/${post._id}`} className="blog-post-link">Read Article &rarr;</Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default BlogPage;
