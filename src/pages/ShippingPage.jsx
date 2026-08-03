import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import CheckoutSteps from '../components/CheckoutSteps';
import './AuthPage.css';

const ShippingPage = () => {
    const navigate = useNavigate();
    const { shippingAddress, saveShippingAddress } = useCartStore();

    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');
    const [stateName, setStateName] = useState(shippingAddress.state || '');
    const [phone, setPhone] = useState(shippingAddress.phone || '');

    const submitHandler = (e) => {
        e.preventDefault();
        saveShippingAddress({ address, city, postalCode, country, state: stateName, phone });
        navigate('/payment');
    };

    return (
        <div className="auth-container fade-in" style={{ flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '40px' }}>
            <CheckoutSteps step1 step2 />
            <div className="auth-card glass">
                <h1 className="auth-title" style={{ fontSize: '28px' }}>Shipping</h1>
                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label>Address</label>
                        <input type="text" className="input-field" placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>City</label>
                        <input type="text" className="input-field" placeholder="Enter city" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Postal Code</label>
                        <input type="text" className="input-field" placeholder="Enter postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Country</label>
                        <input type="text" className="input-field" placeholder="Enter country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>State</label>
                        <input type="text" className="input-field" placeholder="Enter state" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Contact Phone</label>
                        <input type="tel" className="input-field" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary w-100">Continue</button>
                </form>
            </div>
        </div>
    );
};

export default ShippingPage;
