import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaFileAlt, FaVideo, FaCamera } from "react-icons/fa";
import { MdPictureAsPdf, MdCheckCircle } from "react-icons/md";



const AttachmentSelector = ({ onImageSelect, icon, buttonname, filetype, classname }) => {

   const [isOpen, setIsOpen] = useState(false);
   const [activeTab, setActiveTab] = useState('upload');
   const [files, setFiles] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [lastPage, setLastPage] = useState('');
   const [loading, setLoading] = useState(false);
   const [totalUploadFiels, setTotalUploadFiels] = useState(0);
   const [selectedFile, setSelectedFile] = useState(null);
   const [uploadProgress, setUploadProgress] = useState([]);
   const [errorFiles, setErrorFiles] = useState([]);
   const fileInputRef = useRef(null);
   const dropAreaRef = useRef(null);

   const toggleModal = () => {
      setIsOpen(!isOpen);
      setSelectedFile(null);
   }


   // Function to handle tab switching
   const handleTabChange = (tab) => {
      setActiveTab(tab);
      if (tab === 'media' && files.length === 0) {
         fetchFiles(1);
      }
   };

   // Fetch files from the backend (Laravel)
   const fetchFiles = async (page) => {
      setLoading(true);
      try {
         const response = await axios.get(route('files.fetch'), {
            params: {
               page: page,
               filetype: filetype,
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
         fetchFiles(currentPage+1);
      }
   };


   // Handle file change (on file selection) and trigger upload
   const handleFileChange = (event) => {
      const uploadedFiles = Array.from(event.target.files);
      if (uploadedFiles.length > 0) {
         uploadMultipleFilesToServer(uploadedFiles);
      }
   };

   // Handle file drop event
   const handleDrop = (event) => {
      event.preventDefault();
      const droppedFiles = Array.from(event.dataTransfer.files);
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

   const uploadMultipleFilesToServer = (uploadFiles) => {
      setTotalUploadFiels(uploadFiles.length);
      handleTabChange('media');
      setUploadProgress(new Array(uploadFiles.length).fill({ progress: 0, uploaded: 0 }));

      uploadFiles.reduce((prevRequest, file, index) => {
         return prevRequest.then(() => {
            return new Promise((resolve, reject) => {
               const formData = new FormData();
               formData.append("file", file);
               const csrfToken = getCsrfToken();

               const xhr = new XMLHttpRequest();
               xhr.open("POST", route("files.save"), true);
               xhr.setRequestHeader("X-CSRF-TOKEN", csrfToken);

               // Track the upload progress
               xhr.upload.onprogress = (event) => {
                  if (event.lengthComputable) {
                     const progress = Math.round((event.loaded / event.total) * 100);
                     setUploadProgress((prevProgress) => {
                        const updatedProgress = [...prevProgress];
                        updatedProgress[index] = { progress, uploaded: 0 };
                        return updatedProgress;
                     });
                  }
               };

               // Handle the response after the request is finished
               xhr.onload = () => {
                  if (xhr.status >= 200 && xhr.status < 300) {

                     setUploadProgress((prevProgress) => {
                        const updatedProgress = [...prevProgress];
                        updatedProgress[index] = { progress: 100, uploaded: 1 };
                        return updatedProgress;
                     });


                     const uploadedFile = JSON.parse(xhr.responseText);
                     uploadedFile['uploaded'] = 1;
                     setFiles((prevFiles) => {
                        const updatedFiles = [...prevFiles, uploadedFile];
                        return updatedFiles.sort((a, b) => b.id - a.id);
                     });

                     resolve();
                  } else {
                     resolve();
                  }
               };

               xhr.onerror = () => reject(new Error("Request failed"));
               xhr.send(formData);
            });
         });
      }, Promise.resolve())
         .then(() => {
            setUploadProgress([]);
            setTotalUploadFiels(0);
            console.log('All files uploaded successfully.');
         })
         .catch((error) => {
            console.error('Error uploading files:', error);
         });
   };

   const handleImageClick = (filedata) => {
      setSelectedFile(filedata);
     
   };
 
   const handleCopyUrl = () => {
      const textField = document.createElement('textarea');
      textField.innerText = selectedFile.url;
      document.body.appendChild(textField);
      textField.select();
      document.execCommand('copy');
      document.body.removeChild(textField);
   };

   const handelmageSelect = () => {
      onImageSelect(selectedFile);
      setIsOpen(false);
   };

   

   useEffect(() => {
      setSelectedFile(null);
      if (files.length > 0) {
         const sortedFiles = [...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
         const uploadedFiles = sortedFiles.filter(file => file.uploaded === 1);
       
         if (uploadedFiles.length > 0) {
            setSelectedFile(uploadedFiles[0]);
         }
      }
   }, [files]);

   //console.log(currentPage);
   return (
      <div> 
         <button type="button" className={classname ? classname : 'btn btn-outline-primary'} onClick={toggleModal}>
            <span className="me-2">{icon ? <FaCamera /> : ''}</span>
            {buttonname ? buttonname : 'Select Featured Image'}
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
                              type="button" 
                                 className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
                                 onClick={() => handleTabChange('upload')}
                              >
                                 Upload Files
                              </button>
                           </li>
                           <li className="nav-item" role="presentation">
                              <button 
                              type="button" 
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
                                       accept={
                                          filetype === 'image'
                                            ? 'image/*'  
                                            : filetype === 'video'
                                            ? 'video/*'  
                                            : '*/*'      
                                        }
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
                              </div>

                           </div>
                           <div
                              className={`tab-pane fade ${activeTab === 'media' ? 'show active' : ''}`}
                              id="tab2"
                              role="tabpanel"
                           >
                              <div className="row">
                                 <div className="col-md-9">
                                    <div className="file-list mt-10">
                                       <div className="row">
                                          {
                                             totalUploadFiels > 0 &&
                                             (() => {
                                                const fileCards = [];
                                                for (let i = 0; i < totalUploadFiels; i++) {
                                                   if (uploadProgress[i].uploaded === 0) {
                                                      fileCards.push(
                                                         <div key={i} className="col-cmd-2 p-5 progress-wrapp">
                                                            <div className="file-card border rounded shadow-sm">
                                                               <div className="progress-wrapper">
                                                                  <div className="progress">
                                                                     <div
                                                                        className="progress-bar"
                                                                        role="progressbar"
                                                                        style={{ width: `${uploadProgress[i].progress}%` }}
                                                                     >
                                                                        {uploadProgress[i].progress}%
                                                                     </div>
                                                                  </div>
                                                               </div>
                                                            </div>
                                                         </div>
                                                      );
                                                   }
                                                }
                                                return fileCards;
                                             })()
                                          }

                                          {files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((file, index) => (

                                             <div
                                                key={`${file.id}-${index}`}
                                                className={`col-cmd-2 p-5`}
                                             >

                                                <div className={`file-card border rounded shadow-sm position-relative ${selectedFile && selectedFile.id === file.id ? 'border-primary selected' : ''}`}>

                                                   {selectedFile && selectedFile.id === file.id && (

                                                      <div className="position-absolute top-0 end-0 m-2">
                                                         <MdCheckCircle className="text-primary" style={{ fontSize: '30px' }} />
                                                      </div>
                                                   )}

                                                   <div className="file-card-body">
                                                      {file.mime_type.startsWith("image") ? (
                                                         <div className="file-thumbnail" onClick={() => handleImageClick(file)}>
                                                            <img
                                                               src={file.preview_url}
                                                               alt={file.name}
                                                               className="img-fluid rounded"
                                                            />
                                                         </div>
                                                      ) : (
                                                         <div className="file-icon fileicon" onClick={() => handleImageClick(file)}>
                                                            {/* Use icons for other file types */}
                                                            {file.mime_type === "application/pdf" ? (
                                                               <MdPictureAsPdf className="text-danger" style={{ fontSize: '40px' }} />
                                                            ) : file.mime_type.startsWith("video") ? (
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
                                             type="button" 
                                             onClick={handleLoadMore}
                                             disabled={loading}
                                             className="btn btn-primary"
                                          >
                                             {loading ? 'Loading...' : 'Load More'}
                                          </button>
                                       )}
                                    </div>
                                 </div>
                                 <div className="col-md-3 attchment-detais">
                                    {selectedFile && (
                                       
                                       <div>

                                          <h5 className="modal-title">Attachment details</h5>

                                          <div className="row">
                                             <div className="col-md-4">
                                                {selectedFile.mime_type.startsWith("image") ? (
                                                   <img
                                                      src={selectedFile.preview_url}
                                                      alt={selectedFile.name}
                                                      className="img-fluid rounded mb-3"
                                                      style={{ maxHeight: "300px", objectFit: "contain" }}
                                                   />
                                                ) : (
                                                   <div className="file-icon fileicon">
                                                      {selectedFile.mime_type === "application/pdf" ? (
                                                         <MdPictureAsPdf className="text-danger" style={{ fontSize: "40px" }} />
                                                      ) : selectedFile.mime_type.startsWith("video") ? (
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
                                                <div><strong>File type:</strong> {selectedFile.mime_type}</div>
                                                <div><strong>File size:</strong> {selectedFile.file_size}</div>
                                             </div>
                                          </div>


                                          <div className="mt-10 mb-3">
                                             <label className="form-label">Title:</label>
                                             <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                readOnly={true}
                                                value={selectedFile.title || ""}
                                             />
                                          </div>
                                          <div className="mb-3">
                                             <label className="form-label">Caption:</label>
                                             <input
                                                type="text"
                                                className="form-control"
                                                value={selectedFile.caption || ""}
                                                name="caption"
                                                readOnly={true}
                                             />
                                          </div>
                                          <div className="mb-3">
                                             <label className="form-label">Description:</label>
                                             <textarea
                                                className="form-control"
                                                value={selectedFile.description || ""}
                                                readOnly={true}
                                                name="description"
                                                rows="3"
                                             ></textarea>
                                          </div>
                                          <div className="mb-3">
                                             <label className="form-label">File URL:</label>
                                             <input
                                                type="text"
                                                className="form-control"
                                                value={selectedFile.url || ""}
                                                readOnly={true}
                                                onClick={(e) => e.target.select()}
                                             />
                                             <button
                                                type="button" 
                                                className="btn btn-outline-secondary mt-2"
                                                onClick={handleCopyUrl}
                                             >
                                                Copy URL
                                             </button>
                                          </div>

                                       </div>
                                    )}
                                 </div>
                              </div>


                           </div>
                        </div>
                     </div>
                     <div className="modal-footer">

                     <button 
                        type="button" 
                        className="btn btn-primary" 
                        disabled={!selectedFile} 
                        onClick={handelmageSelect} 
                     >
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

export default AttachmentSelector;