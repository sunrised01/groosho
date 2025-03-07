import React, { useState, useEffect } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AttachmentSelector from '@/Components/Admin/AttachmentSelector';
import { FaTimes } from 'react-icons/fa'; 


export default function Edit() {
    const { taxonomyData, parentCategories, flash, errors, term} = usePage().props;

    const [successMessage, setSuccessMessage] = useState(flash?.success);
    const [localerrors, setLocalErrors] = useState(errors);
    const [featuredImage, setFeaturedImage] = useState(term?.attachment?.small_url || null);
    
    
     // UseForm hook initialization
     const { data, setData, put, processing, reset } = useForm({
        name: term?.name || "",
        slug: term?.slug || "",
        description: term?.description || "",
        parent_id: term?.parent_id || "0", 
        attachment_id: term?.attachment_id || "",
        taxonomy: taxonomyData.slug,
    });

    const insertFeaturedImage = (selectedFile) => {
        if(selectedFile){
            setFeaturedImage(selectedFile.preview_url);
            setData('attachment_id', selectedFile.id);
        }
     }

    const handleDeleteImage = () => {
        setFeaturedImage(null);  
        setData('attachment_id', "");

    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'slug') {
            const cleanedValue = value
                .replace(/\s+/g, '-') 
                .replace(/[^a-zA-Z0-9-]/g, '') 
                .toLowerCase(); 
            
                setData(name, cleanedValue);
        }        
        else {
            setData(name, value);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('term.update', [taxonomyData.slug, term.id]), {
            onSuccess: (response) => {
                setFeaturedImage(null);
                reset();
            },
        });
    };


    const removeError = (key) => {
        const newErrors = { ...errors };
        delete newErrors[key];
        setLocalErrors(newErrors);
    };

    const removeSuccessMessage = () => {
        setSuccessMessage(null);
    };

    useEffect(() => {
        setLocalErrors(errors || {});        
        setSuccessMessage(flash?.success || "");      
    }, [errors], flash?.success);

    
    
    return (
        <AppLayout>
            <Head title={`Edit ${taxonomyData.singular_name}`} />
            <div className="row mb-4 ">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Edit {taxonomyData.singular_name}</h2>
                    <Link href={route('term.index', taxonomyData.slug)} className="btn btn-outline-primary">Back</Link>

                </div>
            </div>
            {successMessage && 
                <div className="alert alert-primary alert-dismissible fade show">
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => removeSuccessMessage()}
                    ></button>
                    <p className="m-0">{successMessage}</p>
                </div>
            }
            {/* Display Error Messages */}
            {Object.keys(localerrors).length > 0 && (
                <div className="row mb-4 p-3">
                    {Object.keys(localerrors).map((errorKey, index) => (
                        <div key={index} className="alert alert-danger alert-dismissible fade show">
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => removeError(errorKey)}
                            ></button>
                            <p className="m-0">{localerrors[errorKey]}</p>
                        </div>
                    ))}
                </div>
            )}
            {/* Layout with 2 columns */}
            <div className="row">
                {/* Left Column (Form Section) */}
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            
                            {/* Form */}
                            <form onSubmit={handleSubmit} autoComplete="off">
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter name"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="slug" className="form-label">Slug</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="slug"
                                        name="slug"
                                        value={data.slug}
                                        onChange={handleInputChange}
                                        placeholder="Enter slug"
                                    />
                                </div>

                                {taxonomyData.slug === 'category' && (
                                    <div className="mb-3">
                                        <label htmlFor="parent_id" className="form-label">Parent Category</label>
                                        <select
                                            className="form-select"
                                            id="parent_id"
                                            name="parent_id"
                                            value={data.parent_id}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Parent Category</option>
                                            {parentCategories && parentCategories.map((parentCategory, index) => (
                                                <option key={index} value={parentCategory.id}>{parentCategory.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Enter description"
                                    ></textarea>
                                </div>

                                {featuredImage ? (
                                    <div className="mb-3">
                                        <div style={{ position: "relative", display: "inline-block" }}>
                                            <img 
                                                src={featuredImage} 
                                                alt="Featured Preview" 
                                                style={{
                                                width: "100px",
                                                height: "100px",
                                                objectFit: "cover",
                                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                                                borderRadius: "8px",
                                                border: "2px solid rgba(0, 0, 0, 0.2)"
                                                }} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleDeleteImage} 
                                                className="btn btn-danger"
                                                style={{
                                                position: "absolute",
                                                top: "-10px",
                                                right: "-10px",
                                                borderRadius: "50%",
                                                padding: "5px",
                                                background: "rgba(255, 0, 0, 0.6)",
                                                color: "white",
                                                border: "none",
                                                fontSize: "14px",
                                                }}>
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <label htmlFor="image" className="form-label">Upload Image</label>
                                        <AttachmentSelector onImageSelect={insertFeaturedImage} buttonname="Select Image" filetype="image" />
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? (
                                        <>
                                            `Update ${taxonomyData.singular_name}` <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        </>
                                        
                                    ) : (
                                        `Update ${taxonomyData.singular_name}`
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
