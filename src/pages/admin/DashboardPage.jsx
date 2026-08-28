import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    Banknote, 
    ShoppingBag, 
    Package, 
    Users, 
    TrendingUp, 
    AlertTriangle, 
    Clock, 
    CheckCircle, 
    Truck, 
    CreditCard, 
    Plus, 
    Tag, 
    Settings, 
    RotateCw, 
    Eye, 
    Printer, 
    ArrowUpRight, 
    Award, 
    Layers, 
    DollarSign,
    Calendar,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { generateInvoice } from '../../utils/invoiceGenerator';
import './Admin.css';
import './Dashboard.css';

const DashboardPage = () => {
    const { userInfo } = useAuthStore();
    const { getCurrencySymbol, settings } = useSettingsStore();
    const currency = getCurrencySymbol();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Interactive chart tab states
    const [salesTab, setSalesTab] = useState('7days'); // '7days' or '6months'
    const [breakdownTab, setBreakdownTab] = useState('status'); // 'status' or 'payment'
    const [inventoryTab, setInventoryTab] = useState('categories'); // 'categories' or 'lowstock'

    const fetchStats = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) setRefreshing(true);
            else setLoading(true);

            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${window.API_BASE_URL}/api/admin/dashboard`, config);
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            fetchStats();
        }
    }, [userInfo]);

    const clearCacheHandler = async () => {
        if (window.confirm('Are you sure you want to clear system and application cache?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.post(`${window.API_BASE_URL}/api/settings/clear-cache`, {}, config);
                
                const user = localStorage.getItem('userInfo');
                localStorage.clear();
                sessionStorage.clear();
                if (user) localStorage.setItem('userInfo', user);
                
                alert(data.message || 'Cache cleared successfully!');
                window.location.reload();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    // Chart Data Preparation (Area & Trend Line)
    const activeChartData = useMemo(() => {
        if (!stats) return [];
        if (salesTab === '7days') {
            return stats.last7Days || [];
        } else {
            return stats.last6Months || [];
        }
    }, [stats, salesTab]);

    // Calculate SVG curve points for Sales Chart
    const svgChart = useMemo(() => {
        if (!activeChartData || activeChartData.length === 0) return null;

        const maxSales = Math.max(...activeChartData.map(d => d.sales), 100);
        const width = 500;
        const height = 180;
        const padding = 20;

        const points = activeChartData.map((d, idx) => {
            const x = padding + (idx / (activeChartData.length - 1 || 1)) * (width - 2 * padding);
            const y = height - padding - (d.sales / maxSales) * (height - 2 * padding);
            return { x, y, ...d };
        });

        // Path generator
        const pathD = points.reduce((acc, p, idx) => {
            return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
        }, '');

        const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

        return { points, pathD, areaD, maxSales, width, height };
    }, [activeChartData]);

    if (loading) {
        return (
            <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
                <div className="loader"></div>
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading complete store analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message container" style={{ marginTop: '30px' }}>
                {error}
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            {/* Welcome Top Banner */}
            <div className="dashboard-welcome-banner">
                <div className="welcome-text">
                    <h1>
                        <span>👋 Welcome back, {userInfo?.name || 'Admin'}!</span>
                    </h1>
                    <p>
                        Here is your complete live store overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}.
                    </p>
                </div>
                <div className="welcome-actions">
                    <button 
                        type="button" 
                        className="dashboard-btn-refresh" 
                        onClick={() => fetchStats(true)}
                        disabled={refreshing}
                        title="Refresh live metrics"
                    >
                        <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button 
                        type="button" 
                        className="dashboard-btn-cache" 
                        onClick={clearCacheHandler}
                        title="Purge cached data"
                    >
                        Clear Cache
                    </button>
                </div>
            </div>

            {/* 6 Primary KPI Summary Metrics */}
            <div className="dashboard-kpi-grid">
                {/* Card 1: Total Revenue */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Revenue</span>
                        <div className="kpi-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                            <Banknote size={22} />
                        </div>
                    </div>
                    <div className="kpi-value">
                        {currency}{stats?.totalSales ? Number(stats.totalSales).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-badge success">
                            <ArrowUpRight size={11} /> +{currency}{stats?.todaySales ? Number(stats.todaySales).toFixed(0) : '0'} Today
                        </span>
                    </div>
                </div>

                {/* Card 2: Total Orders */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Orders</span>
                        <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                            <ShoppingBag size={22} />
                        </div>
                    </div>
                    <div className="kpi-value">{stats?.totalOrders || 0}</div>
                    <div className="kpi-footer">
                        <span className="kpi-badge info">
                            <Truck size={11} /> {stats?.statusCounts?.delivered || 0} Delivered
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            ({stats?.statusCounts?.pending || 0} Pending)
                        </span>
                    </div>
                </div>

                {/* Card 3: Average Order Value (AOV) */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Avg. Order Value</span>
                        <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
                            <TrendingUp size={22} />
                        </div>
                    </div>
                    <div className="kpi-value">
                        {currency}{stats?.aov || '0.00'}
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-badge purple">
                            Per Paid Order
                        </span>
                    </div>
                </div>

                {/* Card 4: Total Customers */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Customers</span>
                        <div className="kpi-icon-box" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' }}>
                            <Users size={22} />
                        </div>
                    </div>
                    <div className="kpi-value">{stats?.totalUsers || 0}</div>
                    <div className="kpi-footer">
                        <span className="kpi-badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                            Active Accounts
                        </span>
                    </div>
                </div>

                {/* Card 5: Total Products */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Inventory Items</span>
                        <div className="kpi-icon-box" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                            <Package size={22} />
                        </div>
                    </div>
                    <div className="kpi-value">{stats?.totalProducts || 0}</div>
                    <div className="kpi-footer">
                        {stats?.lowStockProducts?.length > 0 ? (
                            <span className="kpi-badge warning">
                                <AlertTriangle size={11} /> {stats.lowStockProducts.length} Low Stock
                            </span>
                        ) : (
                            <span className="kpi-badge success">
                                <CheckCircle size={11} /> All In Stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Card 6: Pending Unpaid Revenue */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Unpaid / COD Volume</span>
                        <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
                            <CreditCard size={22} />
                        </div>
                    </div>
                    <div className="kpi-value">
                        {currency}{stats?.pendingPaymentAmount ? Number(stats.pendingPaymentAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                            {stats?.statusCounts?.unpaid || 0} Orders Pending
                        </span>
                    </div>
                </div>
            </div>

            {/* Graphs & Analytics Section (2-Column Grid) */}
            <div className="dashboard-grid-2">
                {/* Graph 1: Revenue & Order Performance Trend */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h2 className="chart-title">
                                <TrendingUp size={18} color="var(--accent-color)" /> Sales & Revenue Performance
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {salesTab === '7days' ? 'Daily revenue trend over the past 7 days' : 'Monthly revenue trend over the past 6 months'}
                            </p>
                        </div>
                        <div className="chart-tabs">
                            <button 
                                type="button" 
                                className={`chart-tab-btn ${salesTab === '7days' ? 'active' : ''}`}
                                onClick={() => setSalesTab('7days')}
                            >
                                7 Days
                            </button>
                            <button 
                                type="button" 
                                className={`chart-tab-btn ${salesTab === '6months' ? 'active' : ''}`}
                                onClick={() => setSalesTab('6months')}
                            >
                                6 Months
                            </button>
                        </div>
                    </div>

                    {/* SVG Interactive Trend Chart */}
                    <div className="chart-container">
                        {svgChart && (
                            <svg viewBox={`0 0 ${svgChart.width} ${svgChart.height}`} className="chart-svg">
                                <defs>
                                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Horizontal Grid Lines */}
                                <line x1="20" y1="30" x2="480" y2="30" className="chart-grid-line" />
                                <line x1="20" y1="80" x2="480" y2="80" className="chart-grid-line" />
                                <line x1="20" y1="130" x2="480" y2="130" className="chart-grid-line" />
                                <line x1="20" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

                                {/* Filled Gradient Area */}
                                <path d={svgChart.areaD} fill="url(#salesGradient)" />

                                {/* Stroke Line */}
                                <path 
                                    d={svgChart.pathD} 
                                    fill="none" 
                                    stroke="#6366f1" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />

                                {/* Interactive Data Nodes */}
                                {svgChart.points.map((p, idx) => (
                                    <g key={idx}>
                                        <circle 
                                            cx={p.x} 
                                            cy={p.y} 
                                            r="4.5" 
                                            fill="#ffffff" 
                                            stroke="#6366f1" 
                                            strokeWidth="2.5" 
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <title>{`${p.day || p.month || p.date}: ${currency}${p.sales} (${p.orders} orders)`}</title>
                                        </circle>
                                        {/* X-Axis Label */}
                                        <text 
                                            x={p.x} 
                                            y="175" 
                                            textAnchor="middle" 
                                            className="chart-axis-text"
                                        >
                                            {p.day || p.month}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        )}
                    </div>

                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#6366f1' }}></span>
                            <span>Sales Volume ({currency})</span>
                        </div>
                        <div className="legend-item">
                            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                                Peak: {currency}{svgChart ? Math.round(svgChart.maxSales).toLocaleString() : '0'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Graph 2: Order Status & Payment Breakdown */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h2 className="chart-title">
                                <Layers size={18} color="#3b82f6" /> Order & Payment Distribution
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Real-time fulfillment & payment channels
                            </p>
                        </div>
                        <div className="chart-tabs">
                            <button 
                                type="button" 
                                className={`chart-tab-btn ${breakdownTab === 'status' ? 'active' : ''}`}
                                onClick={() => setBreakdownTab('status')}
                            >
                                Status
                            </button>
                            <button 
                                type="button" 
                                className={`chart-tab-btn ${breakdownTab === 'payment' ? 'active' : ''}`}
                                onClick={() => setBreakdownTab('payment')}
                            >
                                Payments
                            </button>
                        </div>
                    </div>

                    {breakdownTab === 'status' ? (
                        <div className="status-list">
                            {/* Delivered */}
                            <div className="status-item">
                                <div className="status-info">
                                    <span className="status-name">
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                                        Delivered Orders
                                    </span>
                                    <span className="status-count">
                                        {stats?.statusCounts?.delivered || 0} ({stats?.totalOrders ? Math.round(((stats.statusCounts.delivered || 0) / stats.totalOrders) * 100) : 0}%)
                                    </span>
                                </div>
                                <div className="status-progress-track">
                                    <div 
                                        className="status-progress-fill" 
                                        style={{ 
                                            width: `${stats?.totalOrders ? ((stats.statusCounts.delivered || 0) / stats.totalOrders) * 100 : 0}%`, 
                                            background: '#10b981' 
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Processing / Shipped */}
                            <div className="status-item">
                                <div className="status-info">
                                    <span className="status-name">
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}></span>
                                        In Transit / Shipped
                                    </span>
                                    <span className="status-count">
                                        {stats?.statusCounts?.processing || 0} ({stats?.totalOrders ? Math.round(((stats.statusCounts.processing || 0) / stats.totalOrders) * 100) : 0}%)
                                    </span>
                                </div>
                                <div className="status-progress-track">
                                    <div 
                                        className="status-progress-fill" 
                                        style={{ 
                                            width: `${stats?.totalOrders ? ((stats.statusCounts.processing || 0) / stats.totalOrders) * 100 : 0}%`, 
                                            background: '#3b82f6' 
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Pending Fulfillment */}
                            <div className="status-item">
                                <div className="status-info">
                                    <span className="status-name">
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span>
                                        Pending Processing
                                    </span>
                                    <span className="status-count">
                                        {stats?.statusCounts?.pending || 0} ({stats?.totalOrders ? Math.round(((stats.statusCounts.pending || 0) / stats.totalOrders) * 100) : 0}%)
                                    </span>
                                </div>
                                <div className="status-progress-track">
                                    <div 
                                        className="status-progress-fill" 
                                        style={{ 
                                            width: `${stats?.totalOrders ? ((stats.statusCounts.pending || 0) / stats.totalOrders) * 100 : 0}%`, 
                                            background: '#f59e0b' 
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Paid vs Unpaid ratio */}
                            <div className="status-item" style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="status-info">
                                    <span className="status-name">
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }}></span>
                                        Paid Orders Volume
                                    </span>
                                    <span className="status-count">
                                        {stats?.statusCounts?.paid || 0} Paid / {stats?.statusCounts?.unpaid || 0} Unpaid
                                    </span>
                                </div>
                                <div className="status-progress-track">
                                    <div 
                                        className="status-progress-fill" 
                                        style={{ 
                                            width: `${stats?.totalOrders ? ((stats.statusCounts.paid || 0) / stats.totalOrders) * 100 : 0}%`, 
                                            background: '#a855f7' 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="status-list">
                            {stats?.paymentMethods && Object.keys(stats.paymentMethods).map((method, idx) => {
                                const count = stats.paymentMethods[method];
                                const percent = stats.totalOrders ? Math.round((count / stats.totalOrders) * 100) : 0;
                                const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
                                const col = colors[idx % colors.length];

                                return (
                                    <div key={method} className="status-item">
                                        <div className="status-info">
                                            <span className="status-name">
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col }}></span>
                                                {method}
                                            </span>
                                            <span className="status-count">
                                                {count} orders ({percent}%)
                                            </span>
                                        </div>
                                        <div className="status-progress-track">
                                            <div 
                                                className="status-progress-fill" 
                                                style={{ width: `${percent}%`, background: col }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section: Top Selling Products & Inventory Health */}
            <div className="dashboard-grid-2">
                {/* Card 3: Top Selling Products Leaderboard */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h2 className="chart-title">
                                <Award size={18} color="#f59e0b" /> Top Selling Products
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Best performing products by total volume sold
                            </p>
                        </div>
                        <Link to="/admin/productlist" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            All Products
                        </Link>
                    </div>

                    <div className="leaderboard-list">
                        {stats?.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                            stats.topSellingProducts.map((prod, idx) => {
                                const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other';
                                return (
                                    <div key={idx} className="leaderboard-item">
                                        <div className="leaderboard-left">
                                            <span className={`rank-badge ${rankClass}`}>#{idx + 1}</span>
                                            <img 
                                                src={prod.image && prod.image.startsWith('http') ? prod.image : `${window.API_BASE_URL}${prod.image || '/images/sample.jpg'}`} 
                                                alt={prod.name} 
                                                className="leaderboard-img"
                                                onError={(e) => { e.target.src = '/images/sample.jpg'; }}
                                            />
                                            <div className="leaderboard-details">
                                                <h4 className="leaderboard-name" title={prod.name}>{prod.name}</h4>
                                                <p className="leaderboard-meta">
                                                    Unit Price: {currency}{prod.price ? Number(prod.price).toFixed(2) : '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="leaderboard-right">
                                            <div className="leaderboard-revenue">{currency}{prod.totalRevenue ? Number(prod.totalRevenue).toFixed(2) : '0.00'}</div>
                                            <p className="leaderboard-qty">{prod.totalQty} Units Sold</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                                No sales data recorded yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Card 4: Category Distribution & Inventory Alerts */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h2 className="chart-title">
                                <Package size={18} color="#10b981" /> Store Inventory Health
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Category breakdown & low stock warnings
                            </p>
                        </div>
                        <div className="chart-tabs">
                            <button 
                                type="button" 
                                className={`chart-tab-btn ${inventoryTab === 'categories' ? 'active' : ''}`}
                                onClick={() => setInventoryTab('categories')}
                            >
                                Categories
                            </button>
                            <button 
                                type="button" 
                                className={`chart-tab-btn ${inventoryTab === 'lowstock' ? 'active' : ''}`}
                                onClick={() => setInventoryTab('lowstock')}
                            >
                                Low Stock ({stats?.lowStockProducts?.length || 0})
                            </button>
                        </div>
                    </div>

                    {inventoryTab === 'categories' ? (
                        <div className="status-list">
                            {stats?.categoryStats && stats.categoryStats.length > 0 ? (
                                stats.categoryStats.map((cat, idx) => {
                                    const colors = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
                                    const col = colors[idx % colors.length];
                                    return (
                                        <div key={cat.name} className="status-item">
                                            <div className="status-info">
                                                <span className="status-name">
                                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col }}></span>
                                                    {cat.name}
                                                </span>
                                                <span className="status-count">
                                                    {cat.count} Products ({cat.percentage}%)
                                                </span>
                                            </div>
                                            <div className="status-progress-track">
                                                <div 
                                                    className="status-progress-fill" 
                                                    style={{ width: `${cat.percentage}%`, background: col }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                                    No categories found.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="leaderboard-list">
                            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                                stats.lowStockProducts.map(prod => (
                                    <div key={prod._id} className="leaderboard-item">
                                        <div className="leaderboard-left">
                                            <img 
                                                src={prod.image && prod.image.startsWith('http') ? prod.image : `${window.API_BASE_URL}${prod.image || '/images/sample.jpg'}`} 
                                                alt={prod.name} 
                                                className="leaderboard-img"
                                                onError={(e) => { e.target.src = '/images/sample.jpg'; }}
                                            />
                                            <div className="leaderboard-details">
                                                <h4 className="leaderboard-name">{prod.name}</h4>
                                                <p className="leaderboard-meta" style={{ color: '#ef4444', fontWeight: '600' }}>
                                                    Only {prod.countInStock} items left in stock!
                                                </p>
                                            </div>
                                        </div>
                                        <Link 
                                            to={`/admin/product/${prod._id}/edit`}
                                            className="btn-primary"
                                            style={{ padding: '6px 12px', fontSize: '11.5px', textDecoration: 'none' }}
                                        >
                                            Restock
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#10b981' }}>
                                    <CheckCircle size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
                                    <strong>All Inventory Well Stocked!</strong>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>No items under low-stock threshold.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Quick Shortcuts & Live Recent Orders Table */}
            <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowUpRight size={18} color="var(--accent-color)" /> Quick Admin Actions
                </h3>
                <div className="quick-actions-grid">
                    <Link to="/admin/product/new" className="quick-action-btn">
                        <div className="quick-action-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                            <Plus size={18} />
                        </div>
                        <span>Add Product</span>
                    </Link>

                    <Link to="/admin/orderlist" className="quick-action-btn">
                        <div className="quick-action-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                            <ShoppingBag size={18} />
                        </div>
                        <span>Manage Orders</span>
                    </Link>

                    <Link to="/admin/shipping-settings" className="quick-action-btn">
                        <div className="quick-action-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                            <Truck size={18} />
                        </div>
                        <span>Shipping Rules</span>
                    </Link>

                    <Link to="/admin/coupons" className="quick-action-btn">
                        <div className="quick-action-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                            <Tag size={18} />
                        </div>
                        <span>Promo Coupons</span>
                    </Link>

                    <Link to="/admin/userlist" className="quick-action-btn">
                        <div className="quick-action-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                            <Users size={18} />
                        </div>
                        <span>Users & Staff</span>
                    </Link>

                    <Link to="/admin/settings" className="quick-action-btn">
                        <div className="quick-action-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                            <Settings size={18} />
                        </div>
                        <span>Store Settings</span>
                    </Link>
                </div>
            </div>

            {/* Recent Orders Table Card */}
            <div className="chart-card">
                <div className="chart-header">
                    <div>
                        <h2 className="chart-title">
                            <ShoppingBag size={18} color="var(--accent-color)" /> Recent Live Orders
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Latest customer purchases placed on your store
                        </p>
                    </div>
                    <Link to="/admin/orderlist" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        View All Orders ({stats?.totalOrders || 0}) <ChevronRight size={14} />
                    </Link>
                </div>

                <div className="table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table className="admin-table" style={{ width: '100%', minWidth: '650px' }}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date & Time</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Delivery</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                                stats.recentOrders.map(order => (
                                    <tr key={order._id}>
                                        <td>
                                            <span style={{ fontWeight: '700', color: 'var(--accent-color)', fontFamily: 'monospace' }}>
                                                #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                                {order.user?.name || order.shippingAddress?.name || 'Customer'}
                                            </div>
                                            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                                {order.user?.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                                            {currency}{order.totalPrice ? Number(order.totalPrice).toFixed(2) : '0.00'}
                                        </td>
                                        <td>
                                            {order.isPaid ? (
                                                <span className="badge badge-success">
                                                    <CheckCircle size={12} /> Paid
                                                </span>
                                            ) : (
                                                <span className="badge badge-danger">
                                                    <Clock size={12} /> {order.paymentMethod === 'COD' ? 'COD Pending' : 'Unpaid'}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {order.isDelivered ? (
                                                <span className="badge badge-info">
                                                    <Truck size={12} /> Delivered
                                                </span>
                                            ) : (
                                                <span className="badge badge-warning">
                                                    <Clock size={12} /> {order.status || 'Processing'}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => generateInvoice(order, settings)}
                                                    className="btn-secondary"
                                                    style={{ padding: '6px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                    title="Download / Print Invoice"
                                                >
                                                    <Printer size={12} /> Invoice
                                                </button>
                                                <Link 
                                                    to="/admin/orderlist"
                                                    className="btn-secondary"
                                                    style={{ padding: '6px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                                                >
                                                    <Eye size={12} /> Details
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                                        No recent orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
