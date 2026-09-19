const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/pages/OrderDetailsPage.jsx');
let code = fs.readFileSync(file, 'utf8');

// We need to inject states for cancel and return eligibility
const stateSnippet = `
    const [cancelData, setCancelData] = useState(null);
    const [returnData, setReturnData] = useState(null);
    const [loadingEligibility, setLoadingEligibility] = useState(true);
`;
code = code.replace(/const \[deliverLoading, setDeliverLoading\] = useState\(false\);/, 'const [deliverLoading, setDeliverLoading] = useState(false);\n' + stateSnippet);

// We need to inject fetching logic
const fetchSnippet = `
        try {
            const config = { headers: { Authorization: \`Bearer \${userInfo.token}\` } };
            const { data } = await axios.get(\`\${window.API_BASE_URL}/api/orders/\${orderId}\`, config);
            setOrder(data);
            
            // Check eligibility
            try {
                const cancelRes = await axios.get(\`\${window.API_BASE_URL}/api/orders/\${orderId}/cancellation-eligibility\`, config);
                setCancelData(cancelRes.data);
                
                if (data.isDelivered || data.status === 'Delivered') {
                    const returnRes = await axios.get(\`\${window.API_BASE_URL}/api/orders/\${orderId}/return-eligibility\`, config);
                    setReturnData(returnRes.data);
                }
            } catch(e) {
                console.error("Eligibility check error", e);
            }
            
            setLoadingEligibility(false);
            setLoading(false);
`;
code = code.replace(/try\s*\{\s*const config = \{ headers: \{ Authorization: `Bearer \$\{userInfo\.token\}` \} \};\s*const \{ data \} = await axios\.get\(`\$\{window\.API_BASE_URL\}\/api\/orders\/\$\{orderId\}`,\s*config\);\s*setOrder\(data\);\s*setLoading\(false\);/, fetchSnippet);

// We need to update payment method display
const paymentMethodSnippet = `
                        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Payment Method</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            <strong>Method:</strong> {order.paymentMethod}
                        </p>
                        {order.walletAmount > 0 && (
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <strong>Paid from Wallet:</strong> {currencySymbol}{order.walletAmount.toFixed(2)}
                            </p>
                        )}
                        {order.onlineAmount > 0 && (
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <strong>Paid Online:</strong> {currencySymbol}{order.onlineAmount.toFixed(2)}
                            </p>
                        )}
                        <p style={{ marginBottom: '16px' }}></p>
`;
code = code.replace(/<h2 style=\{\{ fontSize: '24px', marginBottom: '16px' \}\}>Payment Method<\/h2>[\s\S]*?(?=\{order\.isPaid \? \()/, paymentMethodSnippet);

// We need to update the buttons for Cancel and Return
const buttonsSnippet = `
                    {!loadingEligibility && cancelData?.canCancel && (
                        <button className="btn-secondary w-100" onClick={cancelOrderHandler} style={{ marginBottom: '16px', backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}>
                            Cancel Order
                        </button>
                    )}
                    
                    {!loadingEligibility && !cancelData?.canCancel && cancelData?.reason && !isCancelledOrReturned && (
                        <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '16px', textAlign: 'center' }}>
                            {cancelData.reason}
                        </div>
                    )}

                    {!loadingEligibility && returnData?.canReturn && (
                        <button className="btn-secondary w-100" onClick={returnOrderHandler} style={{ marginBottom: '16px', backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' }}>
                            Request Return / Replacement
                        </button>
                    )}
                    
                    {!loadingEligibility && !returnData?.canReturn && returnData?.reason && actualStatus === 'Delivered' && (
                        <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '16px', textAlign: 'center' }}>
                            {returnData.reason}
                        </div>
                    )}
`;
code = code.replace(/\{\['Pending', 'Confirmed', 'Processing'\]\.includes\(actualStatus\) && \([\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>)/, buttonsSnippet);

fs.writeFileSync(file, code);
console.log('OrderDetailsPage.jsx updated');
