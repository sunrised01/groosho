import React, { useEffect, useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import TextEditor from '@/Components/TextEditor';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { FaChevronDown, FaChevronUp, FaEye, FaMapPin, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AttachmentSelector from '@/Components/Admin/AttachmentSelector';
import { FaTimes } from 'react-icons/fa'; 
import { AiFillEdit } from 'react-icons/ai';  
import { Inertia } from '@inertiajs/inertia';  


export default function Create() {
    const { postType, post, errors, users } = usePage().props;
    const current_user = usePage().props.auth.user;
    const [featuredImage, setFeaturedImage] = useState(
        post.attachment && post.attachment.thumbnail_url 
          ? post.attachment.featured_url 
          : post.attachment && post.attachment.original_url
      );

    const [isEditing, setIsEditing] = useState(false);
    const [postSlug, setPostSlug] = useState(post.slug);
      
    const [localErrors, setLocalErrors] = useState({});
    const [activeSections, setActiveSections] = useState({
        'sb-publish': true,
        'sb-featured': true,
    });
    const [isOpenStatusBox, setIsOpenStatusBox] = useState(false);
    const [isOpenVisibilityBox, setIsOpenVisibilityBox] = useState(false);
    
    // UseForm hook initialization
    const { data, setData, put, processing, reset } = useForm({
        title: post?.title || "",
        slug: post?.slug || "",
        content: post?.content || "",
        parent_id: post?.parent_id || "", 
        attachment_id: post?.attachment_id || "", 
        status: post?.status || "publish", 
        visibility: post?.visibility || 'public',
        author_id: post?.author_id || current_user.id, 
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
        put(route('post.update', [postType.slug, post.id]), {
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

    // Handle the pencil icon click to toggle the edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle the OK button click to save the new slug
  const handleOkClick = () => {
    setData(postSlug)
    setIsEditing(false);
    handleSubmit();
  };

  
    return (
        <AppLayout>
            <Head title={`Edit ${postType.singular_name}`} />
            {/* Page Header Section */}
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Create New {postType.slug}</h2>
                    <Link className="btn btn-outline-primary" href={post.url}>View {postType.singular_name}</Link>
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
                                            <div className="permalink-wrapper mt-2">
                                                <div className=" d-flex align-items-center">URL: 
                                                    <Link className="btn-link" href={post.url}>{post.url}</Link>
                                                    {!isEditing && (
                                                        <AiFillEdit
                                                            style={{ cursor: 'pointer', marginLeft: '10px' }}  
                                                            onClick={handleEditClick} 
                                                        />
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    {isEditing && (
                                                        <div className="d-flex justify-align-between align-items-center">
                                                            <input 
                                                                type="text" 
                                                                value={postSlug} 
                                                                onChange={(e) => setPostSlug(e.target.value)} 
                                                                placeholder="Enter Slug"
                                                                className="form-control" 
                                                            />
                                                            <button className="btn btn-outline-primary ms-3" onClick={handleOkClick}>Save</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
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
                                                <div className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="d-flex justify-content-between align-items-center"><FaCalendar className="me-2" />Publish at: <b className="text-capitalize ms-1">
                                                        {new Intl.DateTimeFormat('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                            hour12: true, // Optional: for 12-hour format (AM/PM)
                                                        }).format(new Date(post.created_at))}
                                                        </b></span>
                                                        
                                                    </div>
                                                </div>
                                                <div className="p-3 mt-5 pt-3 border-top bg-light">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                    <div className="trash-btn">
                                                            
                                                        <Link
                                                            as="button"
                                                            method="put"
                                                            href={route('post.update.status', [post.post_type, post.id, 'trash'])}
                                                            className="text-danger"
                                                            style={{ fontSize: '13px' }}
                                                            
                                                        >
                                                            Move to Trash
                                                        </Link>

                                                        </div>
                                                        {/* Submit Button */}
                                                        <button type="submit" className="btn btn-outline-primary" disabled={processing}>
                                                            {processing ? (
                                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            ) : (
                                                                "Update"
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