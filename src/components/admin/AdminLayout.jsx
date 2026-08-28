import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
                <AdminHeader />
                <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
