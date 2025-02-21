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

    const { session_expiry_time } = usePage().props; // Get the session expiry time from the props
    const [timeLeft, setTimeLeft] = useState(session_expiry_time); // Track the time left
    const [showExpiredPopup, setShowExpiredPopup] = useState(false); // State for showing expired popup
    
    useEffect(() => {
        // Start NProgress on page load (inertia visit)
        Inertia.on("start", () => NProgress.start());

        // Stop NProgress on page load completion (inertia finish)
        Inertia.on("finish", () => NProgress.done());

        // Optionally, add events for page errors or failures
        Inertia.on("error", () => NProgress.done());

        // If session_expiry_time exists, track the countdown
        if (session_expiry_time) {
            const expiryTime = session_expiry_time * 1000; 
            const countdownInterval = setInterval(() => {
                const remainingTime = expiryTime - Date.now();
                setTimeLeft(remainingTime);

                // Show popup when session expires
                if (remainingTime <= 0 && !showExpiredPopup) {
                    clearInterval(countdownInterval); 
                    setShowExpiredPopup(true); 
                }
            }, 1000); 

            return () => clearInterval(countdownInterval); 
        }
    }, [session_expiry_time, showExpiredPopup]);

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
