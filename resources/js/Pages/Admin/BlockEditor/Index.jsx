import React, { useState, useRef, useEffect } from "react";
import { Head, usePage, Link } from '@inertiajs/react';
import { FaElementor, FaPlus, FaCog, FaEye, FaSearch, FaBox, FaTextWidth, FaHeading, FaImage, FaVideo, FaSlidersH, FaDesktop, FaTabletAlt, FaMobileAlt } from "react-icons/fa";


import BlockEditorLayout from '@/Pages/Admin/Layouts/BlockEditorLayout';
import Row from '@/Components/Widgets/Row';
// import Grid from '@/Components/Widgets/Grid';
// import TextEditor from '@/Components/Widgets/TextEditor';
// import Heading from '@/Components/Widgets/Heading';
// import Image from '@/Components/Widgets/Image';
// import Video from '@/Components/Widgets/Video';

export default function Index() {
    const { post } = usePage().props;
    const iframeRef = useRef(null);
    const [dragging, setDragging] = useState(false); 
    const [selectedGridLayout, setSelectedGridLayout] = useState(false);
    const [editWidgetData, setEditWidgetData] = useState(null);
    const [activeDevice, setActiveDevice] = useState('Desktop');

    const handleDeviceChange = (device) => {
        setActiveDevice(device);
    };


  const toggleGridLayout = () => {
    setSelectedGridLayout((prev) => !prev);
  };

    const handleDragStart = (e, widgetType, colNum) => {
        e.dataTransfer.setData("widgetType", widgetType);
        e.dataTransfer.setData("colNum", colNum);
        setDragging(true); 
    };

    const generateUniqueId = () => {
        return Date.now() + Math.floor(Math.random() * 1000);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
    
        const widgetType = e.dataTransfer.getData("widgetType");
        const colNum = e.dataTransfer.getData("colNum");
        let newWidget = {};
    
        if (widgetType === "Grid") {
            newWidget = { type: "Grid", id: generateUniqueId(), action: true, layout_fields: null };
            
            newWidget.innerElements = Array.from({ length: colNum }, () => ({
                type: "Column",
                id: generateUniqueId(),
                action: false,
                layout_fields: null,
                
            }));
        } else {
            newWidget = { type: widgetType, id: generateUniqueId(), action: true, layout_fields: null };
            
            if (widgetType !== "Row") {
                newWidget.innerElements = [{
                    type: widgetType,
                    id: generateUniqueId(),
                    action: false,
                    layout_fields: null,
                }];
            }
        }
        
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({'newWidget': newWidget}, "*");
        }
        setDragging(false); 
    };

     // Handle the message from iframe
     useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            setEditWidgetData(data);
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);


    
    const renderEditWidgetContent = () => {

        switch (editWidgetData.type) {
            case 'Row':
              return <Row widget={editWidgetData} updateWidget={onUpdateWidget} activeDevice={activeDevice} />;
           
            default:
              return <div>Unknown Widget Type</div>;
        }
    };

    const onUpdateWidget = (editWidget) => {
        console.log('editWidget', editWidget);
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({editWidget:editWidget}, "*");
        }
    }


    return (
        <BlockEditorLayout>
            <Head title="Edit With Block Editor" />
            <div className="layout-container block-editor">
                <div className="layout-page">
                    <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached bg-navbar-theme m-0">
                        <div className="navbar-nav-left navbar-nav d-flex justify-content-left align-items-center w-100">
                            <div className="icon w-10">
                                <button className="icon-link btn-link tooltip-btn">
                                    <FaElementor size={24} />
                                </button>
                            </div>
                            <div className="icon w-10">
                                <button className="icon-link btn-link tooltip-btn" onClick={() => setEditWidgetData(null)}>
                                    <FaPlus size={24} />
                                    <span className="tooltip-text">Add Element</span>
                                </button>
                            </div>
                            <div className="icon w-10">
                                <button className="icon-link btn-link tooltip-btn">
                                    <FaCog size={24} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="navbar-nav-center navbar-nav d-flex justify-content-center align-items-center w-100">
                            <div className="icon w-10">
                                <button
                                    className={`icon-link btn-link tooltip-btn ${activeDevice === 'Desktop' ? 'active' : ''}`}
                                    onClick={() => handleDeviceChange('Desktop')}
                                >
                                    <FaDesktop size={24} />
                                    <span className="tooltip-text">Desktop</span>
                                </button>
                            </div>
                            <div className="icon w-10">
                                <button
                                    className={`icon-link btn-link tooltip-btn ${activeDevice === 'Tablet' ? 'active' : ''}`}
                                    onClick={() => handleDeviceChange('Tablet')}
                                >
                                    <FaTabletAlt size={24} />
                                    <span className="tooltip-text">Tablet</span>
                                </button>
                            </div>
                            <div className="icon w-10">
                                <button
                                    className={`icon-link btn-link tooltip-btn ${activeDevice === 'Phone' ? 'active' : ''}`}
                                    onClick={() => handleDeviceChange('Phone')}
                                >
                                    <FaMobileAlt size={24} />
                                    <span className="tooltip-text">Phone</span>
                                </button>
                            </div>
                        </div>

                        <div className="navbar-nav-right navbar-nav d-flex justify-content-end align-items-center w-100">
                            <div className="preview-changes w-10">
                                <FaEye size={24} title="Preview Changes" />
                            </div>
                            <div className="publish-button">
                                <button className="btn-publish">Publish</button>
                            </div>
                        </div>
                    </nav>


                    <div className="body-content">
                            {editWidgetData ?
                                <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme editor-left-sidebar">
                                    {renderEditWidgetContent()}
                                   
                                </aside>
                            :
                            <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme editor-left-sidebar">

                                <header className="editor-widgets-header">
                                    <h2>Widgets</h2>
                                </header>
                                <div className="nav-item p-3">
                                    <div className="d-flex align-items-center position-relative">
                                        <FaSearch size={25} className="search-icon position-absolute ps-3" />
                                        <input type="text" className="form-control border-1 shadow-none ps-10" placeholder="Search..." aria-label="Search..." />
                                    </div>
                                </div>
                                <div className="widgets-list">
                                    <div className="widget-items p-3">
                                        <h6>Layout</h6>
                                        <ul>
                                            <li draggable onDragStart={(e) => handleDragStart(e, 'Row', 1)}>
                                                <FaBox size={16} className="widget-icon" /> Row
                                            </li>
                                            <li className="click-action" onClick={toggleGridLayout}>
                                                <FaSlidersH size={16} className="widget-icon" /> Grid
                                            </li>
                                        </ul>

                                        {selectedGridLayout && (
                                            <div className="grid-layout-options">
                                                <h6>Select Grid Columns</h6>
                                                <div className="grid-layouts">
                                                    <div className="row-wraper col-2-row" draggable onDragStart={(e) => handleDragStart(e, 'Grid', 2)}>
                                                    {[1, 2].map((i) => (
                                                        <div className="inner-cols" key={i}>{i} Col</div>
                                                    ))}
                                                    </div>
                                                    <div className="row-wraper  col-3-row" draggable onDragStart={(e) => handleDragStart(e, 'Grid', 3)}>
                                                    {[1, 2, 3].map((i) => (
                                                        <div className="inner-cols" key={i}>{i} Col</div>
                                                    ))}
                                                    </div>
                                                    <div className="row-wraper  col-4-row" draggable onDragStart={(e) => handleDragStart(e, 'Grid', 4)}>
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div className="inner-cols" key={i}>{i} Col</div>
                                                    ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="widget-items p-3">
                                        <h6>Basic</h6>
                                        <ul>
                                            <li draggable onDragStart={(e) => handleDragStart(e, 'TextEditor', 1)}>
                                                <FaTextWidth size={16} className="widget-icon" /> Text Editor
                                            </li>
                                            <li draggable onDragStart={(e) => handleDragStart(e, 'Heading', 1)}>
                                                <FaHeading size={16} className="widget-icon" /> Heading
                                            </li>
                                            <li draggable onDragStart={(e) => handleDragStart(e, 'Image', 1)}>
                                                <FaImage size={16} className="widget-icon" /> Image
                                            </li>
                                            <li draggable onDragStart={(e) => handleDragStart(e, 'Video', 1)}>
                                                <FaVideo size={16} className="widget-icon" /> Video
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </aside>
                            }
                        

                        <div className="content-wrapper editor-content-wrapper">
                            <iframe 
                                src={route('page.preview', post.id)} 
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                ref={iframeRef}
                            />
                            <div
                                className={`drop-zone dragged`}
                                style={{ 
                                    position: "absolute",
                                    bottom: "55px",
                                    width: "94%",
                                    textAlign: "center",
                                    padding: "123px 0 25px 0",
                                }}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                            ></div>
                            {dragging && 
                                <div
                                    className={`drop-zone dragged`}
                                    style={{ 
                                        position: "absolute",
                                        bottom: "55px",
                                        width: "94%",
                                        textAlign: "center",
                                        padding: "123px 0 25px 0",
                                    }}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                   
                                </div>
                           
                            }
                            
                        </div>
                    </div>
                </div>
            </div>
        </BlockEditorLayout>
    );
}
