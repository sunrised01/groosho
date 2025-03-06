import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BsHouseDoor, BsFilePost, BsBox, BsCart, BsGear, BsPeople } from 'react-icons/bs'; 
import { FaFileAlt } from 'react-icons/fa';  
import { BsFileText } from 'react-icons/bs';
import axios from 'axios';


const Sidebar = () => {
    const urlData = usePage();
    const [customPostTypes, setCustomPostTypes] = useState([]);

    useEffect(() => {
        axios.post(route('cpt.fetch'))
            .then((response) => {
                setCustomPostTypes(response.data.customPostTypes); 
            })
            .catch((error) => {
              
            });
    }, []);
    // Function to extract the path after '/admin/' including '/admin/'
    const getPathWithAdmin = (url) => {
        const match = url.match(/\/admin\/(.*)/);  
        return match ? '/admin/' + match[1] : ''; 
    };

    // Array of menu items
    const { postTypesmenu } = usePage().props;
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
                { name: 'Taxonomies', link: route('taxonomies.index') },
            ]
        },
        // Check if postTypes menu has items before adding
        ...(customPostTypes && Array.isArray(customPostTypes) && customPostTypes.length > 0 ? customPostTypes.map(customPostType => {
            const hasTaxonomies = customPostType.taxonomies && Array.isArray(customPostType.taxonomies) && customPostType.taxonomies.length > 0;
    

            return {
                name: customPostType.title,
                icon: <BsFileText />,
                link: route('post.index', customPostType.slug),
                subMenu: [
                    { 
                        name: `All ${customPostType.title}`,
                        link: route('post.index', customPostType.slug) 
                    },
                    { 
                        name: 'Add New', 
                        link: route('post.create', customPostType.slug) 
                    },
                    ...(hasTaxonomies ? customPostType.taxonomies.map(taxonomy => ({
                        name: taxonomy.title,
                        link: route('term.index', taxonomy.slug)  
                    })) : [])
                ]
            };
        }) : []),

        { 
            name: 'Settings', 
            icon: <BsGear />, 
            link: route('admin.settings') 
        },
        { 
            name: 'Users', 
            icon: <BsPeople />, 
            link: route('admin.settings') 
        }
    ];

    // Function to extract the first two segments of the path after "/admin/"
    const getFirstTwoSegmentsFromFullUrl = (fullUrl) => {
        const path = new URL(fullUrl).pathname;  
        const segments = path.split('/').filter(Boolean);  
        return segments.slice(0, 2).join('/'); 
    };

    // Function to check if the first two segments match in both URLs
    const matchFirstTwoSegments = (url1, url2) => {
        const firstTwoSegmentsUrl1 = getFirstTwoSegmentsFromFullUrl(url1);  
        const firstTwoSegmentsUrl2 = getFirstTwoSegmentsFromFullUrl(url2); 

        return firstTwoSegmentsUrl1 === firstTwoSegmentsUrl2;  // Compare if they match
    };

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
                    const isCreateOrEditPage = CurrentUrl.includes('/create') || CurrentUrl.includes('/edit');
                    let isParentActive = '';
                    if(isCreateOrEditPage){
                        isParentActive = matchFirstTwoSegments(item.link, CurrentUrl);
                    }
                    else{
                        isParentActive = CurrentUrl === item.link || 
                        (item.subMenu && item.subMenu.some(subItem => {
                            const subItemUrl = `${subItem.link}`;
                            const currentPath = getPathWithAdmin(CurrentUrl);
                            const subItemPath = getPathWithAdmin(subItemUrl);
                            return CurrentUrl === subItemUrl || 
                                (currentPath === subItemPath);
                        }));
                    }
                    

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
                                <ul className={`menu-sub ${isParentActive ? 'open' : ''} ${!isParentActive ? 'hover-items' : ''} `}>
                                    {item.subMenu.map((subItem, subIndex) => {

                                        const subItemUrl = `${subItem.link}`;
                                        const currentPath = getPathWithAdmin(CurrentUrl);
                                        const subItemPath = getPathWithAdmin(subItemUrl);
                                    
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
