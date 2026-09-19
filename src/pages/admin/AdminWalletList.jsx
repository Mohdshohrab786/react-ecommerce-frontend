import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

const AdminWalletList = () => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userInfo } = useAuthStore();
    const getCurrencySymbol = useSettingsStore(state => state.getCurrencySymbol);

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${window.API_BASE_URL}/api/admin/wallets`, config);
                setWallets(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchWallets();
    }, [userInfo]);

    return (
        <div className="admin-page-container fade-in">
            <h1 className="admin-page-title">User Wallets</h1>
            <div className="admin-glass-card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>USER</th>
                                <th>EMAIL</th>
                                <th>BALANCE</th>
                                <th>TOTAL CREDITED</th>
                                <th>TOTAL DEBITED</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wallets.map(w => (
                                <tr key={w._id}>
                                    <td>{w.user?.name || 'N/A'}</td>
                                    <td>{w.user?.email || 'N/A'}</td>
                                    <td>{getCurrencySymbol()}{w.balance.toFixed(2)}</td>
                                    <td style={{ color: '#22c55e' }}>{getCurrencySymbol()}{w.totalCredited.toFixed(2)}</td>
                                    <td style={{ color: '#ef4444' }}>{getCurrencySymbol()}{w.totalDebited.toFixed(2)}</td>
                                    <td>{w.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminWalletList;
