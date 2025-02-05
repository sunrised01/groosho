import React, { useState, useRef } from "react";
import axios from "axios";

const DragAndDropFileUpload = ({ onFileUploadSuccess }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);
    const [fileList, setFileList] = useState([]); 

    // onFileUploadSuccess(response.data.files);

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
        files.forEach((file, index) => {
            const formData = new FormData();
            formData.append("file", file);

            const csrfToken = getCsrfToken();  // Get CSRF token

            const xhr = new XMLHttpRequest();
            xhr.open("POST", route("files.save"), true);  // Modify the route to your actual endpoint

            xhr.setRequestHeader("X-CSRF-TOKEN", csrfToken);

            // Set initial progress to 0 for each file
            setUploadProgress((prevProgress) => [
                ...prevProgress,
                { file: file.name, progress: 0 }
            ]);

            // Track progress
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

            // Handle successful upload
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const uploadedFile = JSON.parse(xhr.responseText);  // Get the uploaded file data from response

                    // Add the uploaded file to the file list and sort it
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
                    alert(`Error uploading ${file.name}.`);
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

            {isUploading && <p>Uploading...</p>}
            {errorMessage && <p className="text-danger">{errorMessage}</p>}

            <div>
                {uploadProgress.length > 0 && (
                    <ul>
                        {uploadProgress.map((fileProgress, index) => (
                            <li key={index}>
                                <span>{fileProgress.file}</span> - {fileProgress.progress}% 
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DragAndDropFileUpload;
