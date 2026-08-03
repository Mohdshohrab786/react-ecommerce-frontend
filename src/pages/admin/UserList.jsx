import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Edit, Trash2, Check, X } from 'lucide-react';
import './Admin.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userInfo } = useAuthStore();

    const fetchUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/users`, config);
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${window.API_BASE_URL}/api/users/${id}`, config);
                fetchUsers();
            } catch (err) {
                alert(err.response && err.response.data.message ? err.response.data.message : err.message);
            }
        }
    };

    return (
        <div className="fade-in">
            <h1 className="section-title">Users</h1>
            {loading ? <div className="loader">Loading...</div> : error ? <div className="error-message">{error}</div> : (
                <div className="table-container glass">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NAME</th>
                                <th>EMAIL</th>
                                <th>ADMIN</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user._id}</td>
                                    <td>{user.name}</td>
                                    <td><a href={`mailto:${user.email}`} style={{ color: 'var(--accent-color)' }}>{user.email}</a></td>
                                    <td>{user.isAdmin ? <Check color="#10b981" size={20} /> : <X color="#ef4444" size={20} />}</td>
                                    <td>
                                        <Link to={`/admin/user/${user._id}/edit`}>
                                            <button className="btn-icon"><Edit size={20} /></button>
                                        </Link>
                                        <button className="btn-icon delete" onClick={() => deleteHandler(user._id)}>
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserList;
