import React, { useState, useEffect } from "react";
import { Inertia } from '@inertiajs/inertia'; 
import Dropdown from '@/Components/Dropdown';
import BlockEditorLayout from '@/Pages/Admin/Layouts/BlockEditorLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import { toast } from 'react-toastify';
import { FaElementor, FaPlus, FaCog, FaEye, FaSearch, FaBox, FaTextWidth, FaHeading, FaImage, FaVideo, FaRegHandPointer, FaSlidersH, FaMapMarkedAlt, FaRegWindowMaximize } from "react-icons/fa";

export default function Index() {
    // State to manage rows and their widgets
    const [rows, setRows] = useState([]);

    // Handle the drag start for li items
    const handleDragStart = (e, widgetType) => {
        e.dataTransfer.setData("widgetType", widgetType);
    };

    // Handle drop event to create a new row
    const handleDrop = (e) => {
        e.preventDefault();
        const widgetType = e.dataTransfer.getData("widgetType");

        if (widgetType) {
            // Create a new row with the widget type
            const newRow = {
                id: Date.now(),
                widgets: [{ id: Date.now(), widgetType }],
            };

            setRows((prev) => [...prev, newRow]);
        }
    };

    // Prevent default to allow drop
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Handle adding widgets to a specific row
    const handleAddWidgetToRow = (rowId, widgetType) => {
        const newRow = rows.map((row) => {
            if (row.id === rowId) {
                return {
                    ...row,
                    widgets: [
                        ...row.widgets,
                        { id: Date.now(), widgetType },
                    ],
                };
            }
            return row;
        });

        setRows(newRow);
    };


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
                                    <input
                                        type="text"
                                        className="form-control border-1 shadow-none ps-10"
                                        placeholder="Search..."
                                        aria-label="Search..."
                                    />
                                </div>
                            </div>
                            <div className="widgets-list">
                                <div className="widget-items p-3">
                                    <h6>Layout</h6>
                                    <ul>
                                        <li
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, 'Container')}
                                        >
                                            <FaBox size={16} className="widget-icon" /> Container
                                        </li>
                                        <li
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, 'Grid')}
                                        >
                                            <FaSlidersH size={16} className="widget-icon" /> Grid
                                        </li>
                                    </ul>
                                </div>
                                <div className="widget-items p-3">
                                    <h6>Basic</h6>
                                    <ul>
                                        <li
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, 'TextEditor')}
                                        >
                                            <FaTextWidth size={16} className="widget-icon" /> Text Editor
                                        </li>
                                        <li
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, 'Heading')}
                                        >
                                            <FaHeading size={16} className="widget-icon" /> Heading
                                        </li>
                                        <li
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, 'Image')}
                                        >
                                            <FaImage size={16} className="widget-icon" /> Image
                                        </li>
                                        <li
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, 'Video')}
                                        >
                                            <FaVideo size={16} className="widget-icon" /> Video
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </aside>

                        <div className="content-wrapper editor-content-wrapper" >
                            {/* Render the created containers */}
                            <div className="container flex-grow-1 container-p-y">
                                {rows.map((row) => (
                                    <div key={row.id} className="row">
                                        {row.widgets.map((widget) => (
                                            <div key={widget.id} className="widget-item">
                                                <h3>{widget.widgetType}</h3>
                                            </div>
                                        ))}

                                        <div
                                            className="plus-icon-container"
                                            onClick={() => handleAddWidgetToRow(row.id, 'TextEditor')}
                                        >
                                            <FaPlus size={30} className="plus-icon" />
                                        </div>
                                    </div>
                                ))}

                                <div 
                                className="row-container" 
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                >
                                    
                                    <div className="plus-icon-container">
                                        <FaPlus size={30} className="plus-icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BlockEditorLayout>
    );
}
