import React from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <AppLayout>
            <Head title="Custom Post Type" />
            
            <div className="mb-4">
                <h4>Create custom Post Types and custom Taxonomies the simple way.</h4>
                <p>Published custom post types and taxonomies created by CPT are listed below.</p>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h4>Custom Post Types</h4>
                        </div>
                        <div className="card-body">
                            <p>Listing of all custom post types</p>
                            <button className="btn btn-primary">New Custom Post Type</button>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h4>Custom Taxonomies</h4>
                        </div>
                        <div className="card-body">
                            <p>Listing of all custom taxonomies</p>
                            <button className="btn btn-primary">New Custom Taxonomy</button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
