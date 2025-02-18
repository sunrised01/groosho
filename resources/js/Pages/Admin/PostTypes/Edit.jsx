import React, { useEffect, useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';

export default function Edit({ postType, errors }) {
    // Local state to manage error messages that are displayed on the UI
    const [localErrors, setLocalErrors] = useState({});

    // Access flash data from the page context (used for success messages, etc.)
    const { flash } = usePage().props;
    const successMessage = flash.success;

    // Initialize the form using Inertia's useForm hook with the existing postType data
    const { data, setData, put, processing, reset } = useForm({
        title: postType?.title || "",            
        cpt_name: postType?.cpt_name || "",      
        singular_name: postType?.singular_name || "", 
        description: postType?.description || "",    
        show_in_menu: postType?.show_in_menu || "Yes", 
    });

    // Effect hook to handle errors and success messages
    useEffect(() => {
        setLocalErrors(errors); 
        if (successMessage) {
            toast.success(successMessage); 
        }
    }, [errors, successMessage]); 

    // Handle changes to form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        // If the field is 'cpt_name', convert the value to lowercase before updating the form data
        if (name === "cpt_name") {
            setData(name, value.toLowerCase());
        } else {
            setData(name, value); 
        }
    };

    // Handle form submission (PUT request to update the post type)
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        put(route('posttype.update', postType.id), { // Perform PUT request with the postType ID
            onFinish: () => {
                // Optional callback after submission finishes, such as resetting form data
            },
            onSuccess: () => {
                // Optionally handle success actions after the form is submitted successfully
            },
        });
    };

    // Function to remove a specific error message
    const removeError = (key) => {
        const newErrors = { ...localErrors }; // Copy the current errors state
        delete newErrors[key]; // Delete the specific error by key
        setLocalErrors(newErrors); // Update the local errors state
    };

    return (
        <AppLayout>
            <Head title="Edit Post Type" />
            {/* Page header */}
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Edit Post Type</h2>
                    <Link href={route('posttype.create')} className="btn btn-outline-primary">Add New Post Type</Link>
                </div>
            </div>

            {/* Display error messages if available */}
            {Object.keys(localErrors).length > 0 && (
                <div>
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

            {/* Form container */}
            <div className="row">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Title input */}
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Title<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        className="form-control"
                                        value={data.title}
                                        onChange={handleChange}
                                    />
                                    <small className="form-text text-muted">Name of the post type shown in the menu (usually plural).</small>
                                </div>

                                {/* CPT Name input */}
                                <div className="mb-3">
                                    <label htmlFor="cpt_name" className="form-label">CPT Name<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="cpt_name"
                                        name="cpt_name"
                                        className="form-control"
                                        value={data.cpt_name}
                                        onChange={handleChange}
                                    />
                                    <small className="form-text text-muted">Must not exceed 20 characters and may only contain lowercase alphanumeric characters, dashes, and underscores.</small>
                                </div>

                                {/* Singular Name input */}
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
                                    <small className="form-text text-muted">Name for one object of this post type.</small>
                                </div>

                                {/* Description input */}
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-control"
                                        value={data.description}
                                        onChange={handleChange}
                                    />
                                    <small className="form-text text-muted">A short descriptive summary of what the post type is.</small>
                                </div>

                                {/* Show In Menu dropdown */}
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
                                    <small className="form-text text-muted">Show this post type in its own top-level menu. "Show UI" must be true.</small>
                                </div>

                                {/* Submit button */}
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 
                                    ) : (
                                        "Update Post Type"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
