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
     * Display a listing of the post types with search and pagination.
     *
     * This method retrieves all post type, applies various filters like search, 
     * status, date range, and sorting. It then returns the data along with pagination 
     * and additional counts for different post type statuses.
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

        $query = PostType::query();
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
        $postTypes = $query->with('taxonomies')->paginate($perPage);

        $months = PostType::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month')
        ->groupBy('year', 'month')
        ->orderByDesc('year')
        ->orderByDesc('month')
        ->get()
        ->map(function ($item) {
            $monthName = \Carbon\Carbon::create($item->year, $item->month, 1)->format('M Y');
            return ['value' => "{$item->year}-{$item->month}", 'label' => $monthName]; 
        });

        $totalCount = PostType::where('status', '!=', 'trash')->count();
        $publishCount = PostType::where('status', 'publish')->count();
        $trashCount = PostType::where('status', 'trash')->count();
        $draftCount = PostType::where('status', 'draft')->count();

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
     * Show the form for creating a new post type.
     *
     * This method fetches users for the creation form and 
     * returns the view to create a new post type.
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
     * Store a newly created post type in the database.
     *
     * This method validates the input, creates a new post type, It handles errors and redirects 
     * to the post type edit page upon successful creation.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */

    public function store(Request $request)
    {
        $users = User::select('id', 'name')->get();

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'slug' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:post_types,slug',
                ],
                'singular_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'supports' => 'nullable|array',
                'author_id' => 'required|exists:users,id',
            ], [
                'slug.unique' => 'The "'.$request->slug.'" CPT Name(Slug) is already used in the system, Try with a different one.',
            ]);

            $postType = PostType::create([
                'title' => $request->title,
                'slug' => $request->slug,
                'author' => $request->author_id,
                'singular_name' => $request->singular_name,
                'supports' => implode(',', $request->supports),
                'status' => $request->status,
                'visibility' => $request->visibility,
                'password' => ($request->visibility == 'protected' ? $request->password : ''),
                'description' => $request->description,
            ]);
            
            return redirect()->route('posttype.edit', $postType->id)->with('success', 'Post type created successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Inertia::render('Admin/PostTypes/Create', [
                'users' => $users,
                'errors' => $e->errors(),
                'formData' => $request->all(),
            ]);
        } catch (\Exception $e) {
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
     * Show the form for editing the specified post type.
     *
     * This method retrieves the post type data and the necessary options 
     * (users) for editing and returns the view to edit the post type.
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
        $postType = PostType::findOrFail($id);
        if (!$postType) {
            abort(404, 'Post Type not found');
        }
        $postType->supports = explode(',', $postType->supports);
        
        return Inertia::render('Admin/PostTypes/Edit', [
            'postType' => $postType,
            'users' => $users, 
        ]);
    }

    /**
     * Update the specified post type in the database.
     *
     * This method validates the update request, updates the post type 
     * with new values. 
     * It handles errors and redirects to the post type edit page upon successful update.
     *
     * @param \Illuminate\Http\Request $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $postType = PostType::findOrFail($id);
        $users = User::select('id', 'name')->get();

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'slug' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:post_types,slug,'. $id,
                ],
                'singular_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'supports' => 'nullable|array',
                'author_id' => 'required|exists:users,id',
            ], [
                'slug.unique' => 'The "'.$request->slug.'" CPT Name(Slug) is already used in the system, Try with a different one.',
            ]);
            
            $postType->update([
                'title' => $request->title,
                'slug' => $request->slug,
                'author' => $request->author_id,
                'singular_name' => $request->singular_name,
                'supports' => implode(',', $request->supports),
                'status' => $request->status,
                'visibility' => $request->visibility,
                'password' => ($request->visibility == 'protected' ? $request->password : ''),
                'description' => $request->description,
            ]);

            return redirect()->route('posttype.edit', $id)->with('success', 'Post type updated successfully.');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Inertia::render('Admin/PostTypes/Edit', [
                'errors' => $e->errors(),
                'formData' => $request->all(),
                'postType' => $postType,
                'users' => $users,
            ]);
        } catch (\Exception $e) {
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
     * This method updates the status of a post type to 'trash' or 
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
            
            $postType = PostType::findOrFail($id);
            $referer = $request->headers->get('referer');

            if ($status == 'delete') {
                $postType->delete();
                $message = 'Post type successfully deleted';
            } elseif ($status == 'trash') {
                $postType->status = $status;
                $postType->save();
                $message = 'Post type successfully moved to trash';
            } elseif ($status == 'publish') {
                $postType->status = $status;
                $postType->save();
                $message = 'Post type has been published';
            } elseif ($status == 'draft') {
                $postType->status = $status;
                $postType->save();
                $message = 'Post type has been restored from trash';
            }  
            
            if (strpos($referer, route('posttype.edit', $postType->id)) !== false) {
                return redirect()->route('posttype.index')->with('success', $message);
            } else {
                return back()->with('success', $message);
            }


        } catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while moving the post to trash. Please try again.';
                Log::error('PostType Error: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->back()->with('error', $error);
        }
    }

    /**
     * Perform bulk actions on selected post types.
     *
     * This method handles bulk actions like deleting or moving post types to trash 
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
                PostType::whereIn('id', $ids)->delete();
                $message = 'Selected post type successfully deleted';
            } else if ($status == 'move_to_trash') {
                PostType::whereIn('id', $ids)->update(['status' => 'trash']);
                $message = 'Selected post type successfully moved to trash';
            }
            else if ($status == 'restore') {
                PostType::whereIn('id', $ids)->update(['status' => 'draft']);
                $message = 'Selected post type has been restored from trash';
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