<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\PostType;


class PostTypeExists
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {        
        $postType = PostType::where('slug', $request->post_type)->first();
        if (!$postType) {
            abort(404, 'Post Type not found');
        }
        return $next($request);
    }
}
