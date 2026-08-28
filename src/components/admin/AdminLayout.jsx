import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './AdminTheme.css';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        document.title = "Admin";
        const link = document.querySelector("link[rel~='icon']");
        if (link) {
            link.href = "/admin-favicon.svg";
        }
    }, []);

    // Close sidebar whenever route changes (on mobile navigation)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="admin-dark-theme">
            {/* Mobile Backdrop Overlay */}
            {sidebarOpen && (
                <div 
                    className="admin-sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Drawer */}
            <AdminSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {/* Main Application Area */}
            <div className="admin-main-wrapper">
                <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="admin-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
