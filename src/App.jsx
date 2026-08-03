import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FrontendLayout from './components/FrontendLayout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import CategoryPage from './pages/CategoryPage';
import ShopPage from './pages/ShopPage';
import AllCategoriesPage from './pages/AllCategoriesPage';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import OrderList from './pages/admin/OrderList';
import ProductList from './pages/admin/ProductList';
import ProductEdit from './pages/admin/ProductEdit';
import UserList from './pages/admin/UserList';
import UserEdit from './pages/admin/UserEdit';
import CategoryList from './pages/admin/CategoryList';
import CategoryEdit from './pages/admin/CategoryEdit';
import BrandList from './pages/admin/BrandList';
import BrandEdit from './pages/admin/BrandEdit';
import BannerList from './pages/admin/BannerList';
import BannerEdit from './pages/admin/BannerEdit';
import TransactionList from './pages/admin/TransactionList';
import SettingsPage from './pages/admin/SettingsPage';
import PaymentSettingsPage from './pages/admin/PaymentSettingsPage';
import ShippingSettingsPage from './pages/admin/ShippingSettingsPage';
import CouponList from './pages/admin/CouponList';
import BlogList from './pages/admin/BlogList';
import BlogEdit from './pages/admin/BlogEdit';
import NewsletterList from './pages/admin/NewsletterList';
import ScrollToTop from './components/ScrollToTop';
import { useSettingsStore } from './store/useSettingsStore';
import WishlistPage from './pages/WishlistPage';
import { useWishlistStore } from './store/useWishlistStore';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const settings = useSettingsStore((state) => state.settings);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const { userInfo } = useAuthStore();
  const toast = useWishlistStore((state) => state.toast);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings && settings.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      const fullUrl = settings.favicon.startsWith('http') 
        ? settings.favicon 
        : `${window.API_BASE_URL}${settings.favicon}`;
      
      // Add a timestamp cache buster so the browser always fetches the latest uploaded favicon
      link.href = `${fullUrl}?v=${new Date().getTime()}`;
    }
  }, [settings]);

  useEffect(() => {
    if (userInfo) {
      fetchWishlist();
    }
  }, [userInfo, fetchWishlist]);

  return (
    <Router>
      <ScrollToTop />
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 99999,
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          pointerEvents: 'none'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: toast.type === 'success' ? '#22c55e' : '#ef4444'
          }}></div>
          <span>{toast.message}</span>
        </div>
      )}
      <Routes>
        
        {/* Frontend Routes (wrapped in Navbar and Footer) */}
        <Route element={<FrontendLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/shipping" element={<CheckoutPage />} />
          <Route path="/payment" element={<Navigate to="/shipping" replace />} />
          <Route path="/placeorder" element={<Navigate to="/shipping" replace />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:id" element={<OrderSuccessPage />} />
          <Route path="/order/:id" element={<OrderDetailsPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/categories" element={<AllCategoriesPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Route>
        
        {/* Admin Routes (Completely separate, no frontend Navbar/Footer) */}
        <Route path="" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/orderlist" element={<OrderList />} />
            <Route path="/admin/productlist" element={<ProductList />} />
            <Route path="/admin/product/:id/edit" element={<ProductEdit />} />
            <Route path="/admin/userlist" element={<UserList />} />
            <Route path="/admin/user/:id/edit" element={<UserEdit />} />
            <Route path="/admin/categories" element={<CategoryList />} />
            <Route path="/admin/category/:id/edit" element={<CategoryEdit />} />
            <Route path="/admin/brands" element={<BrandList />} />
            <Route path="/admin/brand/:id/edit" element={<BrandEdit />} />
            <Route path="/admin/banners" element={<BannerList />} />
            <Route path="/admin/banner/:id/edit" element={<BannerEdit />} />
            <Route path="/admin/payments" element={<TransactionList />} />
            <Route path="/admin/coupons" element={<CouponList />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/payment-settings" element={<PaymentSettingsPage />} />
            <Route path="/admin/shipping-settings" element={<ShippingSettingsPage />} />
            <Route path="/admin/bloglist" element={<BlogList />} />
            <Route path="/admin/blog/:id/edit" element={<BlogEdit />} />
            <Route path="/admin/newsletter" element={<NewsletterList />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
