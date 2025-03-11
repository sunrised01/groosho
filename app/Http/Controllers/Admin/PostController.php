<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Posts;
use Inertia\Inertia;
use App\Models\PostType;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Str;


class PostController extends Controller
{
   
    public function index(Request $request, $post_type)
    {
        $postType = PostType::where('slug', $post_type)->with('taxonomies')->first();

        $search = urldecode($request->input('s', ''));
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'asc'); 
        $orderColumn = $request->input('order_column', 'title'); 
        $dateFilter = $request->input('date_filter', 'all'); 
        $status = $request->input('status', '');

        $query = Posts::query();
        
        if (!empty($search)) {
            $words = explode(' ', $search);  
            foreach ($words as $word) {
                $query->orWhere(function ($q) use ($word) {
                    $q->where('title', 'like', "%{$word}%");
                });
            }
        }

        $query->where('post_type', $post_type); 
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

        $posts = $query->with('author')->paginate($perPage);

        $months = Posts::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month')
        ->groupBy('year', 'month')
        ->orderByDesc('year')
        ->orderByDesc('month')
        ->get()
        ->map(function ($item) {
            $monthName = \Carbon\Carbon::create($item->year, $item->month, 1)->format('M Y');
            return ['value' => "{$item->year}-{$item->month}", 'label' => $monthName]; 
        });

        $totalCount = Posts::where('status', '!=', 'trash')->count();
        $publishCount = Posts::where('status', 'publish')->count();
        $trashCount = Posts::where('status', 'trash')->count();
        $draftCount = Posts::where('status', 'draft')->count();

        return Inertia::render('Admin/Posts/Index', [
            'postType' => $postType,
            'posts' => $posts,
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
            'filters' => $request->only(['s', 'per_page', 'order_by', 'order_column', 'date_filter', 'status']),
            'months' => $months,
            'totalCount' => $totalCount,  
            'publishCount' => $publishCount,  
            'trashCount' => $trashCount,
            'draftCount' => $draftCount,
        ]);
    }

    public function create(Request $request, $post_type)
    {
        $users = User::select('id', 'name')->get();
        $postType = PostType::where('slug', $post_type)->first();
        return Inertia::render('Admin/Posts/Create', [
            'users' => $users,
            'postType' => $postType,
        ]);
    }

    

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'author_id' => 'required|exists:users,id',
            ]);

            $post_title = ($request->title != '' ? $request->title : 'No Title');
            $slug = $request->slug ?: Str::slug($post_title);
            
            $originalSlug = $slug; 
            $counter = 1;
            while (Posts::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $post = Posts::create([
                'title' => $request->title,
                'slug' => $slug,
                'author_id' => $request->author_id,
                'excerpt' => $request->excerpt,
                'content' => $request->content,
                'status' => $request->status,
                'parent_id' => $request->parent_id,
                'attachment_id' => $request->attachment_id,
                'post_type' => $request->post_type,
                'visibility' => $request->visibility,
                'password' => ($request->visibility == 'protected' ? $request->password : ''),
            ]);
            
            return redirect()->route('post.edit', [$request->post_type, $post->id])->with('success', $request->post_type.' created successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
           
            return redirect()->route('post.create', [$request->post_type])
                 ->withErrors($e->errors())->with('formData', $request->all());
            
        } catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while creating the '.$request->post_type.'. Please try again.';
                Log::error('Error updating '.$request->post_type.': ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->route('post.create', [$request->post_type])
                 ->withErrors(['general' => $error])->with('formData', $request->all());
        }
    }

    public function edit(Request $request, $post_type, $post_id)
    {
        $users = User::select('id', 'name')->get();
        $postType = PostType::where('slug', $post_type)->first();
        $post = Posts::with('attchment_data')->find($post_id);

        if ($post && $post->attchment_data) {
            $post->attachment = [
                'original_url' => asset('storage/' . $post->attchment_data->file_path),
                'featured_url' => $post->attchment_data->featured_path ? asset('storage/' . $post->featured_path) : '',
                'thumbnail_url' => $post->attchment_data->thumbnail_path ? asset('storage/' . $post->thumbnail_path) : '',
            ]; 
            unset($term->attchment_data);
        }

        $post->url = get_permalink($post->slug);
     
        return Inertia::render('Admin/Posts/Edit', [
            'users' => $users,
            'postType' => $postType,
            'post' => $post,
        ]);
    }
    
    public function update(Request $request, $post_type, $post_id)
    {
        try {
            $validated = $request->validate([
                'title' => 'string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:publish,draft,trash',
                'visibility' => 'required|in:public,private,protected',
                'author_id' => 'required|exists:users,id',
            ]);
            $post = Posts::findOrFail($post_id);
            
            $post_title = ($request->title != '' ? $request->title : 'No Title');

            $post->update([
                'title' => $request->title,
                'author_id' => $request->author_id,
                'excerpt' => $request->excerpt,
                'content' => $request->content,
                'status' => $request->status,
                'parent_id' => $request->parent_id,
                'attachment_id' => $request->attachment_id,
                'post_type' => $request->post_type,
                'visibility' => $request->visibility,
                'password' => ($request->visibility == 'protected' ? $request->password : ''),
            ]);

            
            
            return redirect()->route('post.edit', [$request->post_type, $post->id])->with('success', $request->post_type.' updated successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
           
            return redirect()->route('post.edit', [$post_type, $post_id])
                 ->withErrors($e->errors())->with('formData', $request->all());
            
        } catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while updating the '.$post_type.'. Please try again.';
                Log::error('Error updating '.$post_type.': ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->route('post.edit', [$post_type, $post_id])
                 ->withErrors(['general' => $error])->with('formData', $request->all());
        }
    }

    public function updateSlug(Request $request, $post_type, $post_id)
    {
        try {
            $request->validate([
                'slug' => 'required|string|unique:posts,slug,' . $post_id
            ],
            [
                'slug.unique' => 'The "'.$request->slug.'" Slug is already used in the system, Try with a different one.',
            ]);
        
            $post = Posts::findOrFail($post_id);
            
            $post->slug = $request->slug;
            $post->save();
            
            return redirect()->route('post.edit', [$post_type, $post_id])->with('success', 'Slug has been updated successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
           
            return redirect()->route('post.edit', [$post_type, $post_id])->withErrors($e->errors());
            
        } catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while updating the '.$post_type.'. Please try again.';
                Log::error('Error updating '.$post_type.': ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
            return redirect()->route('post.edit', [$post_type, $post_id])
                 ->withErrors(['general' => $error]);
        }
    }

     
    public function updateStatus(Request $request, $post_type, $post_id, $status)
    {
        try {
            $validStatuses = ['publish', 'draft', 'trash', 'delete'];
            
            if (!in_array($status, $validStatuses)) {
                return redirect()->back()->with('error', 'Invalid status provided.');
            }
            
            $post = Posts::findOrFail($post_id);
            $referer = $request->headers->get('referer');

            if ($status == 'delete') {
                $post->delete();
                $message = $post_type.' successfully deleted';
            } elseif ($status == 'trash') {
                $post->status = $status;
                $post->save();
                $message = $post_type.' successfully moved to trash';
            } elseif ($status == 'publish') {
                $post->status = $status;
                $post->save();
                $message = $post_type.' has been published';
            } elseif ($status == 'draft') {
                $post->status = $status;
                $post->save();
                $message = $post_type.' has been restored from trash';
            }  
            
            if (strpos($referer, route('post.edit', [$post_type, $post->id ])) !== false) {
                return redirect()->route('post.index', $post_type)->with('success', $message);
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
