<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\FilesController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\CptController;
use App\Http\Controllers\Admin\PostTypeController;
use App\Http\Controllers\Admin\TaxonomiesController;
use App\Http\Controllers\Admin\TermsController;
use App\Http\Middleware\AdminMiddleware;

// Public Route: Home Page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),  
        'canRegister' => Route::has('register'),  
        'laravelVersion' => Application::VERSION,  
        'phpVersion' => PHP_VERSION,  
        'error' => session('error')  
    ]);
});    

// Auth Routes for 'guest' middleware (only accessible to users not logged in)
Route::middleware('guest')->group(function () {
    // Show login form
    Route::get('admin/login', [LoginController::class, 'create'])
        ->name('admin.login');  

        // Process login request
    Route::post('admin/login', [LoginController::class, 'store'])
        ->name('admin.post.login');  
});

// Dashboard Route (only accessible by authenticated users)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard'); 
})->middleware(['auth', 'verified']) ->name('dashboard');

// Admin Routes (only accessible by users with 'admin' middleware)
Route::prefix('admin')->middleware(['admin', AdminMiddleware::class])->group(function () {

    // Admin Dashboard Home
    Route::get('/', [DashboardController::class, 'index']);  
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('admin.dashboard');
    
    // Settings Page for Admin
    Route::get('/settings', [SettingsController::class, 'index'])->name('admin.settings'); 
    Route::post('/save-settings', [SettingsController::class, 'saveSettings'])->name('settings.save');
    
    // File Management Routes (CRUD for file uploads)
    Route::get('/files', [FilesController::class, 'index'])->name('files.index');  
    Route::post('/file/store', [FilesController::class, 'store'])->name('files.save'); 
    Route::post('/file/update', [FilesController::class, 'update'])->name('files.update');  
    Route::delete('/file/{id}', [FilesController::class, 'destroy'])->name('files.destroy'); 
    Route::get('/api/files', [FilesController::class, 'fetchFiles'])->name('files.fetch'); 

    // Custom Post Types Management Routes
    Route::get('/cpt', [CptController::class, 'index'])->name('cpt.index'); 
    Route::post('/cpt/fetch', [CptController::class, 'fetch'])->name('cpt.fetch'); 
   
    // Post Types Routes
    Route::prefix('cpt')->group(function () {
        Route::get('/posttypes', [PostTypeController::class, 'index'])->name('posttype.index');
        Route::get('posttype/create', [PostTypeController::class, 'create'])->name('posttype.create');
        Route::post('posttype/create', [PostTypeController::class, 'store'])->name('posttype.store');
        Route::get('posttype/{id}/edit', [PostTypeController::class, 'edit'])->name('posttype.edit');
        Route::post('posttype/{id}/edit', [PostTypeController::class, 'update'])->name('posttype.update');
        Route::put('posttype/{id}/{status}', [PostTypeController::class, 'updateStatus'])->name('posttype.update.status');
        Route::post('posttype/bluk/{status}', [PostTypeController::class, 'bulkAction'])->name('posttype.bulk.action');

         // Taxonomies Routes
        
        Route::get('/taxonomies', [TaxonomiesController::class, 'index'])->name('taxonomies.index');
        Route::get('taxonomy/create', [TaxonomiesController::class, 'create'])->name('taxonomy.create');
        Route::post('taxonomy/create', [TaxonomiesController::class, 'store'])->name('taxonomy.store');
        Route::get('taxonomy/{id}/edit', [TaxonomiesController::class, 'edit'])->name('taxonomy.edit');
        Route::post('taxonomy/{id}/edit', [TaxonomiesController::class, 'update'])->name('taxonomy.update');
        Route::put('taxonomy/{id}/{status}', [TaxonomiesController::class, 'updateStatus'])->name('taxonomy.update.status');
        Route::post('taxonomy/bluk/{status}', [TaxonomiesController::class, 'bulkAction'])->name('taxonomy.bulk.action');
    });
    
    Route::prefix('pt')->group(function () {
        // Post Management Routes (for handling different post types)
        Route::get('{post_type}', [PostController::class, 'index'])->name('posts.index'); 
        Route::get('{post_type}/create', [PostController::class, 'create'])->name('posts.create');  
        Route::get('{post_type}/{post}/edit', [PostController::class, 'edit'])->name('posts.edit'); 
        Route::put('{post_type}/{post}', [PostController::class, 'update'])->name('posts.update');  
        Route::delete('{post_type}/{post}', [PostController::class, 'destroy'])->name('posts.destroy');  
    });

    Route::prefix('term')->group(function () {
        // Term Management Routes (for handling different post types)
        Route::get('{taxonomy}', [TermsController::class, 'index'])->name('term.index'); 
        Route::post('{taxonomy}/store', [TermsController::class, 'store'])->name('term.store'); 
        Route::get('{taxonomy}/{term_id}/edit', [TermsController::class, 'edit'])->name('term.edit'); 
        Route::put('{taxonomy}/{term_id}/update', [TermsController::class, 'update'])->name('term.update');  
        Route::delete('{taxonomy}/{term_id}/delete', [TermsController::class, 'destroy'])->name('term.delete');
        Route::post('{taxonomy}/bluk/delete', [TermsController::class, 'bulkDelete'])->name('term.bulk.delete');
  
    });
 
});

// Routes for managing user profiles (auth middleware ensures user is logged in)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Authentication routes (defined in auth.php)
require __DIR__.'/auth.php';  // Include the default auth routes for login, registration, etc.
