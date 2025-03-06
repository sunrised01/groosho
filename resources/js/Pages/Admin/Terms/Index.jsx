import React, { useState, useEffect } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import FeaturedImageSelector from '@/Components/Admin/FeaturedImageSelector';
import { FaArrowUp, FaArrowDown, FaTimes } from 'react-icons/fa'; 


export default function Index() {
    const { taxonomyData, parentCategories, flash, errors, terms,filters } = usePage().props;
  
    const [successMessage, setSuccessMessage] = useState(flash?.success);
    const [localerrors, setLocalErrors] = useState(errors);
    const [featuredImage, setFeaturedImage] = useState(null);
    const [bulkAction, setBulkAction] = useState(''); 
    const [searchFilter, setSearchFilter] = useState(filters.s || '');
    const [loading, setLoading] = useState(false); 
    const [selectedRows, setSelectedRows] = useState([]);
    const [termIds, setTermIds] = useState([]);

     // Handle search input change
     const handleSearchChange = (e) => {
        setSearchFilter(encodeURIComponent(e.target.value));
    };
    
      // Handle row selection
    const handleRowSelection = (termId) => {
        setSelectedRows((prevSelectedRows) => {
            if (prevSelectedRows.includes(termId)) {
                return prevSelectedRows.filter(id => id !== termId);
            }
            return [...prevSelectedRows, termId];
        });
        
    };

    const getAllTermIds = (terms) => {
        return terms.flatMap(term => {
            const ids = [term.id];
    
            if (term.childrens && term.childrens.length > 0) {
                const childrenIds = getAllTermIds(term.childrens);
                return [...ids, ...childrenIds]; 
            }
    
            return ids; 
        });
    };

    const handleSelectAll = (event) => {
        if(event.target.checked === false){
            setSelectedRows([]);
        }
        else{
            const allTermIds = getAllTermIds(terms);
            setSelectedRows(allTermIds);
        }
    };


     // UseForm hook initialization
     const { data, setData, post, processing, reset } = useForm({
        name: "",
        slug: "",
        description: "",
        parent_id: "", 
        attachment_id: "",
        taxonomy: taxonomyData.slug,
    });

    const insertFeaturedImage = (selectedFile) => {
        if(selectedFile){
            setFeaturedImage(selectedFile);
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
        post(route('term.store', taxonomyData.slug), {
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
        const allTermIds = getAllTermIds(terms);
        setTermIds(allTermIds);
        setLoading(false);
        setBulkAction('');
        setLocalErrors(errors || {});        
        setSuccessMessage(flash?.success || "");        
    }, [errors, flash?.success]);

    const renderTermsInTable = (terms, level = 0) => {
        return terms.map(term => (
            
            <React.Fragment key={term.id}>
                <tr className="tb-tr">
                    <td>
                        <input
                            type="checkbox"
                            checked={selectedRows.includes(term.id)}
                            onChange={() => handleRowSelection(term.id)}
                        />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                        <img 
                            src={term.attachment?.small_url || term.attachment?.thumb_url || term.attachment?.original_url || ''} 
                            alt="Term Image" 
                            style={{
                                marginTop: '12px',
                                borderRadius: '2px', 
                                objectFit: 'cover',
                            }} 
                        />
                    </td>

                    <td className="position-relative">
                        
                        <Link href={route('term.edit',  [taxonomyData.slug,term.id])} className="text-decoration-none fw-bold">
                        {level > 0 ? '- '.repeat(level) : ''}{term.name}
                        </Link>
                        <div className="action-icons ">
                            <span className="edit  ">
                                <Link href={route('term.edit', [taxonomyData.slug,term.id])} className="text-primary mx-2"  style={{ fontSize: '13px' }}>
                                    Edit
                                </Link>
                            </span>
                            | 
                            <span className="trash ms-2">
                                <Link
                                    as="button"
                                    method="delete"
                                    href={route('term.delete', [taxonomyData.slug,term.id])}
                                    className="text-danger"
                                    style={{ fontSize: '13px' }}
                                    
                                >
                                    Delete
                                </Link>

                            </span>
                        </div>
                    </td>
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
                                            `Add New ${taxonomyData.singular_name}` <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        </>
                                        
                                    ) : (
                                        `Add New ${taxonomyData.singular_name}`
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
                            <div className="row mb-3">
                                <div className="col-12 d-flex justify-content-between">
                                    {/* Bulk Actions */}
                                    <div className="d-inline-flex align-items-center me-3">
                                        <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="form-select me-2" style={{ width: '200px' }}>
                                            <option value="">Bulk Actions</option>
                                            <option value="delete">Delete</option>
                                        </select>
                                        
                                        <Link 
                                            method="post"
                                            href={route('term.bulk.delete', { taxonomy: taxonomyData.slug, ids: selectedRows.join(',') })}
                                            className="btn btn-primary" 
                                            disabled={bulkAction === '' || loading === true}
                                            onClick={() => setLoading(true)}
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ) : (
                                                'Apply'
                                            )}
                                        </Link>
                                        
                                    </div>
                                    {/* Search Field */}
                                    <div className="d-flex">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by Name"
                                            defaultValue={searchFilter}
                                            onChange={handleSearchChange}
                                        />
                                        <Link
                                            as="button"
                                            href={route('term.index', {
                                                taxonomy: taxonomyData.slug,
                                                ...filters,  
                                                s: searchFilter 
                                            })}
                                            className="btn btn-primary ms-2"
                                        >
                                            Search
                                        </Link>
                                    </div>
                                </div>
                            </div>            
                            {/* Table */}
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th style={{ width: '15px' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedRows.length > 0 && selectedRows.length === termIds.length}
                                                />
                                        </th>
                                        <th className="w-10">Icon</th>
                                        <th className="w-40">
                                            <div className="d-flex align-items-center">
                                                <span className="me-3">Name</span>

                                                <Link
                                                    
                                                    href={route('term.index', {
                                                        taxonomy: taxonomyData.slug,
                                                        ...filters,
                                                        order_by: 'asc', 
                                                        order_column: 'name'
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'name' && filters.order_by === 'asc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowUp color={filters.order_column === 'name' && filters.order_by === 'asc' ? 'black' : 'gray'} />
                                                </Link>

                                                <Link
                                                    
                                                    href={route('term.index', {
                                                        taxonomy: taxonomyData.slug,
                                                        ...filters,
                                                        order_by: 'desc', 
                                                        order_column: 'name'
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'name' && filters.order_by === 'desc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowDown color={filters.order_column === 'name' && filters.order_by === 'desc' ? 'black' : 'gray'} />
                                                </Link>
                                            </div>
                                        </th>
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
