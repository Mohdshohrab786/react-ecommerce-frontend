import React, { useEffect } from 'react';
import './AboutPage.css'; // Reusing about page styles for consistency

const PolicyPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-page container fade-in" style={{ paddingBottom: '60px' }}>
            <header className="about-header" style={{ marginBottom: '40px' }}>
                <h1>Our Policies</h1>
                <p className="subtitle">Terms, Privacy, and our hassle-free Return & Wallet policies.</p>
            </header>

            <div className="about-content">
                <div className="about-section-grid" style={{ display: 'block' }}>
                    <div className="about-text-wrapper" style={{ width: '100%', marginBottom: '40px' }}>
                        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>1. Return & Replacement Policy</h2>
                        <p>
                            We want you to be completely satisfied with your purchase. If a product does not meet your expectations, we offer a seamless Return and Replacement system.
                        </p>
                        <ul>
                            <li><strong>Eligibility:</strong> Most products are eligible for a return or replacement within 7 to 30 days of delivery, depending on the specific item's return policy.</li>
                            <li><strong>Replacements:</strong> If an item is damaged or defective, you can request a Replacement. Our delivery partner will pick up the defective item and deliver a brand new one to your address.</li>
                            <li><strong>Condition:</strong> Items must be returned in their original packaging, unused, and with all tags intact.</li>
                        </ul>
                    </div>

                    <div className="about-text-wrapper" style={{ width: '100%', marginBottom: '40px' }}>
                        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>2. Refund & Wallet Policy</h2>
                        <p>
                            We have integrated a lightning-fast digital Wallet system to ensure your refunds and payments are secure and instant.
                        </p>
                        <ul>
                            <li><strong>Instant Auto-Refunds:</strong> When you cancel an order, or when a returned item is received by our warehouse, the refund amount is <b>instantly credited to your Envogue Wallet</b>.</li>
                            <li><strong>Wallet Security:</strong> Our wallet system uses advanced atomic transaction processing to ensure 100% security and accuracy against race conditions or double payments.</li>
                            <li><strong>Using Wallet Balance:</strong> You can use your Wallet balance to purchase any item on our store. If your wallet balance is insufficient, you can pay the remaining amount via online payment gateways.</li>
                        </ul>
                    </div>

                    <div className="about-text-wrapper" style={{ width: '100%', marginBottom: '40px' }}>
                        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>3. Secure Payments</h2>
                        <p>
                            Your financial security is our top priority. We employ industry-leading security measures to protect your data.
                        </p>
                        <ul>
                            <li><strong>Price Integrity:</strong> Our backend systems rigidly verify all item prices directly from our secure database during checkout, preventing any tampering or price manipulation.</li>
                            <li><strong>Encrypted Transactions:</strong> All online payments (Credit Card, UPI, Netbanking) are securely processed via Razorpay with end-to-end encryption.</li>
                        </ul>
                    </div>

                    <div className="about-text-wrapper" style={{ width: '100%' }}>
                        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>4. Privacy Policy</h2>
                        <p>
                            We respect your privacy. Your personal information (Name, Email, Phone, Address) is securely stored and only used for order fulfillment, wallet transactions, and necessary SMS/Email notifications (like OTPs and Order Status Updates). We never sell your data to third-party services.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;
