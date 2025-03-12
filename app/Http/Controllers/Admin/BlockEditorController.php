<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Posts;
use Inertia\Inertia;


class BlockEditorController extends Controller
{
    public function index(Request $request, $post_id)
    {
        $post = Posts::find($post_id);
        if (!$post) {
            abort(404, 'Post not found');
        }

        return Inertia::render('Admin/BlockEditor/Index', [
            'post' => $post,
        ]);
    }

    public function preview(Request $request, $post_id)
    {
        $post = Posts::find($post_id);
        if (!$post) {
            abort(404, 'Post not found');
        }

        return Inertia::render('Admin/BlockEditor/Preview', [
            'post' => $post,
        ]);
    }

}
