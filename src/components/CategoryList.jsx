import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './CategoryList.css';

// Fallback category images from Unsplash
const CAT_IMAGES = {
    'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=300&auto=format&fit=crop',
    'Fashion': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=300&auto=format&fit=crop',
    'Health & Beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=300&auto=format&fit=crop',
    'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300&auto=format&fit=crop',
    'Toys & Games': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=300&auto=format&fit=crop',
    'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=300&auto=format&fit=crop',
    'Jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=300&auto=format&fit=crop',
    'default': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=300&auto=format&fit=crop',
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

const SWIPER_BREAKPOINTS = {
    320: { slidesPerView: 3, spaceBetween: 10 },
    480: { slidesPerView: 4, spaceBetween: 12 },
    768: { slidesPerView: 5, spaceBetween: 15 },
    1024: { slidesPerView: 7, spaceBetween: 15 },
};

const CategoryList = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/categories`);
                const active = data.filter(c => c.isActive && !c.parentCategory);
                setCategories(active.length > 0 ? active : FALLBACK_CATEGORIES);
            } catch (err) {
                setCategories(FALLBACK_CATEGORIES);
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

    if (categories.length === 0) return null;

    return (
        <div className="category-slider-section">
            <div className="category-slider-header">
                <h3 className="section-title">Shop by Categories</h3>
                <div className="slider-controls">
                    <button className="cat-arrow-btn cat-prev">
                        <ChevronLeft size={16} />
                    </button>
                    <button className="cat-arrow-btn cat-next">
                        <ChevronRight size={16} />
                    </button>
                    <Link to="/categories" className="viewall-link">View All</Link>
                </div>
            </div>

            <Swiper
                modules={[Navigation]}
                spaceBetween={15}
                slidesPerView={3}
                breakpoints={SWIPER_BREAKPOINTS}
                navigation={{
                    prevEl: '.cat-prev',
                    nextEl: '.cat-next',
                }}
                className="category-swiper"
            >
                {categories.map((cat) => (
                    <SwiperSlide key={cat._id}>
                        <Link
                            to={`/category/${cat.slug}`}
                            className="category-slide-item"
                        >
                            <div className="cat-image-wrap">
                                <img
                                    src={getCatImage(cat)}
                                    alt={cat.name}
                                    loading="lazy"
                                />
                            </div>
                            <div className="cat-name">{cat.name}</div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default CategoryList;
