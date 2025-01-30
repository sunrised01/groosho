<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
     /**
     * Display admin settings view
     */
    public function index()
    {
        return Inertia::render('Admin/Settings');
    }

    public function saveSettings(Request $request)
    {
        $validated = $request->validate([
            'siteTitle' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'adminEmail' => 'required|email',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            'favicon' => 'nullable|image|mimes:ico,png',
            'timezone' => 'required|string',
        ]);

        // Save the settings and handle file uploads
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
        }

        if ($request->hasFile('favicon')) {
            $faviconPath = $request->file('favicon')->store('favicons', 'public');
        }

        echo $logoPath;

        echo "<br>";

        echo $faviconPath;
        die;

        // Save settings to the database or configuration
        // You can save the paths in the database or save them as configuration

        return redirect()->route('settings.page')->with('success', 'Settings saved successfully');
    }
}
