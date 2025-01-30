import React, { useState, useEffect } from "react";
import AppLayout from "@/Pages/Admin/Layouts/AppLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";

export default function Files() {
  const [files, setFiles] = useState([]);  // Store files from the server
  const [uploadFiles, setUploadFiles] = useState([]);  // Store selected files for upload
  const [uploadProgress, setUploadProgress] = useState([]);  // Track progress for each file

  // Fetch files from the server
  useEffect(() => {
    axios.get("/api/files")
      .then((response) => {
        setFiles(response.data.files);
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
      });
  }, []);

  // Handle file change (on file selection) and trigger upload
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);  // Convert the file list to an array
    setUploadFiles(selectedFiles);  // Update the state with the selected files
    if (selectedFiles.length > 0) {
      uploadMultipleFilesToServer(selectedFiles);  // Automatically upload the files when selected
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

      const csrfToken = getCsrfToken();  // Get CSRF token

      // Create a new instance of XMLHttpRequest to upload the file with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open("POST", route("files.save"), true);  // Ensure this route matches your backend route

      // Set CSRF token in request header
      xhr.setRequestHeader("X-CSRF-TOKEN", csrfToken);

      // Initialize progress for the new file
      setUploadProgress((prevProgress) => [
        ...prevProgress,
        { file: file.name, progress: 0 }
      ]);

      // Listen for progress events to update progress bar
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          // Update progress for the current file
          setUploadProgress((prevProgress) => {
            const updatedProgress = [...prevProgress];
            updatedProgress[index] = { file: file.name, progress };
            return updatedProgress;
          });
        }
      };

      // On successful upload, fetch the updated list of files
      xhr.onload = () => {
        if (xhr.status === 200) {
          alert(`${file.name} uploaded successfully!`);
          // Re-fetch files after successful upload
          axios.get("/api/files").then((response) => {
            setFiles(response.data.files);
          });
        } else {
          alert(`Error uploading ${file.name}.`);
        }
      };

      // Send the form data to the backend
      xhr.send(formData);
    });
  };

  return (
    <AppLayout>
      <Head title="Files" />
      <div className="row">
        <div className="col-xxl">
          <div className="card mb-12">
            <div className="card-body">
              {/* File Upload Section */}
              <div className="upload-section">
                <h5>Upload Media Files</h5>
                <div className="form-group">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf"
                    multiple
                  />
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

              {/* Display Files Section */}
              <div className="file-list">
                <h5>Uploaded Files</h5>
                <div className="row">
                  {files.map((file) => (
                    <div key={file.id} className="col-md-3 mb-3">
                      <div className="file-card">
                        {/* Check if the file is an image, and display accordingly */}
                        {file.type.startsWith("image") ? (
                          <img
                            src={`/storage/${file.path}`}
                            alt={file.name}
                            className="img-fluid"
                          />
                        ) : (
                          <p>{file.name}</p>
                        )}

                        {/* Download link */}
                        <a
                          href={`/storage/${file.path}`}
                          download
                          className="btn btn-link"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
