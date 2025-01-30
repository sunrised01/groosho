import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

import avtartImage from '../../../assets/admin/img/avatars/1.png';


const Navbar = () => {
    const user = usePage().props.auth.user;
  
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Toggle dropdown visibility
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
                <Link className="nav-item nav-link px-0 me-xl-6" href="#">
                    <i className="bx bx-menu bx-md"></i>
                </Link>
            </div>

            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
                <div className="navbar-nav align-items-center">
                    <div className="nav-item d-flex align-items-center">
                        <i className="bx bx-search bx-md"></i>
                        <input
                            type="text"
                            className="form-control border-0 shadow-none ps-1 ps-sm-2"
                            placeholder="Search..."
                            aria-label="Search..."
                        />
                    </div>
                </div>

                <ul className="navbar-nav flex-row align-items-center ms-auto">
                    <li className="nav-item navbar-dropdown dropdown-user dropdown" ref={dropdownRef}>
                        <button type="button" className={`nav-link dropdown-toggle hide-arrow p-0 ${isDropdownOpen ? 'show' : ''}`} onClick={toggleDropdown}>
                            <div className="avatar avatar-online">
                                <img src={avtartImage} alt="" className="w-px-40 h-auto rounded-circle" />
                            </div>
                        </button>
                        
                        <ul className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? 'show' : ''}`}>
                                <li>
                                    <Link className="dropdown-item" href="#">
                                        <div className="d-flex">
                                            <div className="flex-shrink-0 me-3">
                                                <div className="avatar avatar-online">
                                                    <img
                                                        src={avtartImage}
                                                        alt=""
                                                        className="w-px-40 h-auto rounded-circle"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-0">{user.name}</h6>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <div className="dropdown-divider my-1"></div>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href="#">
                                        <i className="bx bx-user bx-md me-3"></i>
                                        <span>My Profile</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href={route('admin.settings')}>
                                        <i className="bx bx-cog bx-md me-3"></i>
                                        <span>Settings</span>
                                    </Link>
                                </li>
                                <li>
                                    <div className="dropdown-divider my-1"></div>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href={route('logout')}  method="post"
                                            as="button">
                                        <i className="bx bx-power-off bx-md me-3"></i>
                                        <span>Log Out</span>
                                    </Link>
                                </li>
                            </ul>
                        
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;