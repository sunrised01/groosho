import React, { useState, useEffect } from "react";
import { Inertia } from '@inertiajs/inertia'; 
import Dropdown from '@/Components/Dropdown';
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; 
import { toast } from 'react-toastify';


export default function Index() {
    const { taxonomies, filters, pagination, months, totalCount, publishCount, trashCount, draftCount, flash } = usePage().props;
    
    const successMessage = flash.success;
    const erroeMessage = flash.error;

    // Initialize state for filters from props
    const [currentPage] = useState(pagination.current_page);
    const [lastPage] = useState(pagination.last_page);
    const [selectedRows, setSelectedRows] = useState([]);
    const [dateFilter, setDateFilter] = useState(filters.dateFilter || 'all');
    const [searchFilter, setSearchFilter] = useState(filters.s || '');
    const [perPage] = useState(filters.per_page || 10);
    const [bulkAction, setBulkAction] = useState(''); 
    const [loading, setLoading] = useState(false); 
   
    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchFilter(encodeURIComponent(e.target.value));
    };

    // Handle row selection
    const handleRowSelection = (taxonomiesId) => {
        setSelectedRows((prevSelectedRows) => {
            if (prevSelectedRows.includes(taxonomiesId)) {
                return prevSelectedRows.filter(id => id !== taxonomiesId);
            }
            return [...prevSelectedRows, taxonomiesId];
        });
    };

    // Handle Select All functionality
    const handleSelectAll = () => {
        if (selectedRows.length === taxonomies.data.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(taxonomies.data.map(taxonomy => taxonomy.id));
        }
    };

    // Handle changing the per_page value
    const handlePerPageChange = (e) => {
        const perPage = e.target.value;

        Inertia.get(route('taxonomies.index'), {
            ...filters, 
            per_page: perPage, 
        }, {
            preserveState: true,
            replace: true, 
        });
    };

    useEffect(() => {
        setLoading(false);
        setBulkAction('');
        setSelectedRows([]);

        if (successMessage) {
            toast.success(successMessage); 
        }
        
        if (erroeMessage) {
            toast.error(erroeMessage); 
        }

    }, [successMessage, erroeMessage]); 

    return (
        <AppLayout>
            <Head title="Taxonomies" />
            <div className="row mb-4">
                <div className="col-12 d-flex align-items-center">
                    <h2 className="page-title mr-2">Taxonomies</h2>
                    <Link href={route('taxonomy.create')} className="btn btn-outline-primary">Add New Taxonomy</Link>
                </div>
            </div>

            {/* Filters Section */}
            <div className="row mb-3">
                <div className="col-12 d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                        <Link href={route('taxonomies.index')} className="btn btn-link"  as="button">
                            All({totalCount})
                        </Link>
                        {publishCount > 0 &&
                             <Link 
                                as="button"
                                href={route('taxonomies.index', {
                                    ...filters,
                                    status: 'publish'
                                })}
                                className="btn btn-link"
                            >
                                Published({publishCount})
                            </Link>    
                        }
                       
                        {draftCount > 0 &&
                             <Link 
                                as="button"
                                href={route('taxonomies.index', {
                                    ...filters,
                                    status: 'draft'
                                })}
                                className="btn btn-link"
                            >
                                Draft({draftCount})
                            </Link>    
                        }

                        {trashCount > 0 &&
                             <Link 
                                as="button"
                                href={route('taxonomies.index', {
                                    ...filters,
                                    status: 'trash'
                                })}
                                className="btn btn-link"
                            >
                                Trash({trashCount})
                            </Link>    
                        }

                        
                    </div>
                    {/* Search Field */}
                    <div className="d-flex">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by Title or CPT Name"
                            defaultValue={searchFilter}
                            onChange={handleSearchChange}
                        />
                        <Link
                            as="button"
                            href={route('taxonomies.index', {
                                ...filters,  
                                s: searchFilter 
                            })}
                            className="btn btn-primary ms-2"
                        >
                            Search
                        </Link>
                    </div>
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
                                    <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="form-select me-2" style={{ width: '200px' }}>
                                        <option value="">Bulk Actions</option>
                                        {filters.status == 'trash' ?
                                            <>
                                                <option value="restore">Restore</option>
                                                <option value="delete_permanently">Delete Permanently</option>
                                            </>
                                        :
                                            <option value="move_to_trash">Move to Trash</option>
                                        }
                                        
                                    </select>
                                    
                                    <Link 
                                        method="post"
                                        href={route('taxonomy.bulk.action', { status: bulkAction, ids: selectedRows.join(',') })} 
                                        className="btn btn-primary" 
                                        onClick={() => setLoading(true)}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Apply'
                                        )}
                                    </Link>
                                    
                                </div>

                                {/* Date Filter Dropdown */}
                                <div className="d-inline-flex align-items-center me-3">
                                    <select 
                                        className="form-select me-2" 
                                        style={{ width: '200px' }} 
                                        value={dateFilter} 
                                        onChange={(e) => setDateFilter(e.target.value)} 
                                    >
                                        <option value="all">All Dates</option>
                                        {months.map((month) => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>

                                    <Link
                                        as="button"
                                        href={route('taxonomies.index', {
                                            ...filters,  
                                            date_filter: dateFilter 
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
                                                    {perPage}

                                                    
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                             as="button"
                                            href={route('taxonomies.index', {
                                                ...filters,
                                                per_page: 10 
                                            })}
                                            >
                                                Show 10
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                            as="button"
                                            href={route('taxonomies.index', {
                                                ...filters,
                                                per_page: 20 
                                            })}
                                            >
                                                Show 20
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                             as="button"
                                            href={route('taxonomies.index', {
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
                                        <th style={{ width: '15px' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedRows.length === taxonomies.data.length}
                                            />
                                        </th>
                                        <th style={{ width: '250px' }}>
                                            
                                            <div className="d-flex align-items-center">
                                                <span className="me-3">Title</span>

                                                <Link
                                                     as="button"
                                                    href={route('taxonomies.index', {
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
                                                    href={route('taxonomies.index', {
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
                                                <span className="me-3">Taxonomy(Slug)</span>
                                                <Link
                                                    as="button"
                                                    href={route('taxonomies.index', {
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
                                                    href={route('taxonomies.index', {
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
                                                    href={route('taxonomies.index', {
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
                                                    href={route('taxonomies.index', {
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


                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {taxonomies.data.map((taxonomy) => (
                                        <tr key={taxonomy.id} className="position-relative">
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(taxonomy.id)}
                                                    onChange={() => handleRowSelection(taxonomy.id)}
                                                />
                                            </td>
                                            <td >
                                                {taxonomy.status === 'trash' ?
                                                    <div className="text-black fw-bold">
                                                    {taxonomy.title} {taxonomy.status === 'draft' &&
                                                        <span className="fw-bold text-black">- Draft</span>
                                                        }
                                                    </div>
                                                :
                                                <Link href={route('taxonomy.edit', taxonomy.id)} className="text-decoration-none fw-bold">
                                                    {taxonomy.title} {taxonomy.status === 'draft' &&
                                                    <span className="fw-bold text-black">- Draft</span>
                                                    }
                                                </Link>

                                                }
                                                

                                                <div className="action-icons ">
                                                    {taxonomy.status === 'trash' ?
                                                        <>
                                                            <span className="edit">
                                                                <Link 
                                                                    as="button"
                                                                    method="put"
                                                                    href={route('taxonomy.update.status', [taxonomy.id, 'draft'])}
                                                                    className="text-primary mx-2"
                                                                    style={{ fontSize: '13px' }}
                                                                >
                                                                    Restore
                                                                </Link>
                                                                | 
                                                            </span>
                                                            <span className="trash ms-2">
                                                                <Link
                                                                    as="button"
                                                                    method="put"
                                                                    href={route('taxonomy.update.status', [taxonomy.id, 'delete'])}
                                                                    className="text-danger"
                                                                    style={{ fontSize: '13px' }}
                                                                    
                                                                >
                                                                  Delete Permanently
                                                                </Link>

                                                            </span>
                                                        </>
                                                        :
                                                        <>
                                                            <span className="edit">
                                                                <Link href={route('taxonomy.edit', taxonomy.id)} className="text-primary mx-2"  style={{ fontSize: '13px' }}>
                                                                    Edit
                                                                </Link>
                                                                | 
                                                            </span>
                                                            <span className="trash ms-2">
                                                                <Link
                                                                    as="button"
                                                                      method="put"
                                                                    href={route('taxonomy.update.status', [taxonomy.id, 'trash'])}
                                                                    className="text-danger"
                                                                    style={{ fontSize: '13px' }}
                                                                    
                                                                >
                                                                    Trash
                                                                </Link>

                                                            </span>
                                                        </>
                                                    }
                                                    
                                                
                                                </div>
                                            </td>
                                            <td>{taxonomy.taxonomy_name}</td>
                                            <td>{taxonomy.singular_name}</td>
                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination Section */}
                            <div className="mt-5">
                                <Pagination
                                    currentPage={currentPage}
                                    lastPage={lastPage}
                                    filters={filters}
                                />
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
