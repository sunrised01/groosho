import React, { useState, useEffect } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Index() {
    // Destructure necessary data passed from Laravel (Inertia)
    const { postTypes, links, filters } = usePage().props;

    // Local state for search query
    const [search, setSearch] = useState(filters.search || '');

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Refresh page with updated search query
        window.location.href = `/post_types?search=${search}`;
    };

    return (
        <AppLayout>
            <Head title="Custom Post Types" />
            
            <div className="row">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">Custom Post Types</h5>

                            {/* Search Field */}
                            <form onSubmit={handleSearchSubmit} className="mb-3">
                                <div className="d-flex justify-content-between">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Search by Name or Label"
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                    <button type="submit" className="btn btn-primary ms-2">Search</button>
                                </div>
                            </form>

                            {/* Table */}
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>CPT Name</th>
                                        <th>Label</th>
                                        <th>Singular Name</th>
                                        <th>Description</th>
                                        <th>Show in Menu</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {postTypes.data.map((postType, index) => (
                                        <tr key={postType.id}>
                                            <td>{index + 1}</td>
                                            <td>{postType.cpt_name}</td>
                                            <td>{postType.label}</td>
                                            <td>{postType.singular_name}</td>
                                            <td>{postType.description}</td>
                                            <td>{postType.show_in_menu ? 'Yes' : 'No'}</td>
                                            <td>
                                                <a href={`/post_types/${postType.id}/edit`} className="btn btn-secondary btn-sm">Edit</a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="d-flex justify-content-between">
                                <div>
                                    {postTypes.total > postTypes.per_page && (
                                        <nav>
                                            <ul className="pagination">
                                                {links.prev ? (
                                                    <li className="page-item">
                                                        <a className="page-link" href={links.prev}>Previous</a>
                                                    </li>
                                                ) : null}
                                                
                                                {links.next ? (
                                                    <li className="page-item">
                                                        <a className="page-link" href={links.next}>Next</a>
                                                    </li>
                                                ) : null}
                                            </ul>
                                        </nav>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
