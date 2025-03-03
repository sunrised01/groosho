import React, { useState, useEffect } from "react";
import { Inertia } from '@inertiajs/inertia'; 
import Dropdown from '@/Components/Dropdown';
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import FeaturedImageSelector from '@/Components/Admin/FeaturedImageSelector';
import Pagination from '@/Components/Pagination';
import { FaArrowUp, FaArrowDown, FaTimes } from 'react-icons/fa'; 
import { toast } from 'react-toastify';


export default function Index() {
    const { taxonomyData } = usePage().props;
    const [featuredImage, setFeaturedImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentCategory: '',
        image: null,
    });

    const insertFeaturedImage = (selectedFile) => {
        if(selectedFile){
            setFeaturedImage(selectedFile);
            setFormData({ ...formData, image: selectedFile.id });
        }
     }

    const handleDeleteImage = () => {
        setFeaturedImage(null);  
        setFormData({ ...formData, image: null });

    };
    
    const generateSlug = (text) => {
        return text
            .toLowerCase() 
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, ''); 
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            const generatedSlug = generateSlug(value);
            setFormData({
                ...formData,
                [name]: value,
                slug: generatedSlug,
            });
        
        } 
        else if (name === 'slug') {
            const cleanedValue = value
                .replace(/\s+/g, '-') 
                .replace(/[^a-zA-Z0-9-]/g, '') 
                .toLowerCase(); 
            
            setFormData({ ...formData, [name]: cleanedValue });
        }        
        else {
            setFormData({ ...formData, [name]: value });
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('term.store'), {
            onFinish: () => {
                // Optional reset logic (currently commented out)
                // reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title={taxonomyData.title} />
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">{taxonomyData.title}</h2>
                </div>
            </div>

            {/* Layout with 2 columns */}
            <div className="row">
                {/* Left Column (Form Section) */}
                <div className="col-4">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title mb-4">Create New {taxonomyData.singular_name}</h4>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
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
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        placeholder="Enter slug"
                                    />
                                </div>

                                {taxonomyData.taxonomy_name === 'category' && (
                                    <div className="mb-3">
                                        <label htmlFor="parentCategory" className="form-label">Parent Category</label>
                                        <select
                                            className="form-select"
                                            id="parentCategory"
                                            name="parentCategory"
                                            value={formData.parentCategory}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Parent Category</option>
                                            {/* Add dynamic options for parent categories here */}
                                        </select>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        value={formData.description}
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

                                <button type="submit" className="btn btn-primary">Create {taxonomyData.singular_name}</button>
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
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Slug</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Example row */}
                                    <tr>
                                        <td>
                                            {/* Example image placeholder */}
                                            <img src="path-to-image.jpg" alt="Category Image" className="img-fluid" style={{ width: "50px" }} />
                                        </td>
                                        <td>Jazz</td>
                                        <td>jazz</td>
                                        <td>10</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {/* Example image placeholder */}
                                            <img src="path-to-image.jpg" alt="Category Image" className="img-fluid" style={{ width: "50px" }} />
                                        </td>
                                        <td>Bebop</td>
                                        <td>bebop</td>
                                        <td>5</td>
                                    </tr>
                                    {/* Add dynamic rows here based on your data */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
