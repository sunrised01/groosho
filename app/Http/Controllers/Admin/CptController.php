<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PostType;
use App\Models\Taxonomies;

class CptController extends Controller
{
    /**
     * Show the custom post type (CPT) index page.
     *
     * This method is responsible for rendering the initial view for 
     * custom post types within the admin panel. It uses Inertia to 
     * render the React.js component located at 'Admin/Cpt/Index'.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $customPostTyps = PostType::select('id', 'title', 'cpt_name')
            ->where('status', '!=', 'trash') 
            ->get();

        $customTaxonomies = Taxonomies::select('id', 'title', 'taxonomy_name')
            ->where('status', '!=', 'trash') 
            ->get();

       
        return Inertia::render('Admin/Cpt/Index', [
            'customPostTyps' => $customPostTyps, 
            'customTaxonomies' => $customTaxonomies, 
        ]);
    }

    /**
     * Fetch custom post types data with related taxonomies.
     *
     * This method handles fetching custom post types from the database, 
     * including their associated taxonomies. It returns this data in 
     * a JSON format to be consumed by the front-end.
     *
     * @param \Illuminate\Http\Request $request The incoming request object.
     * @return \Illuminate\Http\JsonResponse JSON response with custom post types and their taxonomies.
     */
    public function fetch(Request $request)
    {
        $customPostTypes = PostType::select('id', 'title', 'slug')
            ->where('status', 'publish')
            ->with('taxonomies') 
            ->get(); 
     
        return response()->json([
            'customPostTypes' => $customPostTypes,
        ]);
    }
}
