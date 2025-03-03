<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Taxonomies;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;


class TermsController extends Controller
{
      /**
     * Show the term index page.
     *
     *
     * @return \Inertia\Response
     */
    public function index(Request $request, $taxonomy)
    {
        $taxonomyData = Taxonomies::where('taxonomy_name', $taxonomy)->first();
    
        return Inertia::render('Admin/Terms/Index', [
            'taxonomyData' => $taxonomyData,
        ]);
    }

   public function store(Request $request){

   }
}
