<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CptController extends Controller
{
    /**
     * Show the custom post type (CPT) index page.
     *
     * This method is responsible for rendering the initial view for 
     * custom post types within the admin panel. It uses Inertia to 
     * render the Vue.js component located at 'Admin/Cpt/Index'.
     *
     * @return \Inertia\Response
    */
    public function index()
    {
        return Inertia::render('Admin/Cpt/Index');
    }
}
