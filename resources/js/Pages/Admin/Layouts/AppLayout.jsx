import React from 'react';
import '../../../../assets/admin/css/core.css';
import '../../../../assets/admin/css/theme-default.css';
import '../../../../assets/admin/css/style.css';
import Navbar from '@/Components/Admin/Navbar';
import Sidebar from '@/Components/Admin/Sidebar';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 


export default function AuthLayout({ children }) {

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
