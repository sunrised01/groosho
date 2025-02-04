import React, { useState, useRef } from "react";
import AppLayout from "@/Pages/Admin/Layouts/AppLayout";
import { Head } from "@inertiajs/react";

import { FaFileAlt, FaVideo } from "react-icons/fa";
import { MdPictureAsPdf } from "react-icons/md";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 


export default function Files({ files }) {
   

   const [uploadFiles, setUploadFiles] = useState([]);
   const [uploadProgress, setUploadProgress] = useState([]);
   const [fileList, setFileList] = useState(files); 
   const [selectedFile, setSelectedFile] = useState(null);
   const fileInputRef = useRef(null);
   const dropAreaRef = useRef(null);
   const [title, setTitle] = useState('');
   const [caption, setCaption] = useState('');
   const [description, setDescription] = useState('');

   // Handel input text change
   const handleInputChange = (event) => {
      const { name, value } = event.target; 
      switch (name) {
         case 'title':
            setTitle(value);
            break;
         case 'caption':
            setCaption(value);
            break;
         case 'description':
            setDescription(value);
            break;
         default:
            break;
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

         // On successful upload, add the uploaded file to the list
         xhr.onload = () => {
            if (xhr.status === 200) {
               const uploadedFile = JSON.parse(xhr.responseText); // Assuming the backend returns the file object after upload

               // Update the state with the newly uploaded file and sort the list in descending order
               setFileList((prevFiles) => {
                  const updatedFiles = [...prevFiles, uploadedFile];
                  // Sort the files by upload time or ID in descending order
                  return updatedFiles.sort((a, b) => b.id - a.id); // Change `id` to whatever field you use
               });

               // Reset progress for this file
               setUploadProgress((prevProgress) => {
                  const updatedProgress = prevProgress.filter((progress) => progress.file !== file.name);
                  return updatedProgress;
               });

               // Reset the file input box after uploading
               if (fileInputRef.current) {
                  fileInputRef.current.value = ''; // Clear the input value
               }
            } else {
               alert(`Error uploading ${file.name}.`);
            }
         };

         // Send the form data to the backend
         xhr.send(formData);
      });
   };

   // Open the modal with file details
   const handleImageClick = (file) => {      
      setSelectedFile(file);
      setTitle(file.title);
      setCaption(file.caption);
      setDescription(file.description);
     
   };

   // Handle file information update
   const handleUpdateFileInfo = () => {
      const data = {
         id: selectedFile.id,
         title,
         caption,
         description,
      };

      axios
         .post(route('files.update'), data)
         .then((response) => {
            toast.success(response.data.message); 
            
            setFileList((prevFiles) =>
               prevFiles.map((file) =>
                  file.id === selectedFile.id ? { ...file, title, caption, description } : file
               )
            );
         })
         .catch((error) => {
            toast.error(error); 
         });
   };

   // Handle file deletion
   const handleDeleteFile = () => {
      if (!selectedFile) return;

      

      if (window.confirm('Are you sure you want to delete this file?')) {

         axios.delete(`/admin/file/${selectedFile.id}`)
         .then((response) => {
            setFileList(fileList.filter((file) => file.id !== selectedFile.id));
            setSelectedFile(null);  
            toast.success(response.data.message); 
            console.log('File deleted successfully:', response.data);
         })
         .catch((error) => {
            toast.error(error.message); 
         });

         
      }
   };

   // Handle copying file URL to clipboard
   const handleCopyUrl = () => {
      const textField = document.createElement('textarea');
      textField.innerText = selectedFile.url;
      document.body.appendChild(textField);
      textField.select();
      document.execCommand('copy');
      document.body.removeChild(textField);
   };

   // Handle file download
   const handleDownload = () => {
      const link = document.createElement('a');
      link.href = selectedFile.url;
      link.download = selectedFile.name;
      link.click();
   };

   return (
      <AppLayout>
         <Head title="Files" />
         <ToastContainer
               position="top-right"
               autoClose={5000} // Auto-close after 5 seconds
               hideProgressBar={false}
               newestOnTop={true}
               closeOnClick={true}
               pauseOnHover={true}
         />
         <div className="row">
            <div className="col-xxl">
               <div className="card mb-12">
                  <div className="card-body">
                     {/* File Upload Section */}
                     <div className="upload-section">
                        <h5>Media Library</h5>
                        <hr/>
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
                              ref={fileInputRef} // Attach the ref to the input element
                              style={{ display: "none" }} // Hide the default file input
                           />
                           <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => fileInputRef.current.click()} // Trigger file input on button click
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

                     {/* Display Files Section */}
                     <div className="file-list mt-10">
                        <div className="row">
                           {fileList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((file) => (
                              <div key={file.id} className="col-md-2 p-5">
                                 <div className="file-card border rounded shadow-sm">
                                    <div className="file-card-body">
                                       {/* Check if the file is an image, and display a thumbnail */}
                                       {file.type.startsWith("image") ? (
                                          <div className="file-thumbnail" onClick={() => handleImageClick(file)}>
                                             <img
                                                src={file.display_url}
                                                alt={file.name}
                                                className="img-fluid rounded"
                                             />
                                          </div>
                                       ) : (
                                          <div className="file-icon fileicon" onClick={() => handleImageClick(file)}>
                                             {/* Use icons for other file types */}
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

                     {/* Modal for file information */}
                     {selectedFile && (
                        <div className="modal fade show" tabIndex="-1" style={{ display: "block" }}>
                           <div className="modal-dialog modal-right">
                              <div className="modal-content ">
                                 <div className="modal-header">
                                    <h5 className="modal-title">Attachment details</h5>
                                   
                                    <button
                                       type="button"
                                       className="btn-close"
                                       onClick={() => setSelectedFile(null)}
                                       aria-label="Close"
                                    ></button>
                                 </div>
                                 <div className="modal-body">
                                    {/* File Preview Section */}
                                    <div className="row">
                                       <div className="col-md-4">
                                       {selectedFile.type.startsWith("image") ? (
                                          <img
                                             src={selectedFile.display_url}
                                             alt={selectedFile.name}
                                             className="img-fluid rounded mb-3"
                                             style={{ maxHeight: "300px", objectFit: "contain" }}
                                          />
                                       ) : (
                                          <div className="file-icon fileicon">
                                             {/* Placeholder for non-image files (icons or file type) */}
                                             {selectedFile.type === "application/pdf" ? (
                                                <MdPictureAsPdf className="text-danger" style={{ fontSize: "40px" }} />
                                             ) : selectedFile.type.startsWith("video") ? (
                                                <FaVideo className="text-primary" style={{ fontSize: "40px" }} />
                                             ) : (
                                                <FaFileAlt className="text-secondary" style={{ fontSize: "40px" }} />
                                             )}
                                          </div>
                                       )}
                                       </div>
                                       <div className="col-md-8">
                                          <div><strong>Uploaded on:</strong> 
                                             {new Date(selectedFile.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                dmonth: 'long',
                                                day: 'numeric'
                                             })}
                                          </div>
                                          <div><strong>Uploaded by:</strong> admin</div>
                                          <div><strong>File name:</strong> {selectedFile.name}</div>
                                          <div><strong>File type:</strong> {selectedFile.type}</div>
                                          <div><strong>File size:</strong> {selectedFile.file_size}</div>
                                       </div>
                                    </div>
                                    
                                    {/* Editable Fields Section */}
                                       <div className="mt-10 mb-3">
                                          <label className="form-label">Title:</label>
                                          <input
                                             type="text"
                                             className="form-control"
                                             name="title"
                                             defaultValue={title}
                                             onChange={handleInputChange}
                                          />
                                       </div>
                                       <div className="mb-3">
                                          <label className="form-label">Caption:</label>
                                          <input
                                             type="text"
                                             className="form-control"
                                             value={caption}
                                             name="caption"
                                             onChange={handleInputChange}
                                          />
                                       </div>
                                       <div className="mb-3">
                                          <label className="form-label">Description:</label>
                                          <textarea
                                             className="form-control"
                                             value={description}
                                             onChange={handleInputChange}
                                             name="description"
                                             rows="3"
                                          ></textarea>
                                       </div>
                                    <div className="mb-3">
                                       <label className="form-label">File URL:</label>
                                       <input
                                          type="text"
                                          className="form-control"
                                          value={selectedFile.url}
                                          readOnly
                                          onClick={(e) => e.target.select()}
                                       />
                                       <button
                                          className="btn btn-outline-secondary mt-2"
                                          onClick={handleCopyUrl}
                                       >
                                          Copy URL
                                       </button>
                                    </div>
                                   
                                 </div>

                                 {/* Modal Footer Section */}
                                 <div className="modal-footer">
                                    <button
                                       type="button"
                                       className="btn btn-danger"
                                       onClick={handleDeleteFile}
                                    >
                                       Delete
                                    </button>
                                    <button
                                       type="button"
                                       className="btn btn-primary"
                                       onClick={handleUpdateFileInfo}
                                    >
                                       Update
                                    </button>
                                    <button
                                       type="button"
                                       className="btn btn-outline-primary"
                                       onClick={handleDownload}
                                    >
                                       Download
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                  </div>
               </div>
            </div>
         </div>
      </AppLayout>
   );
}
