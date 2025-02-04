<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\FilesController;

use App\Http\Middleware\AdminMiddleware;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'error' => session('error')
    ]);
});


Route::middleware('guest')->group(function () {
    Route::get('admin/login', [LoginController::class, 'create'])
        ->name('admin.login');
    Route::post('admin/login', [LoginController::class, 'store'])
        ->name('admin.post.login');
});


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


// Protect routes with 'admin' middleware and 'admin' prefix
Route::prefix('admin')->middleware(['admin', AdminMiddleware::class])->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('admin.dashboard');

    Route::get('/posts', [DashboardController::class, 'dashboard'])->name('admin.posts');

    Route::get('/settings', [SettingsController::class, 'index'])->name('admin.settings');
    Route::post('/save-settings', [SettingsController::class, 'saveSettings'])->name('settings.save');

    Route::get('/files', [FilesController::class, 'index'])->name('admin.files');
    Route::post('/file/store', [FilesController::class, 'store'])->name('files.save');
    Route::post('/file/update', [FilesController::class, 'update'])->name('files.update');
    Route::delete('/file/{id}', [FilesController::class, 'destroy'])->name('files.destroy');


    // // Manage Users
    // Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
    // Route::get('/users/{id}', [AdminController::class, 'showUser'])->name('admin.showUser');

    // // Other admin routes...
    // Route::get('/settings', [AdminController::class, 'settings'])->name('admin.settings');
    
    // // More routes can be added here as needed
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
