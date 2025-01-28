<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
     /**
     * index fucntion to redirect on admin dashbaord.
     */
    public function index()
    {
       return redirect('/admin/dashboard');
    }

     /**
     * Display admin dashbaord view
     */
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard');
    }
}
