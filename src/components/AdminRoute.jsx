import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const AdminRoute = () => {
    const { userInfo } = useAuthStore();
    return userInfo && userInfo.isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
