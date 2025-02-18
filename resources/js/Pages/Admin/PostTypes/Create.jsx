import React, { useEffect, useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ errors, old }) {
     // State to keep track of local errors
     const [localErrors, setLocalErrors] = useState({});

     // Using the `useForm` hook from Inertia to manage form data and states like processing
     const { data, setData, post, processing, reset } = useForm({
         // Initializing the form data with values coming from the 'old' prop (presumably for editing an existing post type)
         title: old?.title || "",
         cpt_name: old?.cpt_name || "",
         singular_name: old?.singular_name || "",
         description: old?.description || "",
         show_in_menu: old?.show_in_menu || "Yes",
     });

     // Handle change of form inputs (convert cpt_name to lowercase)
     const handleChange = (e) => {
         const { name, value } = e.target;
         // If the field is 'cpt_name', convert the value to lowercase before setting it in the form data
         if (name === "cpt_name") {
             setData(name, value.toLowerCase());
         } else {
             setData(name, value); 
         }
     };
 
     // Handle form submission
     const handleSubmit = (e) => {
         e.preventDefault(); // Prevent default form submission
         post(route('posttype.store'), {
             onFinish: () => {
                 // Optional reset logic (currently commented out)
                 // reset(); 
             },
         });
     };
 
     // UseEffect hook to update local errors whenever they change (coming from server-side validation errors)
     useEffect(() => {
         setLocalErrors(errors);  // Set local errors state whenever 'errors' change
     }, [errors]);  // Dependency on 'errors' ensures that it updates when errors are changed
 
     // Function to remove specific error messages when closed (usually for UI purposes)
     const removeError = (key) => {
         const newErrors = { ...localErrors };  // Create a copy of the errors object
         delete newErrors[key];                // Remove the error corresponding to the key
         setLocalErrors(newErrors);            // Update the local errors state
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

            {/* Form Section to Create Post Type */}
            <div className="row">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}> 

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

                                {/* Submit Button */}
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        "Create Post Type"  
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
