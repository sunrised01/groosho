import React, { useState, useRef } from "react";
import { Head, usePage } from '@inertiajs/react';
import { FaElementor, FaPlus, FaCog, FaEye, FaSearch, FaBox, FaTextWidth, FaHeading, FaImage, FaVideo, FaSlidersH } from "react-icons/fa";
import BlockEditorLayout from '@/Pages/Admin/Layouts/BlockEditorLayout';

export default function Index() {
    const { post } = usePage().props;
    const iframeRef = useRef(null);
    const [widgets, setWidgets] = useState([]);
    const [dragging, setDragging] = useState(false); // State to manage drag state

    const handleDragStart = (e, widgetType) => {
        e.dataTransfer.setData("widgetType", widgetType);
        setDragging(true); // Start dragging, show the drop area
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const widgetType = e.dataTransfer.getData("widgetType");
       // console.log('widgetType: ', widgetType);
        const newWidget = { type: widgetType, id: Date.now() };
        setWidgets((prevWidgets) => [...prevWidgets, newWidget]);

        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage(newWidget, "*");
        }

        setDragging(false); // Reset drag state after drop
    };

    const handleIframeLoad = () => {
        const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        if (iframeDocument) {
            iframeDocument.addEventListener('drop', handleDrop);
            iframeDocument.addEventListener('dragover', (e) => e.preventDefault());
        }
    };

    //console.log(widgets);
    return (
        <BlockEditorLayout>
            <Head title="Edit With Block Editor" />
            <div className="layout-container block-editor">
                <div className="layout-page">
                    <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached bg-navbar-theme m-0">
                        <div className="navbar-nav-left navbar-nav d-flex justify-content-left align-items-center w-50">
                            <div className="icon w-10">
                                <FaElementor size={24} />
                            </div>
                            <div className="icon w-10">
                                <FaPlus size={24} />
                            </div>
                            <div className="icon w-10">
                                <FaCog size={24} />
                            </div>
                        </div>
                        <div className="navbar-nav-right navbar-nav d-flex justify-content-end align-items-center w-50">
                            <div className="preview-changes w-10">
                                <FaEye size={24} title="Preview Changes" />
                            </div>
                            <div className="publish-button">
                                <button className="btn-publish">Publish</button>
                            </div>
                        </div>
                    </nav>

                    <div className="body-content">
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
                                        <li draggable onDragStart={(e) => handleDragStart(e, 'Row')}>
                                            <FaBox size={16} className="widget-icon" /> Row
                                        </li>
                                        <li draggable onDragStart={(e) => handleDragStart(e, 'Grid')}>
                                            <FaSlidersH size={16} className="widget-icon" /> Grid
                                        </li>
                                    </ul>
                                </div>
                                <div className="widget-items p-3">
                                    <h6>Basic</h6>
                                    <ul>
                                        <li draggable onDragStart={(e) => handleDragStart(e, 'TextEditor')}>
                                            <FaTextWidth size={16} className="widget-icon" /> Text Editor
                                        </li>
                                        <li draggable onDragStart={(e) => handleDragStart(e, 'Heading')}>
                                            <FaHeading size={16} className="widget-icon" /> Heading
                                        </li>
                                        <li draggable onDragStart={(e) => handleDragStart(e, 'Image')}>
                                            <FaImage size={16} className="widget-icon" /> Image
                                        </li>
                                        <li draggable onDragStart={(e) => handleDragStart(e, 'Video')}>
                                            <FaVideo size={16} className="widget-icon" /> Video
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </aside>

                        <div className="content-wrapper editor-content-wrapper">
                            <iframe 
                                src={route('page.preview', post.id)} 
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                ref={iframeRef}
                            />
                            {dragging ? 
                                <div
                                    className={`drop-zone dragged`}
                                    style={{ 
                                        height: '93px',
                                        position: 'absolute',
                                        bottom: '34px',
                                        width: '94%',
                                        textAlign: 'center',
                                        padding: '39px 0',
                                    }}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    Drop here to add widget
                                </div>
                            :
                            <div
                                className={`drop-zone`}
                                style={{ 
                                    height: '93px',
                                    position: 'absolute',
                                    bottom: '34px',
                                    width: '94%',
                                    textAlign: 'center',
                                    padding: '39px 0',
                                }}
                             
                            >
                                Drop here to add widget
                            </div>
                            }
                            
                        </div>
                    </div>
                </div>
            </div>
        </BlockEditorLayout>
    );
}
