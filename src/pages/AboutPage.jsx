import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AboutPage.css';

const AboutPage = () => {
    const [banner, setBanner] = useState(null);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/banners`);
                const pageBanner = data.find(b => b.type === 'About' && b.isActive);
                if (pageBanner) {
                    setBanner(pageBanner);
                }
            } catch (error) {
                console.error("Error fetching about page banner:", error);
            }
        };
        fetchBanner();
    }, []);

    return (
        <div className="about-page container fade-in">
            {banner ? (
                <div className="page-hero-banner" style={{ backgroundImage: `url(${banner.image.startsWith('http') ? banner.image : `${window.API_BASE_URL}${banner.image}`})` }}>
                    <div className="banner-overlay"></div>
                    <div className="banner-content">
                        <h1>{banner.title}</h1>
                        <p className="subtitle">Crafting elegance, defining modern luxury since 2020.</p>
                    </div>
                </div>
            ) : (
                <header className="about-header">
                    <h1>About Envogue</h1>
                    <p className="subtitle">Crafting elegance, defining modern luxury since 2020.</p>
                </header>
            )}

            <div className="about-content">
                <div className="about-section-grid">
                    <div className="about-image-wrapper">
                        <img 
                            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop" 
                            alt="Fashion craftsmanship" 
                            className="about-image"
                        />
                    </div>
                    <div className="about-text-wrapper">
                        <h2>Our Story</h2>
                        <p>
                            Envogue was founded with a singular, clear vision: to redefine contemporary fashion with a focus on minimalist elegance, sustainable craftsmanship, and timeless aesthetics. We believe that what you wear is an extension of your identity, and every garment should tell a story of quality and design excellence.
                        </p>
                        <p>
                            We work closely with ethical artisans and premium textile mills to source only the finest fabrics. By balancing classic tailoring with modern silhouettes, we create pieces that transcend seasonal trends.
                        </p>
                    </div>
                </div>

                <div className="about-section-grid reverse" style={{ marginTop: '80px' }}>
                    <div className="about-text-wrapper">
                        <h2>Our Philosophy</h2>
                        <p>
                            In a world of fast fashion, Envogue stands for mindful design. We release curated collections in limited quantities to minimize waste and ensure every single piece meets our rigorous standards of craftsmanship.
                        </p>
                        <p>
                            Every seam, button, and fabric choice is intentional. We create luxury essentials that feel exceptional to wear, are built to last, and align with a modern lifestyle of conscious elegance.
                        </p>
                    </div>
                    <div className="about-image-wrapper">
                        <img 
                            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop" 
                            alt="Tailoring and design" 
                            className="about-image"
                        />
                    </div>
                </div>

                <div className="about-values">
                    <div className="value-card">
                        <h3>Ethical Sourcing</h3>
                        <p>We partner only with manufacturers who guarantee fair wages, safe conditions, and eco-friendly practices.</p>
                    </div>
                    <div className="value-card">
                        <h3>Premium Quality</h3>
                        <p>From organic cotton to Italian wool, we select raw materials that guarantee premium feel and durability.</p>
                    </div>
                    <div className="value-card">
                        <h3>Conscious Design</h3>
                        <p>We reduce our ecological footprint by using recyclable packaging and optimizing low-waste production lines.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
