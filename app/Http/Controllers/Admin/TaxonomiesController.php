<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Taxonomies;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\App;


class TaxonomiesController extends Controller
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
        $query = Taxonomies::query();

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
        $taxonomies = $query->paginate($perPage);

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

        /// Count of publish post types
        $totalCount = Taxonomies::where('status', '!=', 'trash')->count();
        /// Count of publish post types
        $publishCount = Taxonomies::where('status', 'publish')->count();
        // Count of trash post types
        $trashCount = Taxonomies::where('status', 'trash')->count();
        // Count of draft post types
        $draftCount = Taxonomies::where('status', 'draft')->count();

        
        // Return the view with data to display the custom post types
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
}
