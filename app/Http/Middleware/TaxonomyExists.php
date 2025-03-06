<?php

namespace App\Http\Middleware;

use App\Models\Taxonomies;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TaxonomyExists
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Illuminate\Http\Response
     */
    public function handle(Request $request, Closure $next)
    {
        $taxonomy = Taxonomies::where('slug', $request->taxonomy)->first();
        if (!$taxonomy) {
            abort(404, 'Taxonomy not found');
        }
        return $next($request);
    }
}
