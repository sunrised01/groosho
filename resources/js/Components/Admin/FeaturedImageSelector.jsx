import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { FaFileAlt, FaVideo } from "react-icons/fa";
import { MdPictureAsPdf } from "react-icons/md";
import DragAndDropFileUpload from "@/Components/DragAndDropFileUpload";


const FeaturedImageSelector = ({ onImageSelect }) => {
    
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('upload'); 
    const [files, setFiles] = useState([]);  
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(''); 
    const [loading, setLoading] = useState(false); 
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleFileUploadSuccess = (files) => {
        // Update the state with the uploaded files
        setUploadedFiles(files);
    };

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
        }finally {
            setLoading(false);
        }
    };

    // Fetch files when the component mounts or when the page changes
    useEffect(() => {
        fetchFiles();
    }, [currentPage]); 
    // Handel Load More button function

    const handleLoadMore = () => {
        if (currentPage < lastPage) {
            setCurrentPage((prevPage) => prevPage + 1); // Go to the next page
        }
    };

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
                                        <DragAndDropFileUpload onFileUploadSuccess={handleFileUploadSuccess} />

                                        {uploadedFiles.length > 0 && (
                                            <div>
                                                <h3>Uploaded Files</h3>
                                                <ul>
                                                    {uploadedFiles.map((file) => (
                                                        <li key={file.id}>
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                                {file.name}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

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