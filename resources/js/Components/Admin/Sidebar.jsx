import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BsHouseDoor, BsFilePost, BsBox, BsCart, BsGear, BsPeople } from 'react-icons/bs'; 
import { FaFileAlt } from 'react-icons/fa';  
import { BsFileText } from 'react-icons/bs';

const Sidebar = () => {
    const urlData = usePage();

    // Function to extract the path after '/admin/'
    const getPathAfterAdmin = (url) => {
        const match = url.match(/\/admin\/([^/]+)/);
        return match ? match[1] : '';
    };

    // Array of menu items
    const menuItems = [
        { 
            name: 'Dashboard', 
            icon: <BsHouseDoor />, 
            link: route('admin.dashboard'),
        },
        { 
            name: 'Files', 
            icon: <FaFileAlt />, 
            link: route('files.index'),
        },
        { 
            name: 'Custom Post Type', 
            icon: <BsFileText />, 
            link: route('cpt.index'),
            subMenu: [
                { name: 'Overview', link: route('cpt.index') },
                { name: 'Post Types', link: route('posttype.index') },
                { name: 'Taxonomies', link: route('taxonomy.index') },
            ]
        },
        { 
            name: 'Settings', 
            icon: <BsGear />, 
            link: '/admin/settings' 
        },
        { 
            name: 'Users', 
            icon: <BsPeople />, 
            link: '/admin/users' 
        }
    ];

    return (
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
            <div className="app-brand demo">
                <Link href="index.html" className="app-brand-link">
                    <span className="app-brand-logo demo">
                        <svg
                            width="25"
                            viewBox="0 0 25 42"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                        >
                            {/* SVG logo here */}
                        </svg>
                    </span>
                    <span className="app-brand-text demo menu-text fw-bold ms-2">sneat</span>
                </Link>
            </div>

            <div className="menu-inner-shadow"></div>

            <ul className="menu-inner py-1">
                {menuItems.map((item, index) => {
                    const CurrentUrl = `${window.location.origin}${urlData.url}`;
                    
                    const isParentActive = CurrentUrl === item.link || 
                    (item.subMenu && item.subMenu.some(subItem => {
                        const subItemUrl = `${subItem.link}`;
                        const currentPath = getPathAfterAdmin(CurrentUrl);
                        const subItemPath = getPathAfterAdmin(subItemUrl);
                        return CurrentUrl === subItemUrl || 
                            (currentPath === subItemPath);
                    }));

                    return (
                        <li key={index} className={`menu-item group ${isParentActive ? 'active' : ''}`}>
                            <Link
                                href={item.link}
                                className="menu-link"
                                aria-label={`Navigate to ${item.name}`}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <div>{item.name}</div>
                            </Link>

                            {/* Submenu handling */}
                            {item.subMenu && (
                                <ul className={`menu-sub ${isParentActive ? 'open' : ''} group-hover:block hidden`}>
                                    {item.subMenu.map((subItem, subIndex) => {
                                        const subItemUrl = `${subItem.link}`;
                                        const currentPath = getPathAfterAdmin(CurrentUrl);
                                        const subItemPath = getPathAfterAdmin(subItemUrl);
                                    
                                        const isSubActive = CurrentUrl === subItemUrl || currentPath === subItemPath;
                                    
                                        return (
                                            <li key={subIndex} className={`menu-item ${isSubActive ? 'active' : ''}`}>
                                                <Link
                                                    href={subItem.link}
                                                    className="menu-link"
                                                    aria-label={`Navigate to ${subItem.name}`}
                                                >
                                                    <div>{subItem.name}</div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};

export default Sidebar;
