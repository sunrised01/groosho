<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PostType;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\App;

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
        // Retrieve filters and parameters from the request
        $search = urldecode($request->input('s', ''));  // Search query (decoded)
        $perPage = $request->input('per_page', 10);     // Items per page
        $orderBy = $request->input('order_by', 'asc');  // Order by direction (ascending or descending)
        $orderColumn = $request->input('order_column', 'title');  // Column to order by (default is title)
        $dateFilter = $request->input('date_filter', 'all'); // Date filter (default is all)
        $status = $request->input('status', '');  // Status filter

        // Build query with filters
        $query = PostType::query();

        // Search filter: if search term exists, apply filtering based on title and cpt_name
        if (!empty($search)) {
            $words = explode(' ', $search);  // Split search term into words
            
            // Apply the search filter to each word
            foreach ($words as $word) {
                $query->orWhere(function ($q) use ($word) {
                    $q->where('title', 'like', "%{$word}%")
                      ->orWhere('cpt_name', 'like', "%{$word}%");
                });
            }
        }

         // Status filter: apply the status filter to the query
        if (!empty($status)) {
            $query->where('status', $status); 
        }
        else{
            $query->where('status', '!=', 'trash'); 
        }
        
        // Date filter: filter by the selected month if the date filter is not 'all'
        if ($dateFilter !== 'all') {
            list($year, $month) = explode('-', $dateFilter);  // Extract year and month from date filter
            
            // Set the start and end dates for the selected month
            $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = \Carbon\Carbon::create($year, $month, 1)->endOfMonth();
            
            $query->whereBetween('created_at', [$startDate, $endDate]);  // Apply date filter
        }

        // Apply ordering (based on the specified column and direction)
        $query->orderBy($orderColumn, $orderBy);

        // Paginate the results
        $postTypes = $query->paginate($perPage);

        // Get unique months from the created_at field for filtering by date
        $months = PostType::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month')
        ->groupBy('year', 'month')
        ->orderByDesc('year')
        ->orderByDesc('month')
        ->get()
        ->map(function ($item) {
            $monthName = \Carbon\Carbon::create($item->year, $item->month, 1)->format('M Y');
            return ['value' => "{$item->year}-{$item->month}", 'label' => $monthName];  // Map to year-month labels
        });

        /// Count of publish post types
        $totalCount = PostType::where('status', '!=', 'trash')->count();
        /// Count of publish post types
        $publishCount = PostType::where('status', 'publish')->count();
        // Count of trash post types
        $trashCount = PostType::where('status', 'trash')->count();
        // Count of draft post types
        $draftCount = PostType::where('status', 'draft')->count();

        
        // Return the view with data to display the custom post types
        return Inertia::render('Admin/PostTypes/Index', [
            'postTypes' => $postTypes,
            'pagination' => [
                'current_page' => $postTypes->currentPage(),
                'last_page' => $postTypes->lastPage(),
                'per_page' => $postTypes->perPage(),
                'total' => $postTypes->total(),
            ],
            'filters' => $request->only(['s', 'per_page', 'order_by', 'order_column', 'date_filter', 'status']),
            'months' => $months,
            'totalCount' => $totalCount,  
            'publishCount' => $publishCount,  
            'trashCount' => $trashCount,
            'draftCount' => $draftCount,
        ]);
    }

    /**
     * Show the form for creating a new custom post type.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Fetch users for the author field in the create form
        $users = User::select('id', 'name')->get();
        
        // Return the create view with users to select from
        return Inertia::render('Admin/PostTypes/Create', [
            'users' => $users
        ]);
    }

    /**
     * Store a newly created custom post type in the database.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Fetch users for the author selection field
        $users = User::select('id', 'name')->get();

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'cpt_name' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:post_types,cpt_name',
                ],
                'singular_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'supports' => 'nullable|array',
                'author_id' => 'required|exists:users,id',
            ], [
                'cpt_name.unique' => 'The "'.$request->cpt_name.'" CPT Name(Slug) is already used in the system, Try with a different one.',
            ]);

            // Create the new post type with the validated data
            $postType = PostType::create([
                'title' => $request->title,
                'cpt_name' => $request->cpt_name,
                'author' => $request->author_id,
                'singular_name' => $request->singular_name,
                'supports' => implode(',', $request->supports),
                'status' => $request->status,
                'visibility' => $request->visibility,
                'password' => ($request->visibility == 'protected' ? $request->password : ''),
                'description' => $request->description,
            ]);
            
            // Redirect to edit the newly created post type with a success message
            return redirect()->route('posttype.edit', $postType->id)->with('success', 'Post type created successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            // If validation fails, return back to the create form with errors
            return Inertia::render('Admin/PostTypes/Create', [
                'users' => $users,
                'errors' => $e->errors(),
                'formData' => $request->all(),
            ]);
        } catch (\Exception $e) {
            // Log the error and return back to the form with a general error
            if (App::environment('production')) {
                $error = 'An error occurred while creating the post type. Please try again.';
                Log::error('Error updating post type: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }

            return Inertia::render('Admin/PostTypes/Create', [
                'users' => $users,
                'errors' => ['general' => $error],
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
        // Fetch users and the post type to be edited
        $users = User::select('id', 'name')->get();
        $postType = PostType::findOrFail($id);
        
        $postType->supports = explode(',', $postType->supports);
        
        // Return the edit form view with the post type data
        return Inertia::render('Admin/PostTypes/Edit', [
            'postType' => $postType,
            'users' => $users, 
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
        // Fetch the post type to be updated
        $postType = PostType::findOrFail($id);
        $users = User::select('id', 'name')->get();

        try {
            // Validate the incoming request data
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'cpt_name' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:post_types,cpt_name,'. $id,
                ],
                'singular_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'supports' => 'nullable|array',
                'author_id' => 'required|exists:users,id',
            ], [
                'cpt_name.unique' => 'The "'.$request->cpt_name.'" CPT Name(Slug) is already used in the system, Try with a different one.',
            ]);
            
            // Update the post type in the database
            $postType->update([
                'title' => $request->title,
                'cpt_name' => $request->cpt_name,
                'author' => $request->author_id,
                'singular_name' => $request->singular_name,
                'supports' => implode(',', $request->supports),
                'status' => $request->status,
                'visibility' => $request->visibility,
                'password' => ($request->visibility == 'protected' ? $request->password : ''),
                'description' => $request->description,
            ]);

            // Redirect to the edit page with success message
            return redirect()->route('posttype.edit', $id)->with('success', 'Custom post type updated successfully.');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            // If validation fails, return back to the edit form with errors
            return Inertia::render('Admin/PostTypes/Edit', [
                'errors' => $e->errors(),
                'formData' => $request->all(),
                'postType' => $postType,
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            // Log the error and return back to the form with a general error

            if (App::environment('production')) {
                $error = 'An error occurred while updating the post type. Please try again.';
                Log::error('Error updating post type: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }

            return Inertia::render('Admin/PostTypes/Edit', [
                'errors' => ['general' => $error],
                'formData' => $request->all(),
                'postType' => $postType,
                'users' => $users,
            ]);
        }
    }

    /**
     * Move the specified post type to the trash.
     *
     * @param \Illuminate\Http\Request $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStatus(Request $request, $id, $status)
    {
        try {
                        // Find the post type by ID and update its status to 'trash'
            $postType = PostType::findOrFail($id);

            if($status == 'delete'){
                $postType->delete();
            }
            else{
                $postType->status = $status;
                $postType->save(); 
            }            
            return redirect()->back();
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation exceptions and log the error
            if (App::environment('production')) {
                $error = 'PostType not found';
                Log::error('PostType not found: '. $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->back()->with('error', $error);
        } catch (\Exception $e) {
            // Log the error and handle non-production environments with detailed error message
            if (App::environment('production')) {
                $error = 'An error occurred while moving the post to trash. Please try again.';
                Log::error('PostType Error: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->back()->with('error', $error);
        }
    }

    public function bulkAction(Request $request, $status)
    {
        try {
            // Get the 'ids' from the query string
            $ids = explode(',', $request->query('ids')); 
            
            // Validate that the 'ids' array is not empty
            if (empty($ids)) {
                return redirect()->back()->with('error', 'No IDs provided.');
            }
            
            // Check for the status and perform actions accordingly
            if ($status == 'delete_permanently') {
                PostType::whereIn('id', $ids)->delete();
            } else if ($status == 'move_to_trash') {
                PostType::whereIn('id', $ids)->update(['status' => 'trash']);
            }
            else if ($status == 'restore') {
                PostType::whereIn('id', $ids)->update(['status' => 'draft']);
            }

            // Redirect back after successful action
            return redirect()->back()->with('success', 'Action applied successfully.');

        } catch (\Exception $e) {
            // Log the error and handle non-production environments with detailed error message
            if (App::environment('production')) {
                $error = 'An error occurred while processing the request. Please try again.';
                Log::error('PostType Error: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }

            // Redirect back with an error message
            return redirect()->back()->with('error', $error);
        }
    }

}