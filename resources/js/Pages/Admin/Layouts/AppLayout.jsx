import React from 'react';
import '../../../../assets/admin/css/core.css';
import '../../../../assets/admin/css/theme-default.css';
import '../../../../assets/admin/css/style.css';
import Navbar from '@/Components/Admin/Navbar';
import Sidebar from '@/Components/Admin/Sidebar';


export default function AuthLayout({ children }) {

    return (
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
    );
}
