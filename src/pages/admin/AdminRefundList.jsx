import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

const AdminRefundList = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userInfo } = useAuthStore();
    const getCurrencySymbol = useSettingsStore(state => state.getCurrencySymbol);

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/admin/refunds`, config);
            setRefunds(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefunds();
    }, [userInfo]);

    const handleProcessRefund = async (id) => {
        if(window.confirm('Process this refund to the user wallet?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.post(`${window.API_BASE_URL}/api/admin/refunds/${id}/process`, {}, config);
                alert('Refund Processed');
                fetchRefunds();
            } catch(e) {
                alert(e.response?.data?.message || 'Error processing refund');
            }
        }
    };

    return (
        <div className="admin-page-container fade-in">
            <h1 className="admin-page-title">Refunds</h1>
            <div className="admin-glass-card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>REF ID</th>
                                <th>USER</th>
                                <th>ORDER</th>
                                <th>TYPE</th>
                                <th>AMOUNT</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map(r => (
                                <tr key={r._id}>
                                    <td>{r.referenceId}</td>
                                    <td>{r.user?.name || 'N/A'}</td>
                                    <td>{r.order?.orderNumber || (r.order?._id?.substring(0,8) || 'N/A')}</td>
                                    <td>{r.type}</td>
                                    <td>{getCurrencySymbol()}{r.amount.toFixed(2)}</td>
                                    <td>
                                        <span className={`admin-badge ${r.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        {r.status === 'PENDING' && (
                                            <button onClick={() => handleProcessRefund(r._id)} className="admin-btn-primary admin-btn-sm">
                                                Process
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRefundList;
