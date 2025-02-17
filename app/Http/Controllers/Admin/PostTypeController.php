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
            $validated = $request->validate([
                'title' => 'required|string|max:255|unique:post_types,title',
                'cptName' => 'required|string|regex:/^[a-z0-9-_]{1,20}$/|unique:post_types,cpt_name',
                'label' => 'required|string|max:255',
                'singularName' => 'nullable|string|max:255',
                'description' => 'nullable|string',
            ]);

            $postType = PostType::create([
                'title' => $validated['title'],
                'cpt_name' => $validated['cptName'],
                'label' => $validated['label'],
                'singular_name' => $validated['singularName'],
                'description' => $validated['description'],
                'show_in_menu' => $validated['showInMenu'],
            ]);
            
            return redirect()->route('posttype.edit', $postType->id)->with('success', 'Post type created successfully!');

            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Inertia::render('Admin/PostTypes/Create', [
                'errors' => $e->errors(),
                'formData' => $request->all(),
            ]);
            
        } catch (\Exception $e) {
            // Log the error for debugging purposes
            Log::error('Error creating post type: ' . $e->getMessage());

            return Inertia::render('Admin/PostTypes/Create', [
                'errors' => ['general' => $e->getMessage()],
                'formData' => $request->all(),
            ]);
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
        $postType = PostType::findOrFail($id);

        try {

            // Validate incoming request
            $validated = $request->validate([
                'title' => 'required|alpha_dash|max:20|unique:post_types,title,' . $id,
                'cpt_name' => 'required|alpha_dash|max:20|unique:post_types,cpt_name,' . $id,
                'label' => 'required|string',
                'singular_name' => 'required|string',
                'description' => 'nullable|string',
                
            ]);
            
            // Update the PostType with validated data
            $postType->update($validated);

            // Redirect with success message using Inertia
            return redirect()->route('posttype.edit', $id)->with('success', 'Custom post type updated successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return Inertia::render('Admin/PostTypes/Edit', [
                'errors' => $e->errors(),
                'formData' => $request->all(),
                'postType' => $postType,
            ]);
            
        } catch (\Exception $e) {
            // Log the error for debugging purposes
            Log::error('Error creating post type: ' . $e->getMessage());

            return Inertia::render('Admin/PostTypes/Edit', [
                'errors' => ['general' => $e->getMessage()],
                'formData' => $request->all(),
                'postType' => $postType,
            ]);

        }
    }
}
