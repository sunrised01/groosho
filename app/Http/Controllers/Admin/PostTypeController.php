<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PostType;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PostTypeController extends Controller
{
    /**
     * Display a listing of the custom post types with search and pagination.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $postTypes = PostType::query()
            ->when($search, function ($query, $search) {
                return $query->where('cpt_name', 'like', "%{$search}%")
                             ->orWhere('label', 'like', "%{$search}%");
            })
            ->paginate(10); 
        return Inertia::render('Admin/PostTypes/Index', [
            'postTypes' => $postTypes,
            'links' => [
                'prev' => $postTypes->previousPageUrl(),
                'next' => $postTypes->nextPageUrl(),
            ],
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    /**
     * Show the form for creating a new custom post type.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Admin/PostTypes/Create');
    }

    /**
     * Store a newly created custom post type in the database.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'cptName' => 'required|string|regex:/^[a-z0-9-_]{1,20}$/|unique:post_types,cpt_name',
                'label' => 'required|string|max:255',
                'singularName' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'showInMenu' => 'required|in:Yes,No',
            ]);

            // Create and store the new post type
            $postType = PostType::create([
                'title' => $validated['title'],
                'cpt_name' => $validated['cptName'],
                'label' => $validated['label'],
                'singular_name' => $validated['singularName'],
                'description' => $validated['description'],
                'show_in_menu' => $validated['showInMenu'] === 'Yes',
            ]);

            // Return success response with the created post type
            return response()->json([
                'message' => 'Post type created successfully!',
                'data' => $postType
            ], 201);

        } catch (\Exception $e) {
            // Log the error for debugging purposes
            Log::error('Error creating post type: ' . $e->getMessage());

            // Return an error response with a specific message
            return response()->json([
                'message' => 'An error occurred while creating the post type.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified custom post type.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        $postType = PostType::findOrFail($id);
        return Inertia::render('Admin/PostTypes/Edit', [
            'postType' => $postType 
        ]);
    }

    /**
     * Update the specified custom post type in the database.
     *
     * @param \Illuminate\Http\Request $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'cpt_name' => 'required|alpha_dash|max:20|unique:post_types,cpt_name,' . $id, 
            'label' => 'required|string', 
            'singular_name' => 'required|string', 
            'description' => 'required|string', 
            'show_in_menu' => 'required|boolean' 
        ]);

        $postType = PostType::findOrFail($id);

        $postType->update($request->all());

        return redirect()->route('post_types.index')->with('success', 'Custom post type updated successfully.');
    }
}
