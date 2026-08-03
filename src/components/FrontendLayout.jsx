import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const FrontendLayout = () => {
    useEffect(() => {
        document.title = "SuperMarket - Best Online Shopping";
        const link = document.querySelector("link[rel~='icon']");
        if (link) {
            link.href = "/favicon.svg";
        }
    }, []);

    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default FrontendLayout;
