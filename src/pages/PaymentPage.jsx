import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import CheckoutSteps from '../components/CheckoutSteps';
import './AuthPage.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { shippingAddress, paymentMethod, savePaymentMethod } = useCartStore();
    const { userInfo } = useAuthStore();
    const { settings, getCurrencySymbol } = useSettingsStore();
    const currencySymbol = getCurrencySymbol();
    
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        }
        
        // Fetch wallet balance
        if (userInfo && settings?.isWalletPaymentEnabled !== false) {
            const fetchWallet = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                    const { data } = await axios.get(`${window.API_BASE_URL}/api/wallet`, config);
                    if (data) setWalletBalance(data.balance);
                } catch (e) {
                    console.error('Could not fetch wallet', e);
                }
            };
            fetchWallet();
        }
    }, [navigate, shippingAddress, userInfo, settings]);

    const [paymentMethodState, setPaymentMethodState] = useState(paymentMethod || 'Razorpay');

    const submitHandler = (e) => {
        e.preventDefault();
        savePaymentMethod(paymentMethodState);
        navigate('/placeorder');
    };

    return (
        <div className="auth-container fade-in" style={{ flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '40px' }}>
            <CheckoutSteps step1 step2 step3 />
            <div className="auth-card glass">
                <h1 className="auth-title" style={{ fontSize: '28px' }}>Payment Method</h1>
                <form onSubmit={submitHandler}>
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label style={{ fontSize: '18px', marginBottom: '16px' }}>Select Method</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                                type="radio" 
                                id="Razorpay" 
                                name="paymentMethod" 
                                value="Razorpay" 
                                checked={paymentMethodState === 'Razorpay'}
                                onChange={(e) => setPaymentMethodState(e.target.value)}
                            />
                            <label htmlFor="Razorpay" style={{ marginBottom: 0, fontWeight: 500, color: 'var(--text-primary)' }}>Online Payment (Card/UPI/NetBanking)</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                            <input 
                                type="radio" 
                                id="COD" 
                                name="paymentMethod" 
                                value="COD" 
                                checked={paymentMethodState === 'COD'}
                                onChange={(e) => setPaymentMethodState(e.target.value)}
                            />
                            <label htmlFor="COD" style={{ marginBottom: 0, fontWeight: 500, color: 'var(--text-primary)' }}>Cash On Delivery (COD)</label>
                        </div>
                        
                        {settings?.isWalletPaymentEnabled !== false && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                <input 
                                    type="radio" 
                                    id="Wallet" 
                                    name="paymentMethod" 
                                    value="Wallet" 
                                    checked={paymentMethodState === 'Wallet'}
                                    onChange={(e) => setPaymentMethodState(e.target.value)}
                                    disabled={(walletBalance || 0) <= 0}
                                />
                                <label htmlFor="Wallet" style={{ marginBottom: 0, fontWeight: 500, color: (walletBalance || 0) > 0 ? '#10b981' : 'var(--text-secondary)' }}>
                                    Pay from Wallet (Balance: {currencySymbol}{(walletBalance || 0).toFixed(2)})
                                    {(walletBalance || 0) <= 0 && <span style={{ fontSize: '12px', marginLeft: '8px', color: '#ef4444' }}>(Insufficient Balance)</span>}
                                </label>
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn-primary w-100">Continue</button>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;
