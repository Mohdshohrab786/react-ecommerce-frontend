import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSettingsStore } from '../store/useSettingsStore';
import './ContactPage.css';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const ContactPage = () => {
    const settings = useSettingsStore(state => state.settings);
    const socialLinks = settings?.socialLinks || {};

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const [banner, setBanner] = useState(null);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const { data } = await axios.get(`${window.API_BASE_URL}/api/banners`);
                const pageBanner = data.find(b => b.type === 'Contact' && b.isActive);
                if (pageBanner) {
                    setBanner(pageBanner);
                }
            } catch (error) {
                console.error("Error fetching contact page banner:", error);
            }
        };
        fetchBanner();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setTimeout(() => {
            setSubmitted(true);
        }, 800);
    };

    return (
        <div className="contact-page container fade-in">
            {banner ? (
                <div className="page-hero-banner" style={{ backgroundImage: `url(${banner.image.startsWith('http') ? banner.image : `${window.API_BASE_URL}${banner.image}`})` }}>
                    <div className="banner-overlay"></div>
                    <div className="banner-content">
                        <h1>{banner.title}</h1>
                        <p className="subtitle">Have questions or feedback? We'd love to hear from you.</p>
                    </div>
                </div>
            ) : (
                <header className="contact-header">
                    <h1>Get In Touch</h1>
                    <p className="subtitle">Have questions or feedback? We'd love to hear from you.</p>
                </header>
            )}

            <div className="contact-grid">
                {/* Contact Information */}
                <div className="contact-info glass-panel">
                    <h2>Contact Information</h2>
                    <p className="info-desc">
                        Our customer service team is available Monday to Friday, 9:00 AM - 6:00 PM EST. Fill out the form or reach us via our details.
                    </p>

                    <div className="info-items">
                        <div className="info-item">
                            <MapPin className="info-icon" size={20} />
                            <div>
                                <h3>Address</h3>
                                <p>{settings?.contactDetails?.address || 'Delhi okhla, New Delhi 110025, India'}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Phone className="info-icon" size={20} />
                            <div>
                                <h3>Phone</h3>
                                <p>{settings?.contactDetails?.phone || '+91-7500474822'}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Mail className="info-icon" size={20} />
                            <div>
                                <h3>Email</h3>
                                <p>{settings?.contactDetails?.email || 'shohrab.arawebtechnology@gmail.com'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-socials" style={{ marginTop: '20px', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', fontWeight: 600 }}>Follow Us</h3>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <a 
                                href={socialLinks.instagram || "https://instagram.com"} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'var(--bg-secondary, #f8f9fa)', border: '1px solid var(--border-color, #eaeaea)', color: '#e1306c', transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#e1306c'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary, #f8f9fa)'; e.currentTarget.style.color = '#e1306c'; }}
                                title="Instagram"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a 
                                href={socialLinks.twitter || "https://twitter.com"} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'var(--bg-secondary, #f8f9fa)', border: '1px solid var(--border-color, #eaeaea)', color: '#1da1f2', transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#1da1f2'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary, #f8f9fa)'; e.currentTarget.style.color = '#1da1f2'; }}
                                title="Twitter"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                            </a>
                            <a 
                                href={socialLinks.facebook || "https://facebook.com"} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'var(--bg-secondary, #f8f9fa)', border: '1px solid var(--border-color, #eaeaea)', color: '#1877f2', transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#1877f2'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary, #f8f9fa)'; e.currentTarget.style.color = '#1877f2'; }}
                                title="Facebook"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                            <a 
                                href={socialLinks.youtube || "https://youtube.com"} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'var(--bg-secondary, #f8f9fa)', border: '1px solid var(--border-color, #eaeaea)', color: '#ff0000', transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#ff0000'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary, #f8f9fa)'; e.currentTarget.style.color = '#ff0000'; }}
                                title="YouTube"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                            </a>
                        </div>
                    </div>

                    <div className="map-placeholder">
                        {/* Elegant minimalist map background placeholder */}
                        <div className="placeholder-text">NYC Flagship Store</div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="contact-form-container glass-panel">
                    {submitted ? (
                        <div className="success-state">
                            <CheckCircle size={64} className="success-icon" />
                            <h2>Message Sent!</h2>
                            <p>Thank you for contacting Envogue. Our team will review your message and get back to you within 24-48 business hours.</p>
                            <button className="btn-primary" onClick={() => {
                                setSubmitted(false);
                                setName('');
                                setEmail('');
                                setSubject('');
                                setMessage('');
                            }}>Send Another Message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="contact-form">
                            <h2>Send Us A Message</h2>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    className="modern-input" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    required 
                                    placeholder="Your Name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    className="modern-input" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    placeholder="yourname@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input 
                                    type="text" 
                                    id="subject" 
                                    className="modern-input" 
                                    value={subject} 
                                    onChange={e => setSubject(e.target.value)} 
                                    required 
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea 
                                    id="message" 
                                    className="modern-textarea" 
                                    value={message} 
                                    onChange={e => setMessage(e.target.value)} 
                                    required 
                                    rows={5}
                                    placeholder="Type your message here..."
                                ></textarea>
                            </div>

                            <button type="submit" className="btn-primary submit-btn">
                                <Send size={18} style={{ marginRight: '8px' }} /> Send Message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
