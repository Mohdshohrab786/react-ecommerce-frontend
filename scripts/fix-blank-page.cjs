const fs = require('fs');
const file = 'D:/Ara Web/react-ecommerce/frontend/src/pages/OrderDetailsPage.jsx';
let code = fs.readFileSync(file, 'utf8');

const modalUI = `
                    {!loadingEligibility && returnData?.canReturn && (
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                            <button className="btn-secondary w-100" onClick={() => openReturnModal('RETURN')} style={{ backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' }}>
                                Request Return
                            </button>
                            <button className="btn-secondary w-100" onClick={() => openReturnModal('REPLACEMENT')} style={{ backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' }}>
                                Request Replace
                            </button>
                        </div>
                    )}

                    {showReturnModal && (
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                            <h5 style={{ marginBottom: '12px', fontWeight: 'bold' }}>{requestType === 'REPLACEMENT' ? 'Request Replacement' : 'Request Return'}</h5>
                            <textarea 
                                rows="3"
                                placeholder="Please describe your reason..."
                                value={returnReasonText}
                                onChange={(e) => setReturnReasonText(e.target.value)}
                                style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            ></textarea>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-primary" onClick={submitReturnRequest} style={{ flex: 1 }}>Submit</button>
                                <button className="btn-secondary" onClick={() => setShowReturnModal(false)} style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </div>
                    )}
`;

// Replace the old return UI block that was causing the error
code = code.replace(/\{\!loadingEligibility && returnData\?\.canReturn && \(\s*<button className="btn-secondary w-100" onClick=\{returnOrderHandler\} style=\{\{ marginBottom: '16px', backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' \}\}>\s*Request Return \/ Replacement\s*<\/button>\s*\)\}/, modalUI);

fs.writeFileSync(file, code);
console.log('OrderDetailsPage.jsx UI fixed');
