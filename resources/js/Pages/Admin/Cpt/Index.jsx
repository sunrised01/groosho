import React from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';


export default function Index() {
    const { customPostTyps, customTaxonomies } = usePage().props;

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
                            <ul>
                                {customPostTyps.map((customPostType, index) => (
                                    <li key={index}>{customPostType.title}</li>
                                ))}
                            </ul>
                            
                            <Link href={route('posttype.index')} className="btn btn-primary">New Custom Post Type</Link>
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
                            <ul>
                                {customTaxonomies.map((customTaxonomy, index) => (
                                    <li key={index}>{customTaxonomy.title}</li>
                                ))}
                            </ul>
                            <Link href={route('taxonomies.index')} className="btn btn-primary">New Custom Taxonomy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
