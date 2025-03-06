<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Taxonomies;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\App;
use App\Models\Terms;
use Illuminate\Support\Str;

class TermsController extends Controller
{
    /**
     * Show the term index page.
     * 
     * This function handles the rendering of the term index page,
     * filtering terms based on the search query, and ordering them 
     * by the specified column and direction.
     *
     * @param Request $request
     * @param string $taxonomy
     * @return \Inertia\Response
     */
    public function index(Request $request, $taxonomy)
    {
        $search = urldecode($request->input('s', ''));
        $orderBy = $request->input('order_by', 'desc');
        $orderColumn = $request->input('order_column', 'id');

        $taxonomyData = Taxonomies::where('slug', $taxonomy)->first();
        $parentCategories = Terms::select('id', 'name')->get();

        $query = Terms::where('parent_id', null)
            ->where('taxonomy', $taxonomy);

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        $query->orderBy($orderColumn, $orderBy);

        $terms = $query->with('childrens')  
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
                else{
                    $placeholder = get_attachment('placeholder');
                    $term->attachment = $placeholder; 
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
            'filters' => $request->only(['s', 'order_by']),
        ]);
    }

    /**
     * Recursive function to process image data and set image_url
     * 
     * This function processes the attachment data for a term, checking if it exists 
     * and returning the corresponding image URLs, or returning the placeholder 
     * attachment if no data is found.
     * 
     * @param $term
     * @return array
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
        else{
            $imageUrl = get_attachment('placeholder');
            return $imageUrl;
        }
    }

    /**
     * Recursive function to process descendants (grandchildren, etc.)
     * 
     * This function recursively processes the descendants of a term, 
     * ensuring that their attachment data is also processed and set correctly.
     * 
     * @param $term
     */
    function processDescendants($term) {
        $term->childrens->each(function ($child) use ($term) {
            $child->attachment = $this->processAttachmentData($child);
            $this->processDescendants($child); 
        });
    }

    /**
     * Store a new term.
     * 
     * This function handles the creation of a new term, validating the request 
     * and checking for unique slugs. It creates the term in the database 
     * and redirects to the taxonomy index with a success message.
     * 
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request){
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => [
                    'nullable',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:terms,slug',
                ],
                'description' => 'nullable|string',
            ], [
                'slug.unique' => 'The "'.$request->slug.'" Slug is already used in the system, Try with a different one.',
            ]);
            
            $slug = $request->slug ?: Str::slug($request->name);
            
            $originalSlug = $slug; 
            $counter = 1;
            while (Terms::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            $term = Terms::create([
                'name' => $request->name,
                'slug' => $slug,
                'parent_id' => $request->parent_id,
                'attachment_id' => $request->attachment_id,
                'taxonomy' => $request->taxonomy,
                'description' => $request->description,
            ]);
            
            return redirect()->route('term.index', $request->taxonomy)->with('success', $request->taxonomy.' created successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->route('term.index', ['taxonomy' => $request->taxonomy])
            ->withErrors($e->errors());
        } catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while creating the '.$request->taxonomy.'. Please try again.';
                Log::error('Error updating post type: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }
           
            return redirect()->route('term.index', ['taxonomy' => $request->taxonomy])
                 ->withErrors(['general' => $error]);
        }
    }

    /**
     * Edit an existing term.
     * 
     * This function retrieves the term data, including its attachment data, 
     * and renders the edit form for the term.
     * 
     * @param string $taxonomy
     * @param int $term_id
     * @return \Inertia\Response
     */
    public function edit($taxonomy, $term_id)
    {
        if (!is_numeric($term_id)) {
            abort(404, 'Invalid Term ID');
        }
        $taxonomyData = Taxonomies::where('slug', $taxonomy)->first();
        $parentCategories = Terms::select('id', 'name')->get();

        $term = Terms::where('id', $term_id)
            ->with('attachmentData')  
            ->first();
        if (!$term) {
            abort(404, 'Term not found');
        }

        if ($term && $term->attachmentData) {
            $term->attachment = [
                'small_url' => asset('storage/' . $term->attachmentData->small_path),   
                'thumb_url' => asset('storage/' . $term->attachmentData->thumb_path),   
                'original_url' => asset('storage/' . $term->attachmentData->path),   
            ]; 
            unset($term->attachmentData);
        }
        
        return Inertia::render('Admin/Terms/Edit', [
            'taxonomyData' => $taxonomyData,
            'parentCategories' => $parentCategories,
            'term' => $term,
        ]);
    }

    /**
     * Update an existing term.
     * 
     * This function validates the request and updates the term's details 
     * in the database, including handling the unique slug.
     * 
     * @param Request $request
     * @param string $taxonomy
     * @param int $term_id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $taxonomy, $term_id){
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'slug' => [
                    'required',
                    'string',
                    'regex:/^[a-z0-9-_]{1,20}$/',
                    'unique:terms,slug,'. $term_id,
                ],
                'description' => 'nullable|string',
            ], [
                'slug.unique' => 'The "'.$request->slug.'" Slug is already used in the system, Try with a different one.',
            ]);

            $term = Terms::findOrFail($term_id);

            $term->update([
                'name' => $request->name,
                'slug' => $request->slug,
                'parent_id' => $request->parent_id,
                'attachment_id' => $request->attachment_id,
                'taxonomy' => $request->taxonomy,
                'description' => $request->description,
            ]);
            
            return redirect()->route('term.index', $request->taxonomy)->with('success', $request->taxonomy.' updated successfully!');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        } catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while creating the '.$request->taxonomy.'. Please try again.';
                Log::error('Error updating post type: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }

            return redirect()->back()->withErrors(['general' => $error]);

        }
    }

    /**
     * Delete a term.
     * 
     * This function deletes a term from the database and detaches any children 
     * that are associated with the term, setting their parent_id to null.
     * 
     * @param Request $request
     * @param string $taxonomy
     * @param int $term_id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request, $taxonomy, $term_id)
    {
        try {
            $term = Terms::findOrFail($term_id);
            $children = $term->childrens; 
            if ($children->isNotEmpty()) {
                foreach ($children as $child) {
                    $child->parent_id = null; 
                    $child->save();
                }
            }

            $term->delete();

            return redirect()->back()->with('success', $taxonomy.' deleted successfully!');
        }
        catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while deleting the record. Please try again.';
                Log::error('Error: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }

            return redirect()->back()->withErrors(['general' => $error],);
        }
    }

    /**
     * Bulk delete terms.
     * 
     * This function allows the bulk deletion of terms based on a comma-separated list of term IDs.
     * It also handles the detachment of children for each deleted term.
     * 
     * @param Request $request
     * @param string $taxonomy
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkDelete(Request $request, $taxonomy)
    {
        try {
           
            if ($request->query('ids') == null) {
                return redirect()->back()->withErrors(['general' => 'No IDs selected.'],);
            }

            $ids = explode(',', $request->query('ids'));
            $terms = Terms::whereIn('id', $ids)->get();

            foreach ($terms as $term) {
                $children = $term->childrens; 
                if ($children->isNotEmpty()) {
                    foreach ($children as $child) {
                        $child->parent_id = null; 
                        $child->save();
                    }
                }

                $term->delete();
            }

            return redirect()->back()->with('success', $taxonomy.' deleted successfully!');
        }
        catch (\Exception $e) {
            if (App::environment('production')) {
                $error = 'An error occurred while deleting the record. Please try again.';
                Log::error('Error: ' . $e->getMessage());
            } else {
                $error = 'Error: ' . $e->getMessage();
            }

            return redirect()->back()->withErrors(['general' => $error]);
        }
    }
}
