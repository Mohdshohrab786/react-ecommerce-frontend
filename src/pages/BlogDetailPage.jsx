import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react';
import './BlogDetailPage.css';

const MOCK_POSTS = [
    {
        _id: 'mock1',
        title: 'The Art of Minimalism: building a capsule wardrobe',
        category: 'Style Guide',
        createdAt: '2026-07-10T00:00:00Z',
        excerpt: 'Discover how to declutter your closet and curate a collection of high-quality, versatile essentials that never go out of style.',
        image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop',
        readTime: '5 min read',
        author: 'Admin',
        content: `
            <p>Building a capsule wardrobe is not just about saving space; it is a philosophy of mindful living. In a world saturated with fleeting trends and cheap quality, choosing to define your style by less is a powerful statement of elegance.</p>
            
            <p>A capsule wardrobe is a curated collection of highly versatile, classic pieces that can be easily combined with one another. It typically consists of 30 to 40 essentials—such as a tailored white shirt, structured blazer, timeless denim, and quality knitwear.</p>
            
            <h3>How to Start Your Capsule Wardrobe:</h3>
            <ol>
                <li><strong>Assess your lifestyle:</strong> Look at your day-to-day activities. Do you spend most of your time in corporate settings, casual layouts, or active spaces? Your wardrobe must reflect your reality, not an idealized version of it.</li>
                <li><strong>Choose a cohesive color palette:</strong> Stick to neutral bases like black, navy, grey, and camel, and select one or two accent colors that complement them. This ensures every piece can mix and match effortlessly.</li>
                <li><strong>Invest in quality over quantity:</strong> It is better to have one premium wool coat that lasts ten years than three synthetic ones that wear out in a single season. Pay attention to fabric compositions—look for silk, organic cotton, linen, and wool.</li>
            </ol>
            
            <p>Remember, minimalism is not about deprivation. It is about creating space for what truly matters, ensuring you start every single day feeling confident and comfortable in what you wear.</p>
        `
    },
    {
        _id: 'mock2',
        title: 'Summer Trends: lightweight fabrics and soft palettes',
        category: 'Trends',
        createdAt: '2026-07-05T00:00:00Z',
        excerpt: 'From organic linen to breathable cotton blends, explore the textures and light colors that will keep you cool and elegant all summer long.',
        image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop',
        readTime: '4 min read',
        author: 'Admin',
        content: `
            <p>As summer reaches its peak, our wardrobe demands a shift towards breathability and ease without sacrificing style. This season, fashion embraces raw, natural textures and soft, sun-washed color palettes that feel effortless.</p>
            
            <p>The secret to summer styling is fabric selection. Synthetic fibers like polyester trap heat and moisture, whereas natural materials allow air to flow freely. Let's look at the absolute essentials for this hot season.</p>
            
            <h3>The Pillars of Summer Comfort:</h3>
            <ul>
                <li><strong>Pure Organic Linen:</strong> Known for its signature relaxed drape and visible weave, linen is the ultimate summer fabric. A linen button-down shirt paired with tailored shorts creates an instant, elegant look.</li>
                <li><strong>Lighweight Cotton:</strong> Cotton is a staple, but this season favors fine knits, poplins, and organic voile. They feel featherlight against the skin.</li>
                <li><strong>Soft Earthy Palettes:</strong> Think off-whites, muted olives, soft sages, sandy beige, and pastel blues. These shades not only reflect sunlight better than dark hues but also project a serene, chic aesthetic.</li>
            </ul>
            
            <p>Opt for relaxed silhouettes that allow movement. Wide-leg linen trousers and oversized shirts are modern classics that keep you elegant throughout hot summer afternoons and relaxed evening dinners.</p>
        `
    },
    {
        _id: 'mock3',
        title: 'Sourcing Sustainably: what goes into eco-luxury',
        category: 'Sustainability',
        createdAt: '2026-06-28T00:00:00Z',
        excerpt: 'An inside look at our ethical manufacturing partnerships and our commitment to sourcing certified organic and recycled raw materials.',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop',
        readTime: '7 min read',
        author: 'Admin',
        content: `
            <p>True luxury lies in the details—including the story behind how a garment is created. Today, eco-luxury represents the pinnacle of craftsmanship, proving that premium design can coexist with environmental stewardship.</p>
            
            <p>At Envogue, sustainability is not a marketing buzzword; it is the blueprint of our production. We trace our supply chain from the raw cotton fields to the final sewing rooms, ensuring everyone involved is treated with dignity and respect.</p>
            
            <h3>Our Sustainability Standards:</h3>
            <p>We focus on three primary pillars of eco-responsible manufacturing:</p>
            <ol>
                <li><strong>Certified Organic Materials:</strong> Our garments use GOTS-certified organic cotton, which consumes 91% less water than conventional cotton and uses absolutely no toxic pesticides.</li>
                <li><strong>Circular Materials:</strong> We incorporate recycled wool and ocean-bound plastics transformed into premium durable yarns for our hardware and linings.</li>
                <li><strong>Zero-Waste Production:</strong> By utilizing advanced 3D knitting technology and low-impact dyes, we optimize our design phases to produce virtually zero waste.</li>
            </ol>
            
            <p>Investing in eco-luxury is a choice to respect the earth while enjoying outstanding design and quality. It is fashion you can feel good about owning for a lifetime.</p>
        `
    }
];

const BlogDetailPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogDetails = async () => {
            if (id && id.startsWith('mock')) {
                const mockPost = MOCK_POSTS.find(p => p._id === id);
                if (mockPost) {
                    setBlog(mockPost);
                } else {
                    setError('Mock blog post not found');
                }
                setLoading(false);
            } else {
                try {
                    const { data } = await axios.get(`${window.API_BASE_URL}/api/blogs/${id}`);
                    setBlog(data);
                } catch (err) {
                    setError(err.response?.data?.message || err.message);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBlogDetails();
    }, [id]);

    if (loading) {
        return <div className="loader container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading Article Details...</div>;
    }

    if (error || !blog) {
        return (
            <div className="container error-container" style={{ padding: '80px 30px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Article Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>{error || "The article you are looking for does not exist."}</p>
                <Link to="/blog" className="btn-primary">Back to Editorial</Link>
            </div>
        );
    }

    return (
        <div className="blog-detail-page fade-in">
            {/* Header Cover Banner */}
            <div className="detail-cover-wrapper">
                <img 
                    src={blog.image.startsWith('http') ? blog.image : `${window.API_BASE_URL}${blog.image}`} 
                    alt={blog.title} 
                    className="detail-cover-image" 
                />
                <div className="cover-overlay"></div>
            </div>

            <div className="container article-container">
                <div className="back-btn-wrapper">
                    <Link to="/blog" className="back-btn-editorial">
                        <ArrowLeft size={16} /> Back to Editorial
                    </Link>
                </div>

                <article className="article-content">
                    {/* Category Label */}
                    <div className="article-category">
                        <Tag size={14} style={{ marginRight: '6px' }} />
                        <span>{blog.category}</span>
                    </div>

                    {/* Title */}
                    <h1 className="article-title">{blog.title}</h1>

                    {/* Metadata bar */}
                    <div className="article-meta">
                        <div className="meta-item">
                            <User size={16} />
                            <span>By {blog.author}</span>
                        </div>
                        <div className="meta-item">
                            <Calendar size={16} />
                            <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="meta-item">
                            <Clock size={16} />
                            <span>{blog.readTime}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="article-divider"></div>

                    {/* Excerpt */}
                    <p className="article-excerpt">
                        {blog.excerpt}
                    </p>

                    {/* Content body */}
                    <div 
                        className="article-body" 
                        dangerouslySetInnerHTML={{ __html: blog.content }} 
                    />
                </article>
            </div>
        </div>
    );
};

export default BlogDetailPage;
