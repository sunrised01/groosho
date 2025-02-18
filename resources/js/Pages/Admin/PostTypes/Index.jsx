import React, { useState, useEffect } from "react";
import { Inertia } from '@inertiajs/inertia'; 
import Dropdown from '@/Components/Dropdown';
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; 

export default function Index() {
    const { postTypes, filters, pagination } = usePage().props;

    // Initialize state for filters from props
    const [search, setSearch] = useState(filters.search || '');
    const [currentPage] = useState(pagination.current_page);
    const [lastPage] = useState(pagination.last_page);
    const [selectedRows, setSelectedRows] = useState([]);
    const [dateFilter, setDateFilter] = useState(filters.dateFilter || 'all');
   
    console.log(filters);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    // Handle row selection
    const handleRowSelection = (postTypeId) => {
        setSelectedRows((prevSelectedRows) => {
            if (prevSelectedRows.includes(postTypeId)) {
                return prevSelectedRows.filter(id => id !== postTypeId);
            }
            return [...prevSelectedRows, postTypeId];
        });
    };

    // Handle Select All functionality
    const handleSelectAll = () => {
        if (selectedRows.length === postTypes.data.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(postTypes.data.map(postType => postType.id));
        }
    };

    // Handle Bulk Action (Move to Trash)
    const handleBulkAction = (action) => {
        if (selectedRows.length > 0) {
            // Perform Bulk Action (example: Move to Trash)
            console.log(`Performing ${action} on selected rows:`, selectedRows);
        }
    };

    // Handle changing the per_page value
    const handlePerPageChange = (e) => {
        const perPage = e.target.value;

        Inertia.get(route('posttype.index'), {
            ...filters, 
            per_page: perPage, 
        }, {
            preserveState: true,
            replace: true, 
        });
    };

    return (
        <AppLayout>
            <Head title="Post Types" />
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Post Types</h2>
                    <Link href={route('posttype.create')} className="btn btn-outline-primary">Add New Post Type</Link>
                </div>
            </div>

            {/* Filters Section */}
            <div className="row mb-3">
                <div className="col-12 d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                        <Link href={route('posttype.index')} className="btn btn-link"  as="button">
                            All
                        </Link>
                        <Link 
                             as="button"
                            href={route('posttype.index', {
                                ...filters,
                                status: 'published'
                            })}
                            className="btn btn-link"
                        >
                            Published
                        </Link>

                        
                    </div>
                    {/* Search Field */}
                    <form className="d-flex">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by Title or CPT Name"
                            value={search}
                            onChange={handleSearchChange}
                        />
                        <button type="submit" className="btn btn-primary ms-2">Search</button>
                    </form>
                </div>
            </div>

            {/* Table */}
            <div className="row">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            
                            <div className="d-flex justify-content-between mb-3">
                                {/* Bulk Actions */}
                                <div className="d-inline-flex align-items-center me-3">
                                    <select onChange={(e) => handleBulkAction(e.target.value)} className="form-select me-2" style={{ width: '200px' }}>
                                        <option value="">Bulk Actions</option>
                                        <option value="move_to_trash">Move to Trash</option>
                                    </select>
                                    <button className="btn btn-outline-primary">Apply</button>
                                </div>

                                {/* Date Filter Dropdown */}
                                <div className="d-inline-flex align-items-center me-3">
                                    <select 
                                        className="form-select me-2" 
                                        style={{ width: '200px' }} 
                                        value={filters.dateFilter} 
                                        onChange={(e) => setDateFilter(e.target.value)} 
                                    >
                                        <option value="all">All Dates</option>
                                        <option value="this_month">This Month</option>
                                        <option value="last_month">Last Month</option>
                                    </select>

                                    <Link
                                        href={route('posttype.index', {
                                            ...filters,  
                                            dateFilter: dateFilter 
                                        })}
                                        className="btn btn-outline-primary"
                                    >
                                        Filter
                                    </Link>
                                </div>

                                {/* Show Items Dropdown */}
                                <div className="d-inline-flex align-items-center me-3">
                                    <span className="me-2">Show</span>
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary dropdown-toggle"
                                                >
                                                    {filters.per_page}

                                                    
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                             as="button"
                                            href={route('posttype.index', {
                                                ...filters,
                                                per_page: 10 
                                            })}
                                            >
                                                Show 10
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                            as="button"
                                            href={route('posttype.index', {
                                                ...filters,
                                                per_page: 20 
                                            })}
                                            >
                                                Show 20
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                             as="button"
                                            href={route('posttype.index', {
                                                ...filters,
                                                per_page: 30 
                                            })}
                                            >
                                                Show 30
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedRows.length === postTypes.data.length}
                                            />
                                        </th>
                                        <th>
                                            
                                            <div className="d-flex align-items-center">
                                                <span className="me-3">Title</span>

                                                <Link
                                                     as="button"
                                                    href={route('posttype.index', {
                                                        ...filters,
                                                        order_by: 'asc', 
                                                        order_column: 'title'
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'title' && filters.order_by === 'asc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowUp color={filters.order_column === 'title' && filters.order_by === 'asc' ? 'black' : 'gray'} />
                                                </Link>

                                                <Link
                                                    as="button"
                                                    href={route('posttype.index', {
                                                        ...filters,
                                                        order_by: 'desc', 
                                                        order_column: 'title'  
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'title' && filters.order_by === 'desc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowDown color={filters.order_column === 'title' && filters.order_by === 'desc' ? 'black' : 'gray'} />
                                                </Link>
                                            </div>

                                        </th>

                                        <th>
                                            <div className="d-flex align-items-center">
                                                <span className="me-3">CPT Name</span>
                                                <Link
                                                    as="button"
                                                    href={route('posttype.index', {
                                                        ...filters,
                                                        order_by: 'asc', 
                                                        order_column: 'cpt_name'
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'cpt_name' && filters.order_by === 'asc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowUp color={filters.order_column === 'cpt_name' && filters.order_by === 'asc' ? 'black' : 'gray'} />
                                                </Link>

                                                <Link
                                                    as="button"
                                                    href={route('posttype.index', {
                                                        ...filters,
                                                        order_by: 'desc', 
                                                        order_column: 'cpt_name'  
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'cpt_name' && filters.order_by === 'desc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowDown color={filters.order_column === 'cpt_name' && filters.order_by === 'desc' ? 'black' : 'gray'} />
                                                </Link>
                                            </div>
                                        </th>
                                        <th>
                                            <div className="d-flex align-items-center">
                                                <span className="me-3">Singular Name</span>
                                                <Link
                                                    as="button"
                                                    href={route('posttype.index', {
                                                        ...filters,
                                                        order_by: 'asc', 
                                                        order_column: 'singular_name'
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'singular_name' && filters.order_by === 'asc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowUp color={filters.order_column === 'singular_name' && filters.order_by === 'asc' ? 'black' : 'gray'} />
                                                </Link>

                                                <Link
                                                     as="button"
                                                    href={route('posttype.index', {
                                                        ...filters,
                                                        order_by: 'desc', 
                                                        order_column: 'singular_name'  
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'singular_name' && filters.order_by === 'desc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowDown color={filters.order_column === 'singular_name' && filters.order_by === 'desc' ? 'black' : 'gray'} />
                                                </Link>
                                            </div>
                                        </th>


                                        <th>
                                            <div className="d-flex align-items-center">
                                                <span className="me-3">Show in Menu</span>
                                                <Link
                                                     as="button"
                                                    href={route('posttype.index', {
                                                        ...filters,
                                                        order_by: 'asc', 
                                                        order_column: 'show_in_menu'
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'show_in_menu' && filters.order_by === 'asc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowUp color={filters.order_column === 'show_in_menu' && filters.order_by === 'asc' ? 'black' : 'gray'} />
                                                </Link>

                                                <Link
                                                 as="button"
                                                    href={route('posttype.index', {
                                                        ...filters,
                                                        order_by: 'desc', 
                                                        order_column: 'show_in_menu'  
                                                    })}
                                                    className={`btn btn-link p-0 ${filters.order_column === 'show_in_menu' && filters.order_by === 'desc' ? 'active' : ''}`}
                                                >
                                                    <FaArrowDown color={filters.order_column === 'show_in_menu' && filters.order_by === 'desc' ? 'black' : 'gray'} />
                                                </Link>
                                            </div>
                                        </th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {postTypes.data.map((postType) => (
                                        <tr key={postType.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(postType.id)}
                                                    onChange={() => handleRowSelection(postType.id)}
                                                />
                                            </td>
                                            <td>{postType.title}</td>
                                            <td>{postType.cpt_name}</td>
                                            <td>{postType.singular_name}</td>
                                            <td>{postType.show_in_menu ? 'Yes' : 'No'}</td>
                                            <td>
                                                <a href={`/posttype/${postType.id}/edit`} className="btn btn-secondary btn-sm">Edit</a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination Section */}
                            <div className="mt-5">
                                <Pagination
                                    currentPage={currentPage}
                                    lastPage={lastPage}
                                />
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
