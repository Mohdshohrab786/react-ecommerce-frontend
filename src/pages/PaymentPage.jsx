import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import CheckoutSteps from '../components/CheckoutSteps';
import './AuthPage.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { shippingAddress, paymentMethod, savePaymentMethod } = useCartStore();

    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        }
    }, [navigate, shippingAddress]);

    const [paymentMethodState, setPaymentMethodState] = useState(paymentMethod || 'PayPal');

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
                                id="PayPal" 
                                name="paymentMethod" 
                                value="PayPal" 
                                checked={paymentMethodState === 'PayPal'}
                                onChange={(e) => setPaymentMethodState(e.target.value)}
                            />
                            <label htmlFor="PayPal" style={{ marginBottom: 0, fontWeight: 500, color: 'var(--text-primary)' }}>PayPal or Credit Card</label>
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
                    </div>
                    <button type="submit" className="btn-primary w-100">Continue</button>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;
