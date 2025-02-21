<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PostType;
use App\Models\User;
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
        $search = urldecode($request->input('s', ''));
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'asc');
        $orderColumn = $request->input('order_column', 'title');
        $dateFilter = $request->input('date_filter', 'all');
        $status = $request->input('status', 'published');
        
        // Build query with filters
        $query = PostType::query();

       // Search filter
        if (!empty($search)) {
            // Split the search term into individual words
            $words = explode(' ', $search);
            
            // Build the query for each word
            foreach ($words as $word) {
                $query->orWhere(function ($q) use ($word) {
                    $q->where('title', 'like', "%{$word}%")
                      ->orWhere('cpt_name', 'like', "%{$word}%");
                });
            }
        }
       

        // Date filter
        if ($dateFilter !== 'all') {
            // Parse the date filter, expected format: "YYYY-MM"
            list($year, $month) = explode('-', $dateFilter);
    
            // Set the start and end dates for the selected month
            $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = \Carbon\Carbon::create($year, $month, 1)->endOfMonth();
    
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        // Order by filter
        $query->orderBy($orderColumn, $orderBy);

        // Paginate the results
        $postTypes = $query->paginate($perPage);

        // Get unique months from the created_at field (Group by Year and Month)
        $months = PostType::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month')
        ->groupBy('year', 'month')
        ->orderByDesc('year')
        ->orderByDesc('month')
        ->get()
        ->map(function ($item) {
            $monthName = \Carbon\Carbon::create($item->year, $item->month, 1)->format('M Y');
            return ['value' => "{$item->year}-{$item->month}", 'label' => $monthName];
        });

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
        ]);
    }

    /**
     * Show the form for creating a new custom post type.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $users = User::select('id', 'name')->get();

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
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255|unique:post_types,title',
                'cpt_name' => 'required|string|regex:/^[a-z0-9-_]{1,20}$/|unique:post_types,cpt_name',
                'singular_name' => 'required|string|max:255|unique:post_types,singular_name',
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
