import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

const AdminReturnList = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userInfo } = useAuthStore();
    const getCurrencySymbol = useSettingsStore(state => state.getCurrencySymbol);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/admin/returns`, config);
            setReturns(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, [userInfo]);

    const handleUpdateStatus = async (id, status) => {
        if(window.confirm(`Update return status to ${status}?`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.put(`${window.API_BASE_URL}/api/admin/returns/${id}/status`, { status }, config);
                alert('Status Updated');
                fetchReturns();
            } catch(e) {
                alert(e.response?.data?.message || 'Error updating return');
            }
        }
    };

    return (
        <div className="admin-page-container fade-in">
            <h1 className="admin-page-title">Returns & Replacements</h1>
            <div className="admin-glass-card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>USER</th>
                                <th>ORDER</th>
                                <th>REASON</th>
                                <th>REFUND AMOUNT</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.map(r => (
                                <tr key={r._id}>
                                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td>{r.user?.name || 'N/A'}</td>
                                    <td>{r.order?.orderNumber || (r.order?._id?.substring(0,8) || 'N/A')}</td>
                                    <td>{r.reason}</td>
                                    <td>{getCurrencySymbol()}{r.refundAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`admin-badge ${r.status === 'REFUNDED' ? 'success' : (r.status === 'REJECTED' || r.status === 'CANCELLED') ? 'danger' : 'warning'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select 
                                            value={r.status} 
                                            onChange={(e) => handleUpdateStatus(r._id, e.target.value)}
                                            style={{ padding: '6px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                            disabled={r.status === 'REFUNDED' || r.status === 'REJECTED'}
                                        >
                                            <option value="REQUESTED">Requested</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                            <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
                                            <option value="PICKED_UP">Picked Up</option>
                                            <option value="RECEIVED">Received</option>
                                            <option value="REFUNDED">Refunded</option>
                                        </select>
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

export default AdminReturnList;
