import React, { useState, useRef } from "react";
import { toast } from 'react-toastify';

const DragAndDropFileUpload = ({ onFileUploadSuccess }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [errorFiles, setErrorFiles] = useState([]);
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);

    // Get the CSRF token from the meta tag
    const getCsrfToken = () => {
        return document.head.querySelector('meta[name="csrf-token"]').content;
    };

    // Handle the drag-over effect
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    // Handle dropping files
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        handleFileUpload(files);
    };

    // Upload files to the server with progress tracking
    const uploadMultipleFilesToServer = (files) => {
        // Clear previous upload progress before starting the new upload
        setUploadProgress([]);
        setErrorFiles([]);

        files.forEach((file, index) => {
            const formData = new FormData();
            formData.append("file", file);

            const csrfToken = getCsrfToken();  

            const xhr = new XMLHttpRequest();
            xhr.open("POST", route("files.save"), true);  
            xhr.setRequestHeader("X-CSRF-TOKEN", csrfToken);

            // Set initial progress for each file to 0
            setUploadProgress((prevProgress) => [
                ...prevProgress,
                { file: file.name, progress: 0, error: false } // Added error tracking
            ]);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress((prevProgress) => {
                        const updatedProgress = [...prevProgress];
                        updatedProgress[index] = { 
                            file: file.name, 
                            progress, 
                            error: false 
                        };
                        return updatedProgress;
                    });
                }
            };

            // Handle successful upload
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const uploadedFile = JSON.parse(xhr.responseText);  
                    setFileList((prevFiles) => {
                        const updatedFiles = [...prevFiles, uploadedFile];
                        return updatedFiles.sort((a, b) => b.id - a.id);
                    });

                    // Remove the file progress after successful upload
                    setUploadProgress((prevProgress) => {
                        const updatedProgress = prevProgress.filter(
                            (progress) => progress.file !== file.name
                        );
                        return updatedProgress;
                    });

                    // Reset the file input after upload
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                } else {
                    const response = JSON.parse(xhr.response); 
                    const errors = response.errors.file;
                    errors.forEach((error, index) => {
                        toast.error(error);
                    });

                    // Mark this file as having an error
                    setUploadProgress((prevProgress) => {
                        const updatedProgress = [...prevProgress];
                        updatedProgress[index] = {
                            ...updatedProgress[index],
                            error: true
                        };
                        return updatedProgress;
                    });
                }
            };

            xhr.send(formData);
        });
    };

    // Handle file upload trigger
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (selectedFiles.length > 0) {
           uploadMultipleFilesToServer(selectedFiles);
        }
    };

    return (
        <div>
            <div
                ref={dropAreaRef}
                className={`drop-area ${isDragOver ? "drag-over" : ""}`}
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

            <div className="prograss-bar mt-5">
                {uploadProgress.length > 0 && (
                    <div>
                        {uploadProgress.map((fileProgress, index) => (
                            <div key={index} className="progress-wrapper">
                                <p>{fileProgress.file}</p>
                                <div className="progress">
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ 
                                            width: `${fileProgress.progress}%`, 
                                            backgroundColor: fileProgress.error ? 'red' : 'green' // Set to red if error
                                        }}
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
    );
};

export default DragAndDropFileUpload;
