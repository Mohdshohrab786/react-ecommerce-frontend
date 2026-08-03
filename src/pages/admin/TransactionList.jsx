import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import axios from 'axios';

const TransactionList = () => {
    const { userInfo } = useAuthStore();
    const { getCurrencySymbol, settings } = useSettingsStore();
    const currencySymbol = getCurrencySymbol();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${window.API_BASE_URL}/api/transactions`, config);
                setTransactions(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (userInfo && userInfo.isAdmin) {
            fetchTransactions();
        }
    }, [userInfo]);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Payments & Ledger</h1>
            </div>
            {loading ? <div className="loader">Loading...</div> : error ? <div className="error-message">{error}</div> : (
                <div className="table-container glass">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>TXN ID</th>
                                <th>CUSTOMER</th>
                                <th>TYPE</th>
                                <th>AMOUNT</th>
                                <th>DESCRIPTION</th>
                                <th>DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn._id}>
                                    <td>{txn._id.substring(0, 8)}...</td>
                                    <td>
                                        {txn.user ? (
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{txn.user.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{txn.user.email}</div>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)' }}>N/A</span>
                                        )}
                                    </td>
                                    <td>
                                        {txn.type === 'Credit' ? (
                                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>CREDIT</span>
                                        ) : (
                                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>DEBIT</span>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>{currencySymbol}{txn.amount.toFixed(2)}</td>
                                    <td>{txn.description}</td>
                                    <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>No transactions found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionList;
