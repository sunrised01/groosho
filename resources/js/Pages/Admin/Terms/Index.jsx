import React, { useState, useEffect } from "react";
import { Inertia } from '@inertiajs/inertia'; 
import Dropdown from '@/Components/Dropdown';
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import FeaturedImageSelector from '@/Components/Admin/FeaturedImageSelector';
import Pagination from '@/Components/Pagination';
import { FaArrowUp, FaArrowDown, FaTimes } from 'react-icons/fa'; 
import { toast } from 'react-toastify';


export default function Index() {
    const { taxonomyData, parentCategories, flash, errors, terms } = usePage().props;
    console.log(terms)
    const formData = flash?.response?.formData;
    const [localerrors, setLocalErrors] = useState(flash?.response?.errors || {});
    const [featuredImage, setFeaturedImage] = useState(null);
    
    
     // UseForm hook initialization
     const { data, setData, post, processing, reset } = useForm({
        name: formData?.name || "",
        slug: formData?.slug || "",
        description: formData?.description || "",
        parent_id: formData?.parent_id || 0, 
        attachment_id: formData?.attachment_id || 0,
        taxonomy: taxonomyData.taxonomy_name,
    });

    const insertFeaturedImage = (selectedFile) => {
        if(selectedFile){
            setFeaturedImage(selectedFile);
            setData('attachment_id', selectedFile.id);
        }
     }

    const handleDeleteImage = () => {
        setFeaturedImage(null);  
        setData('attachment_id', 0);

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
        post(route('term.store', taxonomyData.taxonomy_name), {
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

    useEffect(() => {
        setLocalErrors(flash?.response?.errors || {});        
    }, [flash?.response?.errors]);

    const renderTermsInTable = (terms, level = 0) => {
        return terms.map(term => (
            
            <React.Fragment key={term.id}>
                <tr >
                    <td style={{ textAlign: 'center' }}>
                        <img 
                            src={term.attachment ? term.attachment.small_url : ''} 
                            alt="Term Image" 
                            style={{
                            marginTop: '12px',
                            borderRadius: '2px', 
                            objectFit: 'cover',
                            }} 
                        />
                        </td>

                    <td>{level > 0 ? '- '.repeat(level) : ''}{term.name}</td>
                    <td>{term.slug}</td>
                    <td>0</td>
                </tr>

                {term.childrens && term.childrens.length > 0 && renderTermsInTable(term.childrens, level + 1)}
            </React.Fragment>
        ));
    };
    
    return (
        <AppLayout>
            <Head title={taxonomyData.title} />
            <div className="row mb-4 ">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">{taxonomyData.title}</h2>
                </div>
            </div>
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
                <div className="col-4">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title mb-4">Create New {taxonomyData.singular_name}</h4>
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

                                {taxonomyData.taxonomy_name === 'category' && (
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
                                                src={featuredImage.preview_url} 
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
                                        <FeaturedImageSelector onImageSelect={insertFeaturedImage} buttonname="Select Image" filetype="image" />
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? (
                                        <>
                                            `Create ${taxonomyData.singular_name}` <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        </>
                                        
                                    ) : (
                                        `Create ${taxonomyData.singular_name}`
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column (Table Section) */}
                <div className="col-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title mb-4">{taxonomyData.title} List</h4>

                            {/* Table */}
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="w-10">Icon</th>
                                        <th className="w-40">Name</th>
                                        <th className="w-30">Slug</th>
                                        <th className="w-20">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderTermsInTable(terms)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
