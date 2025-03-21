import React, { useEffect, useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import TextEditor from '@/Components/TextEditor';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FaChevronDown, FaChevronUp, FaEye, FaMapPin, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AttachmentSelector from '@/Components/Admin/AttachmentSelector';
import { FaTimes } from 'react-icons/fa'; 


export default function Create() {
    const { postType, errors, formData, users } = usePage().props;
    const current_user = usePage().props.auth.user;
    const [featuredImage, setFeaturedImage] = useState(null);
    const [localErrors, setLocalErrors] = useState({});
    const [activeSections, setActiveSections] = useState({
        'sb-publish': true,
        'sb-featured': true,
    });
    const [isOpenStatusBox, setIsOpenStatusBox] = useState(false);
    const [isOpenVisibilityBox, setIsOpenVisibilityBox] = useState(false);
    
    // UseForm hook initialization
    const { data, setData, post, processing, reset } = useForm({
        title: formData?.title || "",
        slug: formData?.slug || "",
        content: formData?.content || "",
        parent_id: formData?.parent_id || "", 
        attachment_id: formData?.attachment_id || "", 
        status: formData?.status || "publish", 
        visibility: formData?.visibility || 'public',
        author_id: formData?.author_id || current_user.id, 
    });

    const [visibility, setVisibility] = useState(data.visibility);
    const [status, setStatus] = useState(data.status);

    const handleVisibilityChange = (e) => {
        const { value } = e.target;
        setVisibility(value)
    }

    const updateVisibility = () => {
        if(visibility === 'protected' && data.password == ''){
            toast.error("The password field is mandatory if the visibility is set to 'protected'.");
        }
        else{
            setData('visibility', visibility);
            setIsOpenVisibilityBox(false);
        }
       
    }

    // Toggle a specific section's state (open/close)
    const toggleItem = (index) => {
        setActiveSections(prevState => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('post.store', postType.slug), {
            onFinish: () => {
                // Optional reset logic (currently commented out)
                // reset();
            },
        });
    };

    // Effect to update errors when they change
    useEffect(() => {
        setLocalErrors(errors);
    }, [errors]);

    const removeError = (key) => {
        const newErrors = { ...localErrors };
        delete newErrors[key];
        setLocalErrors(newErrors);
    };

    const openStatusBox = () => {
        setIsOpenStatusBox(true);
    };
    const handleStatusChange = (e) => {
        const { value } = e.target;
        setStatus(value)
    }
    const updateStatus = () => {
        setIsOpenStatusBox(false);
        setData('status', status);
    };

    const openVisibilityBox = () => {
        setIsOpenVisibilityBox(true);
    };

    const insertFeaturedImage = (selectedFile) => {
       
        if(selectedFile){
            const file_url = selectedFile.attachments.featured_url
            ? selectedFile.attachments.featured_url
            : selectedFile.attachments.featured_url
            ? selectedFile.attachments.thumbnail_url
            : selectedFile.attachments.original_url

            console.log(file_url);
   
            setFeaturedImage(file_url);
            setData('attachment_id', selectedFile.id);
        }
     }

    const handleDeleteImage = () => {
        setFeaturedImage(null);  
        setData('attachment_id', "");

    };
  
    return (
        <AppLayout>
            <Head title={`Add ${postType.singular_name}`} />
            {/* Page Header Section */}
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Create New {postType.slug}</h2>
                </div>
            </div>

            {/* Display Error Messages */}
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

            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="row mb-4">
                    <div className="col-8">
                        {/* Form Section to Create Post Type */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card mb-4">
                                    <div className="card-body">
                                        {/* Title Input Field */}
                                        <div className="">
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                placeholder="Add Title"
                                                className="form-control"
                                                value={data.title}
                                                onChange={handleChange}
                                            />
                                           
                                        </div>
                                    </div>
                                </div>
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <div className="form-fields">
                                            <TextEditor />
                                        </div>
                                    </div>
                                </div>
                                <div className="card mb-4">
                                    <div className="card-body">
                                        {/* Author Dropdown */}
                                        <div className="mb-3">
                                            <label htmlFor="author_id" className="form-label">Author</label>
                                            <select
                                                id="author_id"
                                                name="author_id"
                                                className="form-control"
                                                value={data.author_id}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Author</option>
                                                {users && users.map(author => (
                                                    <option key={author.id} value={author.id}>
                                                        {author.name}
                                                    </option>
                                                ))}
                                            </select>
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
                                        <hr className="m-0" />
                                        {activeSections["sb-publish"] && (
                                            <div className="accordion-content">
                                                <div className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="d-flex justify-content-between align-items-center"><FaMapPin className="me-2" />Current Status: <b className="text-capitalize ms-1">{data.status}</b></span>
                                                        {!isOpenStatusBox && (
                                                            <button className="btn btn-link" onClick={openStatusBox}>
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>

                                                    {isOpenStatusBox && (
                                                        <div className="d-flex justify-content-between mt-3">
                                                            <select
                                                                className="form-select"
                                                                value={status}
                                                                onChange={handleStatusChange}
                                                                name="status"
                                                            >
                                                                <option value="publish">Publish</option>
                                                                <option value="draft">Draft</option>
                                                            </select>
                                                            <button className="btn btn-outline-primary ms-2" onClick={updateStatus}>
                                                                Ok
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="d-flex justify-content-between align-items-center"><FaEye className="me-2" />Visibility: <b className="text-capitalize ms-1">{data.visibility}</b></span>
                                                        {!isOpenVisibilityBox && (
                                                            <button className="btn btn-link" onClick={openVisibilityBox}>
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                    {isOpenVisibilityBox && (
                                                        <>
                                                            <div className="d-flex justify-content-between mt-3">
                                                                <select
                                                                    className="form-select"
                                                                    value={visibility}
                                                                    onChange={handleVisibilityChange}
                                                                    name="visibility"
                                                                >
                                                                    <option value="public">Public</option>
                                                                    <option value="private">Private</option>
                                                                    <option value="protected">Protected</option>
                                                                </select>
                                                                <button type="button" className="btn btn-outline-primary ms-2" onClick={updateVisibility}> 
                                                                    Ok
                                                                </button>
                                                            </div>
                                                            {visibility == 'protected' && 
                                                            <div className="mt-3 mb-3">
                                                                <label htmlFor="password" className="form-label">Enter Password</label>
                                                                <input

                                                                type="password"
                                                                id="password"
                                                                name="password"
                                                                className="form-control"
                                                                value={data.password}
                                                                onChange={handleChange}
                                                                />
                                                            </div>
                                                            }
                                                        </>
                                                    )}
                                                </div>
                                                <div className="p-3 mt-5 pt-3 border-top bg-light">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div></div>
                                                        {/* Submit Button */}
                                                        <button type="submit" className="btn btn-outline-primary" disabled={processing}>
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

                            <div className="card mb-4">
                                <div className="card-body p-0">
                                    <div key="sb-featured" className="accordion-item m-0">
                                        <div className="accordion-header d-flex justify-content-between align-items-center p-3" onClick={() => toggleItem("sb-featured")}>
                                            <h3>Featured Image</h3>
                                            {activeSections["sb-featured"] ? (
                                                <FaChevronUp className="ms-2" />
                                            ) : (
                                                <FaChevronDown className="ms-2" />
                                            )}
                                        </div>
                                        <hr className="m-0" />
                                        {activeSections["sb-featured"] && (
                                            <div className="accordion-content d-flex justify-content-center p-3">
                                                {featuredImage ? (
                                                    <div className="mb-3">
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <img 
                                                                src={featuredImage} 
                                                                alt="Featured Preview" 
                                                                style={{
                                                                    border: '1px solid rgb(34, 113, 177)',
                                                                    width: '300px',
                                                                    height: '300px',
                                                                    borderRadius: '4px',
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
                                                        <AttachmentSelector onImageSelect={insertFeaturedImage} buttonname="Select Featured Image" filetype="image" />
                                                    </div>
                                                )}                                          
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