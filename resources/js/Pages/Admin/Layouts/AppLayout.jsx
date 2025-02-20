import React, { useEffect } from "react";
import { Inertia } from '@inertiajs/inertia'; 
import '../../../../assets/admin/css/core.css';
import '../../../../assets/admin/css/theme-default.css';
import '../../../../assets/admin/css/style.css';
import Navbar from '@/Components/Admin/Navbar';
import Sidebar from '@/Components/Admin/Sidebar';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NProgress from "nprogress";  
import "nprogress/nprogress.css";   


export default function AuthLayout({ children }) {

    useEffect(() => {
        // Start NProgress on page load (inertia visit)
        Inertia.on("start", () => NProgress.start());

        // Stop NProgress on page load completion (inertia finish)
        Inertia.on("finish", () => NProgress.done());

        // Optionally, add events for page errors or failures
        Inertia.on("error", () => NProgress.done());

        
    }, []);

    

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick={true}
                pauseOnHover={true}
            />

            <div className="layout-wrapper layout-content-navbar">
                <div className="layout-container">
                    <Sidebar />
                    <div className="layout-page">
                        <Navbar />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
        
    );
}
