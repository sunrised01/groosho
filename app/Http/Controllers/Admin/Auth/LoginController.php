<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;



class LoginController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        // Attempt to authenticate the user
        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            // Check if the user is active and has the correct role
            $user = Auth::user();
            
            if ($user->roles->isEmpty()) {
                return response()->json(['message' => 'No roles assigned to the user.']);
            }

            $roles = $user->roles->pluck('name')->sort()->values()->toArray();
            
            if (in_array('admin', $roles)) {
                return redirect()->route('admin.dashboard');  // Redirect to Admin Dashboard
            } else {
                return redirect()->route('customer.dashboard');  // Redirect to Customer Dashboard
            }
        }

        return back()->withErrors([
            'email' => 'The provided credentials are incorrect.',
        ]);
        
    }
}
