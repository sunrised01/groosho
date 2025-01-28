<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if the user is authenticated and is an admin

        if (Auth::check() && in_array('admin', Auth::user()->roles->pluck('name')->sort()->values()->toArray())) {
            return $next($request);
        }
       
        return redirect('/')->with('error','You have not admin access'); // or any route you prefer
    }
}
