import React, { useEffect, useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { FaChevronDown, FaChevronUp, FaEye, FaMapPin, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Edit({ taxonomy, errors, users, postTypes }) {

      // Check if the taxonomy is in the trash
      const isInTrash = taxonomy?.status === 'trash';

      // If taxonomy is in trash, return blank page with an error message
      if (isInTrash) {
          return (
              <AppLayout>
                  <Head title="Edit Taxonomy" />
                  
                        <div className="row">
                            <div className="col-12">
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <div className="container text-center mt-5">
                                            <h2 className="text-danger">This taxonomy no longer exists.</h2>
                                            <p className="text-muted">It has been moved to trash and is no longer available for editing.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                 
              </AppLayout>
          );
      }

    const [localErrors, setLocalErrors] = useState({});
    const current_user = usePage().props.auth.user;
    const [activeSections, setActiveSections] = useState({
        'sb-publish': true,
    });
    const [isOpenStatusBox, setIsOpenStatusBox] = useState(false);
    const [isOpenVisibilityBox, setIsOpenVisibilityBox] = useState(false);
    
    const { flash } = usePage().props;
   
    const successMessage = flash.success;
    const erroeMessage = flash.error;

    // Initialize the form using Inertia's useForm hook with the existing taxonomy data
    const { data, setData, post, processing, reset } = useForm({
        title: taxonomy?.title || "",
        slug: taxonomy?.slug || "",
        singular_name: taxonomy?.singular_name || "",
        description: taxonomy?.description || "",
        status: taxonomy?.status || "publish", 
        visibility: taxonomy?.visibility || 'public',
        post_type: taxonomy.post_types[0]?.id || "",
        author_id: taxonomy?.author || current_user.id, 
        password: taxonomy?.password || "", 
    });

    const [visibility, setVisibility] = useState(data.visibility);
    const [status, setStatus] = useState(data.status);


    const handleVisibilityChange = (e) => {
        const { value } = e.target;
        setVisibility(value);
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
        const { name, value, type, checked } = e.target;

        if(name === "slug"){
            setData(name, value.toLowerCase());
        } else {
            setData(name, value);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        post(route('taxonomy.update', taxonomy.id), { 
            onFinish: () => {
                // Optional callback after submission finishes, such as resetting form data
            }
        });
    };

    // Effect hook to handle errors and success messages
    useEffect(() => {
        setLocalErrors(errors); 
        if (successMessage) {
            toast.success(successMessage); 
        }
        
        if (erroeMessage) {
            toast.error(erroeMessage); 
        }

    }, [errors, successMessage, erroeMessage]); 


    // Function to remove a specific error message
    const removeError = (key) => {
        const newErrors = { ...localErrors }; 
        delete newErrors[key];
        setLocalErrors(newErrors);
    };

    const handleStatusChange = (e) => {
        const { value } = e.target;
        setStatus(value)
    }


    const openStatusBox = () => {
        setIsOpenStatusBox(true);
    };

    const updateStatus = () => {
        setIsOpenStatusBox(false);
        setData('status', status);
    };


    const openVisibilityBox = () => {
        setIsOpenVisibilityBox(true);
    };

    return (
        <AppLayout>
            <Head title="Edit Taxonomy" />
            {/* Page header */}
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Edit Taxonomy</h2>
                    <Link href={route('taxonomy.create')} className="btn btn-outline-primary">Add New Taxonomy</Link>
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

            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="row mb-4">
                    <div className="col-8">
                        {/* Form Section to Create Taxonomy */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card mb-4">
                                    <div className="card-body">
                                        {/* Title Input Field */}
                                        <div className="">
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
                                                Name of the taxonomy shown in the menu (usually plural).
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <div className="form-fields">
                                            
                                            {/* Taxonomy Name Input Field */}
                                            <div className="mb-3">
                                                <label htmlFor="slug" className="form-label">
                                                    Taxonomy Name (Slug)<span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="slug"
                                                    name="slug"
                                                    className="form-control"
                                                    value={data.slug}
                                                    onChange={handleChange}
                                                />
                                                <small className="form-text text-muted">
                                                    Must not exceed 20 characters and may only contain lowercase alphanumeric characters, dashes, and underscores.
                                                </small>
                                            </div>

                                            {/* Singular Name Input Field */}
                                            <div className="mb-3">
                                                <label htmlFor="singular_name" className="form-label">Singular Name<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    id="singular_name"
                                                    name="singular_name"
                                                    className="form-control"
                                                    value={data.singular_name}
                                                    onChange={handleChange}
                                                />
                                                <small className="form-text text-muted">
                                                    Name for one object of this taxonomy.
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
                                                    A short descriptive summary of what the taxonomy is.
                                                </small>
                                            </div>

                                            {/* Post Type */}
                                            <div className="mb-3">
                                                <label htmlFor="post_type" className="form-label">Post Type</label>
                                                <select
                                                    id="post_type"
                                                    name="post_type"
                                                    className="form-control"
                                                    value={data.post_type}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Post Type</option>
                                                    {postTypes && postTypes.map(postType => (
                                                        <option key={postType.id} value={postType.id}>
                                                            {postType.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            
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
                                                        <div className="trash-btn">
                                                            
                                                            <Link
                                                            as="button"
                                                            method="put"
                                                            href={route('taxonomy.update.status', [taxonomy.id, 'trash'])}
                                                            className="text-danger"
                                                            style={{ fontSize: '13px' }}
                                                            
                                                        >
                                                            Move to Trash
                                                        </Link>

                                                        </div>
                                                        {/* Submit Button */}
                                                        <button type="submit" className="btn btn-primary" disabled={processing}>
                                                            {processing ? (
                                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            ) : (
                                                                'Update'
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
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
