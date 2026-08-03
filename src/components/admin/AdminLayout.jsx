import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminTheme.css';

const AdminLayout = () => {
    useEffect(() => {
        document.title = "Admin";
        const link = document.querySelector("link[rel~='icon']");
        if (link) {
            link.href = "/admin-favicon.svg";
        }
    }, []);

    return (
        <div className="admin-dark-theme">
            <AdminSidebar />
            <main style={{ flex: 1, padding: '32px', overflowY: 'auto', width: 'calc(100% - 260px)' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
