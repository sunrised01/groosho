import React from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Create() {
    const { taxonomyData } = usePage().props;

    return (
        <AppLayout>
            <Head title={taxonomyData.title} />
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Create New {taxonomyData.title}</h2>
                </div>
            </div>

            {/* Layout with 2 columns */}
            <div className="row">
                {/* Left Column (Form Section) */}
                <div className="col-4">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title mb-4">Create New {taxonomyData.singular_name}</h4>

                            {/* Form */}
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input type="text" className="form-control" id="name" placeholder="Enter name" />
                                    <small className="form-text text-muted">
                                    The name is how it appears on your site.
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="slug" className="form-label">Slug</label>
                                    <input type="text" className="form-control" id="slug" placeholder="Enter slug" />
                                    <small className="form-text text-muted">
                                    The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.
                                    </small>
                                </div>
                                {taxonomyData.taxonomy_name == 'category' &&
                                    <div className="mb-3">
                                        <label htmlFor="parentCategory" className="form-label">Parent Category</label>
                                        <select className="form-select" id="parentCategory">
                                            <option value="">Select Parent Category</option>
                                            {/* Add dynamic options for parent categories here */}
                                        </select>
                                    
                                    </div>
                                }
                                

                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea className="form-control" id="description" rows="3" placeholder="Enter description"></textarea>
                                    <small className="form-text text-muted">
                                    The description is not prominent by default; however, some themes may show it.
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="image" className="form-label">Upload Image</label>
                                    <input type="file" className="form-control" id="image" />
                                </div>

                                <button type="submit" className="btn btn-primary">Save</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column (Table Section) */}
                <div className="col-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title mb-4">Categories List</h4>

                            {/* Table */}
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Slug</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Example row */}
                                    <tr>
                                        <td>
                                            {/* Example image placeholder */}
                                            <img src="path-to-image.jpg" alt="Category Image" className="img-fluid" style={{ width: "50px" }} />
                                        </td>
                                        <td>Jazz</td>
                                        <td>jazz</td>
                                        <td>10</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {/* Example image placeholder */}
                                            <img src="path-to-image.jpg" alt="Category Image" className="img-fluid" style={{ width: "50px" }} />
                                        </td>
                                        <td>Bebop</td>
                                        <td>bebop</td>
                                        <td>5</td>
                                    </tr>
                                    {/* Add dynamic rows here based on your data */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
