import { Link } from 'react-router-dom';
import './CheckoutSteps.css';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
    return (
        <div className="checkout-steps">
            <div className={`step ${step1 ? 'active' : ''}`}>
                {step1 ? <Link to="/login">Sign In</Link> : <span>Sign In</span>}
            </div>
            <div className={`step-divider ${step2 ? 'active' : ''}`}></div>
            <div className={`step ${step2 ? 'active' : ''}`}>
                {step2 ? <Link to="/shipping">Shipping</Link> : <span>Shipping</span>}
            </div>
            <div className={`step-divider ${step3 ? 'active' : ''}`}></div>
            <div className={`step ${step3 ? 'active' : ''}`}>
                {step3 ? <Link to="/payment">Payment</Link> : <span>Payment</span>}
            </div>
            <div className={`step-divider ${step4 ? 'active' : ''}`}></div>
            <div className={`step ${step4 ? 'active' : ''}`}>
                {step4 ? <Link to="/placeorder">Place Order</Link> : <span>Place Order</span>}
            </div>
        </div>
    );
};

export default CheckoutSteps;
