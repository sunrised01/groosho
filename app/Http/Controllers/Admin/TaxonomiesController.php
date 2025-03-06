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
     * This method retrieves all taxonomies, applies various filters like search, 
     * status, date range, and sorting. It then returns the data along with pagination 
     * and additional counts for different taxonomy statuses.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $search = urldecode($request->input('s', ''));
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'asc'); 
        $orderColumn = $request->input('order_column', 'title'); 
        $dateFilter = $request->input('date_filter', 'all'); 
        $status = $request->input('status', '');

        $query = Taxonomies::query();

        if (!empty($search)) {
            $words = explode(' ', $search);  
            foreach ($words as $word) {
                $query->orWhere(function ($q) use ($word) {
                    $q->where('title', 'like', "%{$word}%");
                });
            }
        }

        if (!empty($status)) {
            $query->where('status', $status); 
        }
        else{
            $query->where('status', '!=', 'trash'); 
        }
        
        if ($dateFilter !== 'all') {
            list($year, $month) = explode('-', $dateFilter);  
            $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = \Carbon\Carbon::create($year, $month, 1)->endOfMonth();
            
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $query->orderBy($orderColumn, $orderBy);

        $taxonomies = $query->with('postTypes')->paginate($perPage);

        $months = Taxonomies::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month')
        ->groupBy('year', 'month')
        ->orderByDesc('year')
        ->orderByDesc('month')
        ->get()
        ->map(function ($item) {
            $monthName = \Carbon\Carbon::create($item->year, $item->month, 1)->format('M Y');
            return ['value' => "{$item->year}-{$item->month}", 'label' => $monthName]; 
        });

        $totalCount = Taxonomies::where('status', '!=', 'trash')->count();
        $publishCount = Taxonomies::where('status', 'publish')->count();
        $trashCount = Taxonomies::where('status', 'trash')->count();
        $draftCount = Taxonomies::where('status', 'draft')->count();

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
     * This method fetches users and post types for the creation form and 
     * returns the view to create a new taxonomy.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $users = User::select('id', 'name')->get();
        $postTypes = PostType::select('id', 'title', 'slug')->where('status', 'publish')->get();
        
        return Inertia::render('Admin/Taxonomies/Create', [
            'users' => $users,
            'postTypes' => $postTypes,
        ]);
    }

    /**
     * Store a newly created taxonomy in the database.
     *
     * This method validates the input, creates a new taxonomy, and 
     * associates it with the selected post types. It handles errors and redirects 
     * to the taxonomy edit page upon successful creation.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */

    public function store(Request $request)
    {
        $users = User::select('id', 'name')->get();
        $postTypes = PostType::select('id', 'title', 'slug')->where('status', 'publish')->get();

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'slug' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:taxonomies,slug',
                ],
                'singular_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'author_id' => 'required|exists:users,id',
            ], [
                'slug.unique' => 'The "'.$request->slug.'" Taxonomy Name(Slug) is already used in the system, Try with a different one.',
            ]);

            $taxonomy = Taxonomies::create([
                'title' => $request->title,
                'slug' => $request->slug,
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
            
            return redirect()->route('taxonomy.edit', $taxonomy->id)->with('success', 'Taxonomy created successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Inertia::render('Admin/Taxonomies/Create', [
                'users' => $users,
                'postTypes' => $postTypes,
                'errors' => $e->errors(),
                'formData' => $request->all(),
            ]);
        } catch (\Exception $e) {
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
     * This method retrieves the taxonomy data and the necessary options 
     * (users, post types) for editing and returns the view to edit the taxonomy.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        if (!is_numeric($id)) {
            abort(404, 'Invalid ID');
        }
        $users = User::select('id', 'name')->get();
        $taxonomy = Taxonomies::with('postTypes')->findOrFail($id);
        if (!$taxonomy) {
            abort(404, 'Taxonomy not found');
        }
        $postTypes = PostType::select('id', 'title', 'slug')->where('status', 'publish')->get();
                
        return Inertia::render('Admin/Taxonomies/Edit', [
            'taxonomy' => $taxonomy,
            'users' => $users, 
            'postTypes' => $postTypes, 
        ]);
    }

    /**
     * Update the specified taxonomy in the database.
     *
     * This method validates the update request, updates the taxonomy 
     * with new values, and manages the associations with post types. 
     * It handles errors and redirects to the taxonomy edit page upon successful update.
     *
     * @param \Illuminate\Http\Request $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $taxonomy = Taxonomies::with('postTypes')->findOrFail($id);
        $users = User::select('id', 'name')->get();
        $postTypes = PostType::select('id', 'title', 'slug')->where('status', 'publish')->get();


        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'slug' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:taxonomies,slug,'. $id,
                ],
                'singular_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'author_id' => 'required|exists:users,id',
            ], [
                'slug.unique' => 'The "'.$request->slug.'" Taxonomy Name(Slug) is already used in the system, Try with a different one.',
            ]);
            
            $taxonomy->update([
                'title' => $request->title,
                'slug' => $request->slug,
                'author' => $request->author_id,
                'singular_name' => $request->singular_name,
                'status' => $request->status,
                'visibility' => $request->visibility,
                'password' => ($request->visibility == 'protected' ? $request->password : ''),
                'description' => $request->description,
            ]);

            if (!empty($request->post_type)) {
                $taxonomy->postTypes()->syncWithoutDetaching([$request->post_type]);

            } 
            else{
                $taxonomy->postTypes()->detach($request->post_type);
            }

            return redirect()->route('taxonomy.edit', $id)->with('success', 'Taxonomy updated successfully.');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Inertia::render('Admin/Taxonomies/Edit', [
                'users' => $users,
                'postTypes' => $postTypes,
                'taxonomy' => $taxonomy,
                'errors' => $e->errors(),
                'formData' => $request->all(),
            ]);
        } catch (\Exception $e) {
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
     * This method updates the status of a taxonomy to 'trash' or 
     * deletes it permanently based on the provided status and 
     * then redirects the user accordingly with a success message.
     *
     * @param \Illuminate\Http\Request $request
     * @param  int  $id
     * @param  string $status
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStatus(Request $request, $id, $status)
    {
        try {
            $validStatuses = ['publish', 'draft', 'trash', 'delete'];
            
            if (!in_array($status, $validStatuses)) {
                return redirect()->back()->with('error', 'Invalid status provided.');
            }

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
            
            if (strpos($referer, route('taxonomy.edit', $taxonomy->id)) !== false) {
                return redirect()->route('taxonomies.index')->with('success', $message);
            } else {
                return back()->with('success', $message);
            }
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            if (App::environment('production')) {
                $error = 'Taxonomy not found';
                Log::error('Taxonomy not found: '. $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->back()->with('error', $error);
        } catch (\Exception $e) {
            
            if (App::environment('production')) {
                $error = 'An error occurred while moving the taxonomy to trash. Please try again.';
                Log::error('Taxonomy Error: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->back()->with('error', $error);
        }
    }

    /**
     * Perform bulk actions on selected taxonomies.
     *
     * This method handles bulk actions like deleting or moving taxonomies to trash 
     * by taking a list of selected IDs and performing the necessary action. 
     * It then redirects back with a success message.
     *
     * @param \Illuminate\Http\Request $request
     * @param  string $status
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkAction(Request $request, $status)
    {
        try {
            if ($request->query('ids') == null) {
                return redirect()->back()->with('error', 'No IDs selected.');
            }
            $ids = explode(',', $request->query('ids')); 
            
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

            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while processing the request. Please try again.';
                Log::error('PostType Error: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->back()->with('error', $error);
        }
    }
}
