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
        // Extract filters and pagination from request
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'asc');
        $orderColumn = $request->input('order_column', 'title');
        $dateFilter = $request->input('date_filter', 'all');
        $status = $request->input('status', 'published');

        // Build query with filters
        $query = PostType::query();

        // Search filter
        if (!empty($search)) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('cpt_name', 'like', "%{$search}%");
        }

        // Date filter
        if ($dateFilter !== 'all') {
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();

            if ($dateFilter === 'last_month') {
                $startDate = now()->subMonth()->startOfMonth();
                $endDate = now()->subMonth()->endOfMonth();
            }

            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        // Order by filter
        $query->orderBy($orderColumn, $orderBy);

        // Paginate the results
        $postTypes = $query->paginate($perPage);


        return Inertia::render('Admin/PostTypes/Index', [
            'postTypes' => $postTypes,
            'pagination' => [
                'current_page' => $postTypes->currentPage(),
                'last_page' => $postTypes->lastPage(),
                'per_page' => $postTypes->perPage(),
                'total' => $postTypes->total(),
            ],
            'filters' => ['search' => $search, 'per_page' => $perPage, 'order_by' => $orderBy, 'order_column' => $orderColumn, 'date_filter' => $dateFilter, 'status' => $status],
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
                'cpt_name' => 'required|string|regex:/^[a-z0-9-_]{1,20}$/|unique:post_types,cpt_name',
                'singular_name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
            ]);


            $postType = PostType::create([
                'title' => $request->title,
                'cpt_name' => $request->cpt_name,
                'author' => auth()->user()->id,
                'singular_name' => $request->singular_name,
                'description' => $request->description,
                'show_in_menu' => $request->show_in_menu,
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
