import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

const AdminRefundList = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
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

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(refunds.map(r => r._id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) setSelectedIds([...selectedIds, id]);
        else setSelectedIds(selectedIds.filter(selId => selId !== id));
    };

    const handleDeleteSelected = async () => {
        if(selectedIds.length === 0) return;
        if(window.confirm(`Are you sure you want to delete ${selectedIds.length} refund(s)?`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/admin/refunds`, {
                    ...config,
                    data: { ids: selectedIds }
                });
                alert('Refunds deleted successfully');
                setSelectedIds([]);
                fetchRefunds();
            } catch(e) {
                alert(e.response?.data?.message || 'Error deleting refunds');
            }
        }
    };

    return (
        <div className="admin-page-container fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Refunds</h1>
                {selectedIds.length > 0 && (
                    <button onClick={handleDeleteSelected} style={{ background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        Delete Selected ({selectedIds.length})
                    </button>
                )}
            </div>
            <div className="admin-glass-card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>
                                    <input 
                                        type="checkbox" 
                                        checked={refunds.length > 0 && selectedIds.length === refunds.length} 
                                        onChange={handleSelectAll} 
                                    />
                                </th>
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
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(r._id)} 
                                            onChange={(e) => handleSelectOne(e, r._id)} 
                                        />
                                    </td>
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
