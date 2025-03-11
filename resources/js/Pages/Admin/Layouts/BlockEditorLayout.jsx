import React, { useEffect, useState } from "react";
import { Inertia } from '@inertiajs/inertia'; 
import '../../../../assets/admin/css/core.css';
import '../../../../assets/admin/css/theme-default.css';
import '../../../../assets/admin/css/style.css';
import '../../../../assets/admin/css/block-editor.css';
import Navbar from '@/Components/Admin/Navbar';
import Sidebar from '@/Components/Admin/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NProgress from "nprogress";  
import "nprogress/nprogress.css";    

export default function BlockEditorLayout({ children }) {


    useEffect(() => {
        // Start NProgress on page load (inertia visit)
        Inertia.on("start", () => NProgress.start());
    
        // Stop NProgress on page load completion (inertia finish)
        Inertia.on("finish", () => NProgress.done());
    
        // Optionally, add events for page errors or failures
        Inertia.on("error", () => NProgress.done());

       
    });

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
                {children}
            </div>
        </>
    );
}
