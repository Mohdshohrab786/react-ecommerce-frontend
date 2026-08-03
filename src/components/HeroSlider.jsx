import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HeroSlider.css';

const DEFAULT_SLIDES = [
    {
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop',
        title: 'New Season Collection',
        subtitle: 'Discover the latest arrivals in electronics & fashion',
        link: '/',
        btnText: 'Shop Now',
    },
    {
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
        title: 'Flash Sale — Up to 50% Off',
        subtitle: 'Limited time deals on top brands',
        link: '/',
        btnText: 'View Deals',
    },
    {
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
        title: 'Premium Watches & Jewelry',
        subtitle: 'Elegance for every occasion',
        link: '/',
        btnText: 'Explore',
    },
];

const MINI_BANNERS = [
    {
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop',
        link: '/',
        alt: 'Electronics',
    },
    {
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',
        link: '/',
        alt: 'Footwear',
    },
    {
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop',
        link: '/',
        alt: 'Bags',
    },
    {
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400&auto=format&fit=crop',
        link: '/',
        alt: 'Gadgets',
    },
];

const HeroSlider = () => {
    const [slides, setSlides] = useState(DEFAULT_SLIDES);
    const [miniBanners, setMiniBanners] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/banners`);
                const sliderBanners = data.filter(b => b.isActive && (b.type === 'Homepage' || b.type === 'Slider'));
                if (sliderBanners.length > 0) {
                    const mappedBanners = sliderBanners.map(b => ({
                        image: b.image?.startsWith('http') ? b.image : `${window.API_BASE_URL}${b.image}`,
                        title: b.title || 'Shop Now',
                        subtitle: b.subtitle || '',
                        link: b.link || '/',
                        btnText: 'Shop Now',
                    }));
                    setSlides(mappedBanners);
                }
            } catch (err) {
                // Fallback to defaults
            }
        };

        const fetchMiniBanners = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/banners`);
                const activeOffers = data.filter(b => b.isActive && b.type === 'Offer');
                if (activeOffers.length > 0) {
                    const formatted = activeOffers.map(b => ({
                        image: b.image?.startsWith('http') ? b.image : `${window.API_BASE_URL}${b.image}`,
                        link: b.link || '/',
                        alt: b.title || 'Offer'
                    }));
                    
                    const padded = [...formatted];
                    for (let i = formatted.length; i < 4; i++) {
                        padded.push(MINI_BANNERS[i]);
                    }
                    setMiniBanners(padded);
                }
            } catch (err) {
                console.error("Error loading mini banners:", err);
            }
        };

        fetchBanners();
        fetchMiniBanners();
    }, []);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            goToNext();
        }, 5000);
        return () => clearInterval(timer);
    }, [currentSlide, slides.length]);

    const goToSlide = (idx) => {
        if (isAnimating || idx === currentSlide) return;
        setIsAnimating(true);
        setCurrentSlide(idx);
        setTimeout(() => setIsAnimating(false), 600);
    };

    const goToNext = () => {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    };

    const goToPrev = () => {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prev);
    };

    return (
        <div className="home2-top-content">
            <div className="container">
                <div className="box-content1">
                    {/* Main Slider — 8 cols */}
                    <div className="col-slider">
                        <div className="hero-slider-wrapper">
                            {slides.map((slide, idx) => (
                                <div
                                    key={idx}
                                    className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
                                    style={{ backgroundImage: `url(${slide.image})` }}
                                >
                                    <div className="slide-overlay"></div>
                                    <div className="slide-content">
                                        <h2 className="slide-title">{slide.title}</h2>
                                        <p className="slide-subtitle">{slide.subtitle}</p>
                                        <Link to={slide.link} className="slide-btn">
                                            {slide.btnText} →
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {/* Nav arrows */}
                            <button className="slider-arrow prev-arrow" onClick={goToPrev}>‹</button>
                            <button className="slider-arrow next-arrow" onClick={goToNext}>›</button>

                            {/* Dots */}
                            <div className="slider-dots">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
                                        onClick={() => goToSlide(idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mini Banners — 4 cols */}
                    <div className="col-banners">
                        <div className="mini-banners-grid">
                            {(miniBanners.length > 0 ? miniBanners : MINI_BANNERS).map((banner, idx) => (
                                <Link key={idx} to={banner.link} className="mini-banner-item">
                                    <img src={banner.image} alt={banner.alt} loading="lazy" />
                                    <div className="mini-banner-overlay">
                                        <span>{banner.alt}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSlider;
