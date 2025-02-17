import React, { useEffect, useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ errors, old }) {
    const [localErrors, setLocalErrors] = useState({});
    // Using the `useForm` hook from Inertia
    const { data, setData, post, processing, reset } = useForm({
        title: old?.title || "",
        cptName: old?.cptName || "",
        label: old?.label || "",
        singularName: old?.singularName || "",
        description: old?.description || "",
        showInMenu: old?.showInMenu || "Yes",
    });

    const cptNameRegex = /^[a-z0-9-_]{1,20}$/;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);  
    };

    

    const handleSubmit = (e) => {
        e.preventDefault();
            post(route('posttype.store'), {
                onFinish: () => {
                   //reset(); 
                },
            });
    };

    useEffect(() => {
        setLocalErrors(errors);  // Set errors to local state whenever props change
    }, [errors]);


    const removeError = (key) => {
        const newErrors = { ...localErrors };  // Copy errors
        delete newErrors[key];                 // Remove specific error by key
        setLocalErrors(newErrors);             // Update the localErrors state
    };
    
    return (
        <AppLayout>
            <Head title="Post Types" />
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Create New Post Type</h2>
                    <Link href={route('posttype.create')} className="btn btn-outline-primary">Add New Post Type</Link>

                </div>
            </div>

            {Object.keys(localErrors).length > 0 && (
                <div>
                    {Object.keys(localErrors).map((errorKey, index) => (
                        <div key={index} className="alert alert-danger alert-dismissible fade show">
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => removeError(errorKey)}  // Dynamically remove error
                            ></button>
                            <p className="m-0">{localErrors[errorKey]}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="row">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
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
                                    <small className="form-text text-muted">This will be the title of the post type.</small>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="cptName" className="form-label">CPT Name<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="cptName"
                                        name="cptName"
                                        className="form-control"
                                        value={data.cptName}
                                        onChange={handleChange}
                                    />
                                    <small className="form-text text-muted">Must not exceed 20 characters and may only contain lowercase alphanumeric characters, dashes, and underscores.</small>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="label" className="form-label">Label<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="label"
                                        name="label"
                                        className="form-control"
                                        value={data.label}
                                        onChange={handleChange}
                                    />
                                    <small className="form-text text-muted">Name of the post type shown in the menu (usually plural).</small>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="singularName" className="form-label">Singular Name</label>
                                    <input
                                        type="text"
                                        id="singularName"
                                        name="singularName"
                                        className="form-control"
                                        value={data.singularName}
                                        onChange={handleChange}
                                    />
                                    <small className="form-text text-muted">Name for one object of this post type.</small>
                                </div>

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

                                <div className="mb-3">
                                    <label htmlFor="showInMenu" className="form-label">Show In Menu</label>
                                    <select
                                        id="showInMenu"
                                        name="showInMenu"
                                        className="form-control"
                                        value={data.showInMenu}
                                        onChange={handleChange}
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                    <small className="form-text text-muted">Show this post type in its own top-level menu. "Show UI" must be true.</small>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={processing}>Create Post Type</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
