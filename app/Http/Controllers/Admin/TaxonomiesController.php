<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Taxonomies;
use App\Models\User;
use Inertia\Inertia;
use App\Models\PostType;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\App;


class TaxonomiesController extends Controller
{
    /**
     * Display a listing of the taxonomies with search and pagination.
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
        $query = Taxonomies::query();

        // Search filter: if search term exists, apply filtering based on title and taxonomy_name
        if (!empty($search)) {
            $words = explode(' ', $search);  // Split search term into words
            
            // Apply the search filter to each word
            foreach ($words as $word) {
                $query->orWhere(function ($q) use ($word) {
                    $q->where('title', 'like', "%{$word}%")
                      ->orWhere('taxonomy_name', 'like', "%{$word}%");
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
        $taxonomies = $query->with('postTypes')->paginate($perPage);

        // Get unique months from the created_at field for filtering by date
        $months = Taxonomies::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month')
        ->groupBy('year', 'month')
        ->orderByDesc('year')
        ->orderByDesc('month')
        ->get()
        ->map(function ($item) {
            $monthName = \Carbon\Carbon::create($item->year, $item->month, 1)->format('M Y');
            return ['value' => "{$item->year}-{$item->month}", 'label' => $monthName];  // Map to year-month labels
        });

        /// Count of publish taxonomies
        $totalCount = Taxonomies::where('status', '!=', 'trash')->count();
        /// Count of publish taxonomies
        $publishCount = Taxonomies::where('status', 'publish')->count();
        // Count of trash taxonomies
        $trashCount = Taxonomies::where('status', 'trash')->count();
        // Count of draft taxonomies
        $draftCount = Taxonomies::where('status', 'draft')->count();

        
        // Return the view with data to display the taxonomies
        return Inertia::render('Admin/Taxonomies/Index', [
            'taxonomies' => $taxonomies,
            'pagination' => [
                'current_page' => $taxonomies->currentPage(),
                'last_page' => $taxonomies->lastPage(),
                'per_page' => $taxonomies->perPage(),
                'total' => $taxonomies->total(),
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
     * Show the form for creating a new custom Taxonomy.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Fetch users for the author field in the create form
        $users = User::select('id', 'name')->get();
        $postTypes = PostType::select('id', 'title', 'cpt_name')->where('status', 'publish')->get();
        
        // Return the create view with users to select from
        return Inertia::render('Admin/Taxonomies/Create', [
            'users' => $users,
            'postTypes' => $postTypes,
        ]);
    }

    /**
     * Store a newly created taxonomy in the database.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Fetch users for the author selection field
        $users = User::select('id', 'name')->get();
        $postTypes = PostType::select('id', 'title', 'cpt_name')->where('status', 'publish')->get();

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'taxonomy_name' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:taxonomies,taxonomy_name',
                ],
                'singular_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'author_id' => 'required|exists:users,id',
            ], [
                'taxonomy_name.unique' => 'The "'.$request->taxonomy_name.'" Taxonomy Name(Slug) is already used in the system, Try with a different one.',
            ]);

            // Create the new taxonomy with the validated data
            $taxonomy = Taxonomies::create([
                'title' => $request->title,
                'taxonomy_name' => $request->taxonomy_name,
                'author' => $request->author_id,
                'singular_name' => $request->singular_name,
                'status' => $request->status,
                'visibility' => $request->visibility,
                'password' => ($request->visibility == 'protected' ? $request->password : ''),
                'description' => $request->description,
            ]);
            
            if (!empty($request->post_type)) {
                $taxonomy->postTypes()->attach($request->post_type);
            } 
            
            // Redirect to edit the newly created taxonomy with a success message
            return redirect()->route('taxonomy.edit', $taxonomy->id)->with('success', 'Taxonomy created successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            // If validation fails, return back to the create form with errors
            return Inertia::render('Admin/Taxonomies/Create', [
                'users' => $users,
                'postTypes' => $postTypes,
                'errors' => $e->errors(),
                'formData' => $request->all(),
            ]);
        } catch (\Exception $e) {
            // Log the error and return back to the form with a general error
            if (App::environment('production')) {
                $error = 'An error occurred while creating the taxonomy. Please try again.';
                Log::error('Error updating taxonomy: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }

            return Inertia::render('Admin/Taxonomies/Create', [
                'users' => $users,
                'postTypes' => $postTypes,
                'errors' => ['general' => $error],
                'formData' => $request->all(),
            ]);
        }
    }

    /**
     * Show the form for editing the specified taxonomy.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        // Fetch users and the taxonomy to be edited
        $users = User::select('id', 'name')->get();
        $taxonomy = Taxonomies::with('postTypes')->findOrFail($id);
        $postTypes = PostType::select('id', 'title', 'cpt_name')->where('status', 'publish')->get();
                
        // Return the edit form view with the taxonomy data
        return Inertia::render('Admin/Taxonomies/Edit', [
            'taxonomy' => $taxonomy,
            'users' => $users, 
            'postTypes' => $postTypes, 
        ]);
    }

    /**
     * Update the specified taxonomy in the database.
     *
     * @param \Illuminate\Http\Request $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $taxonomy = Taxonomies::with('postTypes')->findOrFail($id);
        $users = User::select('id', 'name')->get();
        $postTypes = PostType::select('id', 'title', 'cpt_name')->where('status', 'publish')->get();


        try {
            // Validate the incoming request data
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'taxonomy_name' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:taxonomies,taxonomy_name,'. $id,
                ],
                'singular_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'author_id' => 'required|exists:users,id',
            ], [
                'taxonomy_name.unique' => 'The "'.$request->taxonomy_name.'" Taxonomy Name(Slug) is already used in the system, Try with a different one.',
            ]);
            
            // Update the taxonomy in the database
            $taxonomy->update([
                'title' => $request->title,
                'taxonomy_name' => $request->taxonomy_name,
                'author' => $request->author_id,
                'singular_name' => $request->singular_name,
                'status' => $request->status,
                'visibility' => $request->visibility,
                'password' => ($request->visibility == 'protected' ? $request->password : ''),
                'description' => $request->description,
            ]);

            if (!empty($request->post_type)) {
                $taxonomy->postTypes()->attach($request->post_type);
            } 

            // Redirect to the edit page with success message
            return redirect()->route('taxonomy.edit', $id)->with('success', 'Taxonomy updated successfully.');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            // If validation fails, return back to the create form with errors
            return Inertia::render('Admin/Taxonomies/Edit', [
                'users' => $users,
                'postTypes' => $postTypes,
                'taxonomy' => $taxonomy,
                'errors' => $e->errors(),
                'formData' => $request->all(),
            ]);
        } catch (\Exception $e) {
            // Log the error and return back to the form with a general error
            if (App::environment('production')) {
                $error = 'An error occurred while creating the taxonomy. Please try again.';
                Log::error('Error updating post type: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }

            return Inertia::render('Admin/Taxonomies/Edit', [
                'users' => $users,
                'postTypes' => $postTypes,
                'taxonomy' => $taxonomy,
                'errors' => ['general' => $error],
                'formData' => $request->all(),
            ]);
        }
    }

    /**
     * Move the specified taxonomy to the trash.
     *
     * @param \Illuminate\Http\Request $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStatus(Request $request, $id, $status)
    {
        try {
            // Validate that the status is one of the allowed values
            $validStatuses = ['publish', 'draft', 'trash', 'delete'];
            
            if (!in_array($status, $validStatuses)) {
                return redirect()->back()->with('error', 'Invalid status provided.');
            }

            // Find the taxonomy by ID and update its status to 'trash'
            $taxonomy = Taxonomies::findOrFail($id);
            $referer = $request->headers->get('referer');
            
            if ($status == 'delete') {
                $taxonomy->delete();
                $message = 'Taxonomy successfully deleted';
            } elseif ($status == 'trash') {
                $taxonomy->status = $status;
                $taxonomy->save();
                $message = 'Taxonomy successfully moved to trash';
            } elseif ($status == 'publish') {
                $taxonomy->status = $status;
                $taxonomy->save();
                $message = 'Taxonomy has been published';
            } elseif ($status == 'draft') {
                $taxonomy->status = $status;
                $taxonomy->save();
                $message = 'Taxonomy has been restored from trash';
            }  
            
            // Redirect based on the referer URL (Edit or Index page)
            if (strpos($referer, route('taxonomy.edit', $taxonomy->id)) !== false) {
                // Request came from the Edit page, redirect to the index page
                return redirect()->route('taxonomies.index')->with('success', $message);
            } else {
                // Request came from the Index page or elsewhere, redirect back
                return back()->with('success', $message);
            }
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation exceptions and log the error
            if (App::environment('production')) {
                $error = 'Taxonomy not found';
                Log::error('Taxonomy not found: '. $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->back()->with('error', $error);
        } catch (\Exception $e) {
            // Log the error and handle non-production environments with detailed error message
            if (App::environment('production')) {
                $error = 'An error occurred while moving the taxonomy to trash. Please try again.';
                Log::error('Taxonomy Error: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->back()->with('error', $error);
        }
    }

    public function bulkAction(Request $request, $status)
    {
        try {
            // Validate that the 'ids' array is not empty
            if ($request->query('ids') == null) {
                return redirect()->back()->with('error', 'No IDs selected.');
            }
            // Get the 'ids' from the query string
            $ids = explode(',', $request->query('ids')); 
            
           
            
            // Check for the status and perform actions accordingly
            if ($status == 'delete_permanently') {
                Taxonomies::whereIn('id', $ids)->delete();
                $message = 'Selected taxonomies successfully deleted';
            } else if ($status == 'move_to_trash') {
                Taxonomies::whereIn('id', $ids)->update(['status' => 'trash']);
                $message = 'Selected taxonomies successfully moved to trash';
            }
            else if ($status == 'restore') {
                Taxonomies::whereIn('id', $ids)->update(['status' => 'draft']);
                $message = 'Selected taxonomies has been restored from trash';
            }

            // Redirect back after successful action
            return redirect()->back()->with('success', $message);

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
