const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/pages/OrderDetailsPage.jsx');
let code = fs.readFileSync(file, 'utf8');

// Inject wallet state
const walletStateSnippet = `
    const [wallet, setWallet] = useState(null);
    const [useWallet, setUseWallet] = useState(false);
`;
code = code.replace(/const \[deliverLoading, setDeliverLoading\] = useState\(false\);/, 'const [deliverLoading, setDeliverLoading] = useState(false);\n' + walletStateSnippet);

// Inject wallet fetch
const fetchWalletSnippet = `
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
            
            // Check Wallet
            if (!data.isPaid && data.status !== 'Cancelled' && data.status !== 'Returned') {
                try {
                    const walletRes = await axios.get(\`\${window.API_BASE_URL}/api/wallet\`, config);
                    if (walletRes.data.success && walletRes.data.wallet) {
                        setWallet(walletRes.data.wallet);
                    }
                } catch(e) {
                    console.error("Wallet fetch error", e);
                }
            }
            
            setLoadingEligibility(false);
            setLoading(false);
`;
code = code.replace(/try\s*\{\s*const config = \{ headers: \{ Authorization: `Bearer \$\{userInfo\.token\}` \} \};\s*const \{ data \} = await axios\.get\(`\$\{window\.API_BASE_URL\}\/api\/orders\/\$\{orderId\}`,\s*config\);\s*setOrder\(data\);\s*[\s\S]*?setLoading\(false\);/, fetchWalletSnippet);

// Update Handle Razorpay Payment
code = code.replace(/const \{ data: razorpayOrder \} = await axios\.post\([\s\S]*?\{\}, config\s*\);/, 
`const { data: razorpayOrder } = await axios.post(
    \`\${window.API_BASE_URL}/api/orders/\${orderId}/create-razorpay-order\`,
    { walletAmountUsed: useWallet && wallet && wallet.balance > 0 ? Math.min(wallet.balance, order.totalPrice) : 0 }, 
    config
);`);

code = code.replace(/await axios\.post\(\s*`\$\{window\.API_BASE_URL\}\/api\/orders\/\$\{orderId\}\/verify-razorpay-payment`,\s*response,\s*config\s*\);/,
`await axios.post(
    \`\${window.API_BASE_URL}/api/orders/\${orderId}/verify-razorpay-payment\`,
    { ...response, walletAmountUsed: useWallet && wallet && wallet.balance > 0 ? Math.min(wallet.balance, order.totalPrice) : 0 },
    config
);`);

// Pay with Wallet Only handler
const payWithWalletHandlerSnippet = `
    const payWithWalletOnlyHandler = async () => {
        setPayLoading(true);
        setError('');
        try {
            const config = { headers: { Authorization: \`Bearer \${userInfo.token}\` } };
            await axios.post(\`\${window.API_BASE_URL}/api/orders/\${orderId}/pay-with-wallet\`, {}, config);
            alert('Payment Successful via Wallet');
            fetchOrder();
        } catch (err) {
            setError(err.response?.data?.message || 'Wallet payment failed');
        } finally {
            setPayLoading(false);
        }
    };
`;
code = code.replace(/const payOrderHandler = async \(\) => \{/, payWithWalletHandlerSnippet + '\n    const payOrderHandler = async () => {');

// Render Wallet Checkbox and Buttons
const walletPaymentUIRenderSnippet = `
                    {!order.isPaid && !isCancelledOrReturned && (
                        <div style={{ marginBottom: '16px' }}>
                            {wallet && wallet.balance > 0 && settings?.isWalletPaymentEnabled && (
                                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="useWallet" 
                                        checked={useWallet} 
                                        onChange={(e) => setUseWallet(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="useWallet" style={{ cursor: 'pointer', margin: 0, fontWeight: '500' }}>
                                        Use Wallet Balance ({currencySymbol}{wallet.balance.toFixed(2)})
                                    </label>
                                </div>
                            )}

                            {useWallet && wallet && wallet.balance >= order.totalPrice ? (
                                <button className="btn-primary w-100" onClick={payWithWalletOnlyHandler} disabled={payLoading}>
                                    {payLoading ? 'Processing...' : 'Pay with Wallet'}
                                </button>
                            ) : (
                                <button className="btn-primary w-100" onClick={payOrderHandler} disabled={payLoading}>
                                    {payLoading ? 'Processing...' : (userInfo?.isAdmin ? 'Mark As Paid (Cash Collected)' : 
                                        (useWallet && wallet && wallet.balance > 0) ? \`Pay \${currencySymbol}\${(order.totalPrice - wallet.balance).toFixed(2)} Online\` : 'Pay Online Now'
                                    )}
                                </button>
                            )}
                        </div>
                    )}
`;
code = code.replace(/\{\!order\.isPaid && \!isCancelledOrReturned && \([\s\S]*?<\/button>\s*\)\}/, walletPaymentUIRenderSnippet);

fs.writeFileSync(file, code);
console.log('OrderDetailsPage Wallet Payment UI updated');
