<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Posts;
use Inertia\Inertia;
use App\Models\PostType;
use App\Models\User;


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

        $posts = $query->with('postTypes')->paginate($perPage);

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

    public function create()
    {
        $users = User::select('id', 'name')->get();
        return Inertia::render('Admin/Posts/Create', [
            'users' => $users
        ]);
    }

    public function edit($postType, $post)
    {
        $post = Posts::findOrFail($post);

        return view('posts.edit', compact('post', 'postType'));
    }

    
    public function update(Request $request, $postType, $post)
    {
        
    }

    
    public function destroy($postType, $post)
    {
       
    }
}
