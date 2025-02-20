import React, { useEffect, useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FaChevronDown, FaChevronUp, FaEye, FaMapPin, FaCalendar } from 'react-icons/fa';
import { Button } from "@headlessui/react";

export default function Create({ errors, old }) {
    const [localErrors, setLocalErrors] = useState({});
    const [activeSections, setActiveSections] = useState({
        'sb-publish': true,  // Set default to open
        'sb-test': true,     // Set default to open
    });
    const [isOpenStatusBox, setIsOpenStatusBox] = useState(false);

    // Toggle a specific section's state (open/close)
    const toggleItem = (index) => {
        setActiveSections(prevState => ({
            ...prevState,
            [index]: !prevState[index],  // Toggle the current section's state
        }));
    };

    const openStatusBox = () => {
        setIsOpenStatusBox(true);
    };

    const handleSaveClick = () => {
        setIsOpenStatusBox(false);
    };

    const closeStatusBox = () => {
        setIsOpenStatusBox(false);
    };

    // Using the `useForm` hook from Inertia to manage form data and states like processing
    const { data, setData, post, processing, reset } = useForm({
        title: old?.title || "",
        cpt_name: old?.cpt_name || "",
        singular_name: old?.singular_name || "",
        description: old?.description || "",
        show_in_menu: old?.show_in_menu || "Yes",
    });

    // Handle change of form inputs (convert cpt_name to lowercase)
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "cpt_name") {
            setData(name, value.toLowerCase());
        } else {
            setData(name, value); 
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); 
        post(route('posttype.store'), {
            onFinish: () => {
                // Optional reset logic (currently commented out)
                // reset(); 
            },
        });
    };

    // UseEffect hook to update local errors whenever they change (coming from server-side validation errors)
    useEffect(() => {
        setLocalErrors(errors);  
    }, [errors]);  

    const removeError = (key) => {
        const newErrors = { ...localErrors };  
        delete newErrors[key];                
        setLocalErrors(newErrors);            
    };

    return (
        <AppLayout>
            <Head title="Post Types" />
            {/* Page Header Section */}
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Create New Post Type</h2> 
                </div>
            </div>

            {/* Display Error Messages */}
            {Object.keys(localErrors).length > 0 && (
                <div>
                    {/* Loop through all error keys and display corresponding error message */}
                    {Object.keys(localErrors).map((errorKey, index) => (
                        <div key={index} className="alert alert-danger alert-dismissible fade show">
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => removeError(errorKey)} 
                            ></button>
                            <p className="m-0">{localErrors[errorKey]}</p> 
                        </div>
                    ))}
                </div>
            )}
            <form onSubmit={handleSubmit}> 
                <div className="row mb-4">
                    <div className="col-8">
                        {/* Form Section to Create Post Type */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <div className="form-fields"> 

                                            {/* Title Input Field */}
                                            <div className="mb-3">
                                                <label htmlFor="title" className="form-label">
                                                    Title<span className="text-danger">*</span> 
                                                </label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    name="title"
                                                    className="form-control"
                                                    value={data.title}  
                                                    onChange={handleChange} 
                                                />
                                                <small className="form-text text-muted">
                                                    Name of the post type shown in the menu (usually plural).
                                                </small>
                                            </div>

                                            {/* CPT Name Input Field */}
                                            <div className="mb-3">
                                                <label htmlFor="cpt_name" className="form-label">
                                                    CPT Name<span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="cpt_name"
                                                    name="cpt_name"
                                                    className="form-control"
                                                    value={data.cpt_name} 
                                                    onChange={handleChange}
                                                />
                                                <small className="form-text text-muted">
                                                    Must not exceed 20 characters and may only contain lowercase alphanumeric characters, dashes, and underscores.
                                                </small>
                                            </div>

                                            {/* Singular Name Input Field */}
                                            <div className="mb-3">
                                                <label htmlFor="singular_name" className="form-label">Singular Name</label>
                                                <input
                                                    type="text"
                                                    id="singular_name"
                                                    name="singular_name"
                                                    className="form-control"
                                                    value={data.singular_name}  
                                                    onChange={handleChange} 
                                                />
                                                <small className="form-text text-muted">
                                                    Name for one object of this post type.
                                                </small>
                                            </div>

                                            {/* Description Input Field */}
                                            <div className="mb-3">
                                                <label htmlFor="description" className="form-label">Description</label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    className="form-control"
                                                    value={data.description}
                                                    onChange={handleChange}
                                                />
                                                <small className="form-text text-muted">
                                                    A short descriptive summary of what the post type is.
                                                </small>
                                            </div>

                                            {/* Show In Menu Dropdown */}
                                            <div className="mb-3">
                                                <label htmlFor="show_in_menu" className="form-label">Show In Menu</label>
                                                <select
                                                    id="show_in_menu"
                                                    name="show_in_menu"
                                                    className="form-control"
                                                    value={data.show_in_menu}
                                                    onChange={handleChange}
                                                >
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                                <small className="form-text text-muted">
                                                    Show this post type in its own top-level menu. "Show UI" must be true.
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-4">
                        <div className="accordion">
                            <div className="card mb-4">
                                <div className="card-body p-0">
                                    <div key="sb-publish" className="accordion-item m-0">
                                        <div className="accordion-header d-flex justify-content-between align-items-center p-3" onClick={() => toggleItem("sb-publish")}>
                                            <h3>Publish</h3>
                                            {activeSections["sb-publish"] ? (
                                                <FaChevronUp className="ms-2" />
                                            ) : (
                                                <FaChevronDown className="ms-2" />
                                            )}
                                        </div>
                                        {activeSections["sb-publish"] && (
                                            <div className="accordion-content">
                                                <div className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="d-flex justify-content-between align-items-center"><FaMapPin className="me-2" />Current Status: <b className="ms-1">Published</b></span>
                                                        {!isOpenStatusBox && (
                                                            <button className="btn btn-link" onClick={openStatusBox}>
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>

                                                    {isOpenStatusBox && (
                                                        <div className="mt-3">
                                                            <select className="form-select">
                                                                <option value="publish">Publish</option>
                                                                <option value="draft">Draft</option>
                                                                <option value="trash">Trash</option>
                                                            </select>
                                                            <div className="d-flex justify-content-between mt-2">
                                                                <button className="btn btn-success" onClick={handleSaveClick}>
                                                                Save
                                                                </button>
                                                                <button className="btn btn-secondary" onClick={closeStatusBox}>
                                                                Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="d-flex justify-content-between align-items-center"><FaEye className="me-2" />Visibility: <b className="ms-1">Public</b></span>
                                                        {!isOpenStatusBox && (
                                                            <button className="btn btn-link" onClick={openStatusBox}>
                                                                Edit
                                                            </button>
                                                        )}
                                                </div>
                                                </div>
                                                <div className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="d-flex justify-content-between align-items-center"><FaCalendar className="me-2" />Published on: <b className="ms-1">Feb 20, 2025 at 13:41</b></span>
                                                        
                                                </div>
                                                </div>
                                                <div className="p-3 mt-5 pt-3 border-top bg-light">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <button className="btn btn-link text-danger">
                                                            Move to Trash
                                                        </button>
                                                        {/* Submit Button */}
                                                        <button type="submit" className="btn btn-primary" disabled={processing}>
                                                            {processing ? (
                                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            ) : (
                                                                "Publish"  
                                                            )}
                                                        </button>
                                                </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>   

                        <div className="accordion">
                            <div className="card mb-4">
                                <div className="card-body p-0">
                                    <div key="sb-test" className="accordion-item m-0">
                                        <div className="accordion-header d-flex justify-content-between align-items-center p-3" onClick={() => toggleItem("sb-test")}>
                                            <h3>Test</h3>
                                            {activeSections["sb-test"] ? (
                                                <FaChevronUp className="ms-2" />
                                            ) : (
                                                <FaChevronDown className="ms-2" />
                                            )}
                                        </div>
                                        {activeSections["sb-test"] && (
                                        <div className="accordion-content p-3">
                                            <p>This is second accordion</p>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>                    
                    </div>   
                </div>
            </form>
        </AppLayout>
    );
}
