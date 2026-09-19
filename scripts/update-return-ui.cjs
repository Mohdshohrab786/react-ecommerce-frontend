const fs = require('fs');
const file = 'D:/Ara Web/react-ecommerce/frontend/src/pages/OrderDetailsPage.jsx';
let code = fs.readFileSync(file, 'utf8');

// Inject state for return reason
const stateInject = `
    const [cancelData, setCancelData] = useState(null);
    const [returnData, setReturnData] = useState(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReasonText, setReturnReasonText] = useState('');
    const [requestType, setRequestType] = useState('RETURN');
`;
code = code.replace(/const \[cancelData, setCancelData\] = useState\(null\);\s*const \[returnData, setReturnData\] = useState\(null\);/, stateInject);

// Inject logic
const returnLogic = `
    const openReturnModal = (type) => {
        setRequestType(type);
        setReturnReasonText('');
        setShowReturnModal(true);
    };

    const submitReturnRequest = async () => {
        if (!returnReasonText.trim()) {
            return alert('Please enter a reason');
        }
        try {
            const config = { headers: { Authorization: \`Bearer \${userInfo.token}\` } };
            await axios.put(\`\${window.API_BASE_URL}/api/orders/\${orderId}/return\`, { returnReason: returnReasonText, requestType }, config);
            alert(requestType === 'REPLACEMENT' ? 'Replacement Request Initiated successfully' : 'Return Request Initiated successfully');
            setShowReturnModal(false);
            fetchOrder();
        } catch (err) {
            alert(err.response?.data?.message || 'Error requesting return/replacement');
        }
    };
`;
code = code.replace(/const returnOrderHandler = async \(\) => \{[\s\S]*?fetchOrder\(\);\s*\}\s*catch \(err\) \{[\s\S]*?\}\s*\}\s*\};/, returnLogic);

// Replace button UI
const replaceBtnUI = `
                                            {returnData?.canReturn && (
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                    <button type="button" className="btn btn-warning" onClick={() => openReturnModal('RETURN')}>
                                                        <i className="fas fa-undo"></i> Request Return
                                                    </button>
                                                    <button type="button" className="btn btn-info" onClick={() => openReturnModal('REPLACEMENT')}>
                                                        <i className="fas fa-exchange-alt"></i> Request Replacement
                                                    </button>
                                                </div>
                                            )}
                                            {showReturnModal && (
                                                <div className="admin-glass-card" style={{ marginTop: '15px', padding: '15px' }}>
                                                    <h5>{requestType === 'REPLACEMENT' ? 'Request Replacement' : 'Request Return'}</h5>
                                                    <textarea 
                                                        className="form-control"
                                                        rows="3"
                                                        placeholder="Please describe your reason in detail..."
                                                        value={returnReasonText}
                                                        onChange={(e) => setReturnReasonText(e.target.value)}
                                                        style={{ marginBottom: '10px' }}
                                                    ></textarea>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button className="btn btn-primary" onClick={submitReturnRequest}>Submit Request</button>
                                                        <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
                                                    </div>
                                                </div>
                                            )}
`;
code = code.replace(/\{returnData\?\.canReturn && \(\s*<button type="button" className="btn btn-warning mt-2" onClick=\{returnOrderHandler\}>\s*<i className="fas fa-undo"><\/i> Request Return \/ Replacement\s*<\/button>\s*\)\}/, replaceBtnUI);

fs.writeFileSync(file, code);
console.log('OrderDetailsPage.jsx updated');
