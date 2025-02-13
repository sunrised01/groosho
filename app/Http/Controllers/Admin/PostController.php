<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Posts;


class PostController extends Controller
{
    /**
     * Display a listing of posts for the given post type.
     *
     * @param  string  $postType
     * @return \Illuminate\View\View
     */
    public function index($postType)
    {
        // Ensure the post type is valid (e.g., post, page, event, movie, etc.)
        $validPostTypes = ['post', 'page', 'event', 'movie']; // Add more as needed

        if (!in_array($postType, $validPostTypes)) {
            abort(404, 'Post type not found');
        }

        // Fetch posts based on the post type
        $posts = Posts::where('post_type', $postType)->get();

        return view('posts.index', compact('posts', 'postType'));
    }

    /**
     * Show the form for editing the specified post.
     *
     * @param  string  $postType
     * @param  int  $post
     * @return \Illuminate\View\View
     */
    public function edit($postType, $post)
    {
        // Ensure the post exists
        $post = Posts::findOrFail($post);

        return view('posts.edit', compact('post', 'postType'));
    }

    /**
     * Update the specified post in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $postType
     * @param  int  $post
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $postType, $post)
    {
        // Validate the request
        $request->validate([
            'post_title' => 'required|string|max:255',
            'post_content' => 'required|string',
        ]);

        // Ensure the post exists
        $post = Posts::findOrFail($post);

        // Update the post fields
        $post->update([
            'post_title' => $request->input('post_title'),
            'post_content' => $request->input('post_content'),
            'post_slug' => str_slug($request->input('post_title')), // Example of creating a slug
        ]);

        return redirect()->route('posts.index', ['post_type' => $postType])
            ->with('success', 'Post updated successfully');
    }

    /**
     * Remove the specified post from storage.
     *
     * @param  string  $postType
     * @param  int  $post
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($postType, $post)
    {
        // Ensure the post exists
        $post = Posts::findOrFail($post);

        // Delete the post
        $post->delete();

        return redirect()->route('posts.index', ['post_type' => $postType])
            ->with('success', 'Post deleted successfully');
    }
}
