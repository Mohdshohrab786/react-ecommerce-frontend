import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock } from 'lucide-react';
import './AuthPage.css';

const WalletPage = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');

    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const getCurrencySymbol = useSettingsStore(state => state.getCurrencySymbol);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        const fetchWallet = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data: walletData } = await axios.get(`${window.API_BASE_URL}/api/wallet`, config);
                const { data: txnData } = await axios.get(`${window.API_BASE_URL}/api/wallet/transactions`, config);
                
                setWallet(walletData.wallet);
                setTransactions(txnData.transactions);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchWallet();
    }, [userInfo, navigate]);

    if (loading) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Loading Wallet...</div>;
    if (error) return <div className="container" style={{ marginTop: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'ALL') return true;
        if (filter === 'CREDITS') return t.direction === 'CREDIT';
        if (filter === 'DEBITS') return t.direction === 'DEBIT';
        if (filter === 'REFUNDS') return t.type === 'REFUND';
        if (filter === 'PAYMENTS') return t.type === 'WALLET_PAYMENT';
        return true;
    });

    return (
        <div className="container fade-in" style={{ marginTop: '40px', marginBottom: '60px' }}>
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '30px' }}>My Wallet</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="auth-card glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'var(--primary-color)', color: '#fff', padding: '16px', borderRadius: '50%' }}>
                        <Wallet size={32} />
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Available Balance</h4>
                        <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>{getCurrencySymbol()}{wallet?.balance?.toFixed(2)}</h2>
                    </div>
                </div>
                
                <div className="auth-card glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '16px', borderRadius: '50%' }}>
                        <ArrowUpRight size={32} />
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Total Credited</h4>
                        <h2 style={{ color: '#22c55e', margin: 0 }}>{getCurrencySymbol()}{wallet?.totalCredited?.toFixed(2)}</h2>
                    </div>
                </div>

                <div className="auth-card glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: '50%' }}>
                        <ArrowDownRight size={32} />
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Total Debited</h4>
                        <h2 style={{ color: '#ef4444', margin: 0 }}>{getCurrencySymbol()}{wallet?.totalDebited?.toFixed(2)}</h2>
                    </div>
                </div>
            </div>

            <div className="auth-card glass" style={{ maxWidth: '100%', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Transaction History</h3>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                        {['ALL', 'CREDITS', 'DEBITS', 'REFUNDS', 'PAYMENTS'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    background: filter === f ? 'var(--primary-color)' : 'transparent',
                                    color: filter === f ? '#fff' : 'var(--text-primary)',
                                    border: `1px solid ${filter === f ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                
                {filteredTransactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <Clock size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '12px' }}>Date</th>
                                    <th style={{ padding: '12px' }}>Reference ID</th>
                                    <th style={{ padding: '12px' }}>Description</th>
                                    <th style={{ padding: '12px' }}>Type</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map(t => (
                                    <tr key={t._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>{t.referenceId}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{t.description}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                background: 'var(--border-color)', 
                                                padding: '4px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '11px',
                                                fontWeight: 'bold'
                                            }}>{t.type.replace('_', ' ')}</span>
                                        </td>
                                        <td style={{ 
                                            padding: '12px', 
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            color: t.direction === 'CREDIT' ? '#22c55e' : '#ef4444'
                                        }}>
                                            {t.direction === 'CREDIT' ? '+' : '-'}{getCurrencySymbol()}{t.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletPage;
