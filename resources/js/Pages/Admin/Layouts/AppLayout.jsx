import React, { useEffect, useState } from "react";
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
import { usePage } from '@inertiajs/react';

export default function AuthLayout({ children }) {

    const { session_expiry_time } = usePage().props;
    const [showExpiredPopup, setShowExpiredPopup] = useState(false);
    const [expireTime, setExpireTime] = useState(session_expiry_time * 60);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        // Start NProgress on page load (inertia visit)
        Inertia.on("start", () => NProgress.start());
    
        // Stop NProgress on page load completion (inertia finish)
        Inertia.on("finish", () => NProgress.done());
    
        // Optionally, add events for page errors or failures
        Inertia.on("error", () => NProgress.done());

        // if (expireTime === 0) {
        //     setShowExpiredPopup(true); 
        //     return;
        // }
        // // Update the expire time every second
        // const timer = setInterval(() => {
        //     setExpireTime(prevTime => prevTime - 1);
            
        // }, 1000);

        // return () => clearInterval(timer);
    }, [expireTime]);

    // Redirect user to login page when the modal is closed
    const handleRedirectToLogin = () => {
        Inertia.visit(route('admin.login'));
    };

    
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

            {/* Custom Modal for session expiration */}
            {showExpiredPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Your session has expired</h3>
                        <p>Your session has expired due to inactivity. Please log in again to continue.</p>
                        <button className="btn btn-outline-primary" onClick={handleRedirectToLogin}>OK</button>
                    </div>
                </div>
            )}
        </>
    );
}
