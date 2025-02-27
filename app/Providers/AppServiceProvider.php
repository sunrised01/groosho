<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

use Inertia\Inertia;
use Illuminate\Support\Facades\Session;
use App\Models\Taxonomies;
use App\Models\PostType;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $postTypes = PostType::select('id', 'title', 'cpt_name')->where('status', 'publish')->with('taxonomies')->get();


        Vite::prefetch(concurrency: 3);
        Inertia::share([
            'flash' => function () {
                return [
                    'success' => Session::get('success'),
                    'error' => Session::get('error'),
                    // You can add other session flash data if needed
                ];
            },
            'session_expiry_time' => config('session.lifetime'),
            'postTypesmenu' => $postTypes,
        ]);
    }
}
