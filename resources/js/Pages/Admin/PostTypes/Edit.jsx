import React, { useEffect, useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';


export default function Edit({ postType, errors }) {
    const [localErrors, setLocalErrors] = useState({});

    const { flash } = usePage().props;
    const successMessage = flash.success;

    // Initialize form data using `postType` props
    const { data, setData, put, processing, reset } = useForm({
        title: postType?.title || "",
        cpt_name: postType?.cpt_name || "",
        label: postType?.label || "",
        singular_name: postType?.singular_name || "",
        description: postType?.description || "",
        show_in_menu: postType?.show_in_menu || "Yes",
    });

    useEffect(() => {
        setLocalErrors(errors); 
        if(successMessage){
            toast.success(successMessage);
        }
    }, [errors, successMessage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('posttype.update', postType.id), {
            onFinish: () => {
                // reset form or do something after submission
            },
            onSuccess: () => {
                
            },
        });
    };

    const removeError = (key) => {
        const newErrors = { ...localErrors };
        delete newErrors[key];
        setLocalErrors(newErrors);
    };


    return (
        <AppLayout>
            <Head title="Edit Post Type" />
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
