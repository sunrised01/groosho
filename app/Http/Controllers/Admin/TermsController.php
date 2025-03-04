<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Taxonomies;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\App;
use App\Models\Terms;


class TermsController extends Controller
{
      /**
     * Show the term index page.
     *
     *
     * @return \Inertia\Response
     */
    public function index(Request $request, $taxonomy)
    {
        $taxonomyData = Taxonomies::where('taxonomy_name', $taxonomy)->first();
        $parentCategories = Terms::select('id', 'name')->get();

        
        $terms = Terms::where('parent_id', 0)
            ->with('childrens')  
            ->with('attachmentData')  
            ->get()
            ->map(function ($term) {
                if ($term->attachmentData) {
                    $term->attachment = [
                        'small_url' => asset('storage/' . $term->attachmentData->small_path),   
                        'thumb_url' => asset('storage/' . $term->attachmentData->thumb_path),   
                        'original_url' => asset('storage/' . $term->attachmentData->path),   
                    ]; 
                    unset($term->attachmentData);
                }

                $term->childrens->each(function ($child) {
                    $child->attachment = $this->processAttachmentData($child);
                    unset($child->attachmentData); 
                    $this->processDescendants($child);
                });

                return $term;
            });
        
        return Inertia::render('Admin/Terms/Index', [
            'taxonomyData' => $taxonomyData,
            'parentCategories' => $parentCategories,
            'terms' => $terms,
           
        ]);
    }

    
    /**
     * Recursive function to process image data and set image_url
     */
    function processAttachmentData($term) {
        if ($term->attachmentData) {
            $imageUrl = [
                'small_url' => asset('storage/' . $term->attachmentData->small_path),   
                'thumb_url' => asset('storage/' . $term->attachmentData->thumb_path),   
                'original_url' => asset('storage/' . $term->attachmentData->path),   
            ];
            
            unset($term->attachmentData); 
            return $imageUrl;
        }

        return null;
    }

    /**
     * Recursive function to process descendants (grandchildren, etc.)
     */
    function processDescendants($term) {
        $term->childrens->each(function ($child) use ($term) {
            $child->attachment = $this->processAttachmentData($child);
            $this->processDescendants($child); 
        });
    }

    public function store(Request $request){
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:terms,slug',
                ],
                'description' => 'nullable|string',
            ], [
                'slug.unique' => 'The "'.$request->slug.'" Slug is already used in the system, Try with a different one.',
            ]);

            // Create the new post type with the validated data
            $term = Terms::create([
                'name' => $request->name,
                'slug' => $request->slug,
                'parent_id' => $request->parent_id,
                'attachment_id' => $request->attachment_id,
                'description' => $request->description,
            ]);
            
            return redirect()->route('term.index', $request->taxonomy)->with('success', $request->taxonomy.' created successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            
            $responseData = [
                'errors' => $e->errors(), 
                'formData' => $request->all()
            ];

            return redirect()->route('term.index', ['taxonomy' => $request->taxonomy])
                 ->with('response', $responseData);

        } catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while creating the '.$request->taxonomy.'. Please try again.';
                Log::error('Error updating post type: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }

            $responseData = [
                'errors' => ['general' => $error], 
                'formData' => $request->all()
            ];

            return redirect()->route('term.index', ['taxonomy' => $request->taxonomy])
                 ->with('response', $responseData);
        }
   }
}
