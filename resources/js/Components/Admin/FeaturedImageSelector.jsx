import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaFileAlt, FaVideo } from "react-icons/fa";
import { MdPictureAsPdf } from "react-icons/md";



const FeaturedImageSelector = ({ onImageSelect }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');
    const [files, setFiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadFiles, setUploadFiles] = useState([]);


    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [errorFiles, setErrorFiles] = useState([]);
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);

    const toggleModal = () => setIsOpen(!isOpen);

    // Function to handle tab switching
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'media' && files.length === 0) {
            fetchFiles();
        }
    };

    // Fetch files from the backend (Laravel)
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('files.fetch'), {
                params: {
                    page: currentPage,
                }
            });
            setFiles((prevFiles) => [...prevFiles, ...response.data.files]);
            setCurrentPage(response.data.pagination.current_page);
            setLastPage(response.data.pagination.last_page);

        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };


    // Handel Load More button function
    const handleLoadMore = () => {
        if (currentPage < lastPage) {
            setCurrentPage((prevPage) => prevPage + 1); // Go to the next page
        }
    };


    // Handle file change (on file selection) and trigger upload
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setUploadFiles(selectedFiles);
        if (selectedFiles.length > 0) {
            uploadMultipleFilesToServer(selectedFiles);
        }
    };

    // Handle file drop event
    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        setUploadFiles(droppedFiles);
        if (droppedFiles.length > 0) {
            uploadMultipleFilesToServer(droppedFiles);
        }
    };

    // Handle drag over event to prevent default behavior
    const handleDragOver = (event) => {
        event.preventDefault();
        if (dropAreaRef.current) {
            dropAreaRef.current.classList.add('drag-over');
        }
    };

    // Handle drag leave event to remove the "drag-over" style
    const handleDragLeave = () => {
        if (dropAreaRef.current) {
            dropAreaRef.current.classList.remove('drag-over');
        }
    };

    // Get the CSRF token from the meta tag
    const getCsrfToken = () => {
        return document.head.querySelector('meta[name="csrf-token"]').content;
    };

    // Handle multiple file upload
    const uploadMultipleFilesToServer = (files) => {
        files.forEach((file, index) => {
            const formData = new FormData();
            formData.append("file", file);

            const csrfToken = getCsrfToken();

            const xhr = new XMLHttpRequest();
            xhr.open("POST", route("files.save"), true);

            xhr.setRequestHeader("X-CSRF-TOKEN", csrfToken);

            setUploadProgress((prevProgress) => [
                ...prevProgress,
                { file: file.name, progress: 0 }
            ]);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress((prevProgress) => {
                        const updatedProgress = [...prevProgress];
                        updatedProgress[index] = { file: file.name, progress };
                        return updatedProgress;
                    });
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const uploadedFile = JSON.parse(xhr.responseText);
                    setFileList((prevFiles) => {
                        const updatedFiles = [...prevFiles, uploadedFile];
                        return updatedFiles.sort((a, b) => b.id - a.id);
                    });

                    setUploadProgress((prevProgress) => {
                        const updatedProgress = prevProgress.filter((progress) => progress.file !== file.name);
                        return updatedProgress;
                    });

                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                } else {
                    alert(`Error uploading ${file.name}.`);
                }
            };

            xhr.send(formData);
        });
    };

    console.log(uploadProgress);

    return (
        <div>
            <button className="btn btn-outline-secondary" onClick={toggleModal}>
                Select Featured Image
            </button>

            {/* Popup modal */}
            {isOpen && (
                <div className="modal fade show" id="fullscreenModal" tabIndex="-1" aria-modal="true" role="dialog">
                    <div className="modal-dialog modal-fullscreen" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalFullTitle">Featured image</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={toggleModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                {/* Tab Navigation */}
                                <ul className="nav nav-tabs">
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('upload')}
                                        >
                                            Upload Files
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link ${activeTab === 'media' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('media')}
                                        >
                                            Media Library
                                        </button>
                                    </li>
                                </ul>

                                {/* Tab Content */}
                                <div className="tab-content" id="myTabContent">
                                    <div
                                        className={`tab-pane fade ${activeTab === 'upload' ? 'show active' : ''}`}
                                        id="tab1"
                                        role="tabpanel"
                                    >
                                        <div className="upload-section">
                                            <div
                                            ref={dropAreaRef}
                                            className="drop-area"
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            >
                                            <p>Drag & Drop your files here or click to select</p>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="*/*"
                                                multiple
                                                ref={fileInputRef} 
                                                style={{ display: "none" }} 
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => fileInputRef.current.click()} 
                                            >
                                                Choose Files
                                            </button>
                                            </div>

                                            {/* Display progress for each file */}
                                            {uploadProgress.length > 0 && (
                                            <div>
                                                {uploadProgress.map((fileProgress, index) => (
                                                    <div key={index} className="progress-wrapper">
                                                        <p>{fileProgress.file}</p>
                                                        <div className="progress">
                                                        <div
                                                            className="progress-bar"
                                                            role="progressbar"
                                                            style={{ width: `${fileProgress.progress}%` }}
                                                        >
                                                            {fileProgress.progress}%
                                                        </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            )}
                                        </div>

                                    </div>
                                    <div
                                        className={`tab-pane fade ${activeTab === 'media' ? 'show active' : ''}`}
                                        id="tab2"
                                        role="tabpanel"
                                    >
                                        <div className="file-list mt-10">
                                            <div className="row">
                                                {files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((file) => (
                                                    <div key={file.id} className="col-cmd-2 p-5">
                                                        <div className="file-card border rounded shadow-sm">
                                                            <div className="file-card-body">

                                                                {file.type.startsWith("image") ? (
                                                                    <div className="file-thumbnail" >
                                                                        <img
                                                                            src={file.display_url}
                                                                            alt={file.name}
                                                                            className="img-fluid rounded"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="file-icon fileicon" >

                                                                        {file.type === "application/pdf" ? (
                                                                            <MdPictureAsPdf className="text-danger" style={{ fontSize: '40px' }} />
                                                                        ) : file.type.startsWith("video") ? (
                                                                            <FaVideo className="text-primary" style={{ fontSize: '40px' }} />
                                                                        ) : (
                                                                            <FaFileAlt className="text-secondary" style={{ fontSize: '40px' }} />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Load More Button */}
                                        <div className="load-more text-center mt-5 ">
                                            {currentPage < lastPage && (
                                                <button
                                                    onClick={handleLoadMore}
                                                    disabled={loading}
                                                    className="btn btn-primary"
                                                >
                                                    {loading ? 'Loading...' : 'Load More'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">

                                <button type="button" className="btn btn-primary">
                                    Insert
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
};

export default FeaturedImageSelector;