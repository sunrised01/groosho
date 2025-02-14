import React, { useEffect, useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';


export default function Create() {

    const [errors, setErrors] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        cptName: "",
        label: "",
        singularName: "",
        description: "",
        showInMenu: "Yes",
    });

    const [inputerrors, setInputErrors] = useState({
        title: "",
        cptName: "",
        label: "",
    });

    const cptNameRegex = /^[a-z0-9-_]{1,20}$/;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (inputerrors[name]) {
            setInputErrors({
                ...inputerrors,
                [name]: ""
            });
        }
    };

    const validateForm = () => {
        let valid = true;
        let errorMessages = { ...inputerrors };

        // Title Validation
        if (!formData.title) {
            errorMessages.title = "Title is required.";
            valid = false;
        }

        // CPT Name Validation
        if (!formData.cptName) {
            errorMessages.cptName = "CPT Name is required.";
            valid = false;
        } else if (formData.cptName.length > 20) {
            errorMessages.cptName = "CPT Name must not exceed 20 characters.";
            valid = false;
        } else if (!cptNameRegex.test(formData.cptName)) {
            errorMessages.cptName = "CPT Name must contain only lowercase alphanumeric characters, dashes, and underscores.";
            valid = false;
        }

        // Label Validation
        if (!formData.label) {
            errorMessages.label = "Label is required.";
            valid = false;
        }

        setInputErrors(errorMessages);
        return valid;
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        //if (validateForm()) {
            try {
                const response = await axios.post(route('posttype.store'), formData);
                console.log(response.data); 
            } catch (error) {
            
                if (error.response && error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response && error.response.data.message) {
                    setErrors([{ general: error.response.data.message }]);
                } else {
                    setErrors([{ general: 'An error occurred while creating the post type.' }]);
                }
            }
        //}
    };

    const removeError = (index) => {
        const newErrors = [...errors];
        newErrors.splice(index, 1); 
        setErrors(newErrors);        
    };
    console.log(errors);

    return (
        <AppLayout>
            <Head title="Post Types" />
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Create New Post Type</h2>
                </div>
            </div>
           {errors.length > 0 && (
                <div>
                    {errors.map((error, index) => (
                        <div key={index} className="alert alert-danger alert-dismissible fade show">
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => removeError(index)}
                                aria-label="Close"
                            ></button>
                            <p className="m-0">{error.general}</p>
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
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                    <small className="form-text text-muted">This will be the title of the post type.</small>
                                    {inputerrors.title && <div className="text-danger">{inputerrors.title}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="cptName" className="form-label">CPT Name<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="cptName"
                                        name="cptName"
                                        className="form-control"
                                        value={formData.cptName}
                                        onChange={handleChange}
                                    />
                                    <small className="form-text text-muted">Must not exceed 20 characters and may only contain lowercase alphanumeric characters, dashes, and underscores.</small>
                                    {inputerrors.cptName && <div className="text-danger">{inputerrors.cptName}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="label" className="form-label">Label<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="label"
                                        name="label"
                                        className="form-control"
                                        value={formData.label}
                                        onChange={handleChange}
                                    />
                                    <small className="form-text text-muted">Name of the post type shown in the menu (usually plural).</small>
                                    {inputerrors.label && <div className="text-danger">{inputerrors.label}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="singularName" className="form-label">Singular Name</label>
                                    <input
                                        type="text"
                                        id="singularName"
                                        name="singularName"
                                        className="form-control"
                                        value={formData.singularName}
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
                                        value={formData.description}
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
                                        value={formData.showInMenu}
                                        onChange={handleChange}
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                    <small className="form-text text-muted">Show this post type in its own top-level menu. "Show UI" must be true.</small>
                                </div>

                                <button type="submit" className="btn btn-primary">Create Post Type</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}