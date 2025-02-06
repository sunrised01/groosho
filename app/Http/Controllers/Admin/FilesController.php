<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Files;
use Illuminate\Support\Facades\Storage;

class FilesController extends Controller
{
    /**
     * Display admin files view
     */
    public function index()
    {        
        $files = Files::orderBy('created_at', 'desc')->paginate(12);

       
        $filesData = $files->map(function ($file) {
            if (strpos($file->type, 'image/') !== false) {
                $file->display_url = asset('storage/' . $file->small_path);
            } else {
                $file->display_url = asset('storage/' . $file->path);
            }
            $file->url = asset('storage/' . $file->path);
            return $file;
        });

        return Inertia::render('Admin/Files', [
            'files' => $filesData, 
            'pagination' => [
                'current_page' => $files->currentPage(),
                'last_page' => $files->lastPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
            ]
        ]);
    }

    /**
     * Handle file upload.
     */
    public function store(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpg,png,jpeg,gif,webp,avi,pdf|max:10240',
        ]);

        if ($validator->fails()) {
            // Return the validation errors in JSON format
            return response()->json([
                'errors' => $validator->errors(),
            ], 422); // 422 is the standard code for validation errors
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $fileSize = $file->getSize();
        
        if ($fileSize >= 1073741824) {
            $fileSize = number_format($fileSize / 1073741824, 2) . ' GB';
        } elseif ($fileSize >= 1048576) {
            $fileSize = number_format($fileSize / 1048576, 2) . ' MB';
        } elseif ($fileSize >= 1024) {
            $fileSize = number_format($fileSize / 1024, 2) . ' KB';
        } else {
            $fileSize = $fileSize . ' bytes';
        }

        $currentDate = now();
        $year = $currentDate->format('Y');
        $month = $currentDate->format('m');
        $day = $currentDate->format('d');

        $path = "uploads/{$year}/{$month}/{$day}/";
     
       if (!Storage::disk('public')->exists($path)) {
            Storage::disk('public')->makeDirectory($path, 0755, true); 
        }
        
         $fileName = pathinfo($originalName, PATHINFO_FILENAME);
        $uniqueName = $fileName . '.' . $extension;
        $counter = 1;

        while (Storage::exists($path . $uniqueName)) {
            $uniqueName = $fileName . '_' . $counter . '.' . $extension;
            $counter++;
        }

        $file->storeAs($path, $uniqueName, 'public');
     
      
        $filePath = $path . $uniqueName;
        $fileType = $file->getClientMimeType();

        if (in_array($fileType, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
            $localPath = Storage::disk('public')->path($filePath);

            $this->resizeImage($localPath, $path, $uniqueName, 300, 300, 'thumb');
            $this->resizeImage($localPath, $path, $uniqueName, 150, 150, 'small');
            
            $resizedPaths = [
                'original' => $filePath,
                'small' => $path . 'small_' . $uniqueName,
                'thumb' => $path . 'thumb_' . $uniqueName,
            ];
        } else {
            $resizedPaths = [
                'original' => $filePath,
            ];
        }

        $insertData = [
            'title' => $fileName,
            'name' => $uniqueName,
            'author' => auth()->user()->id,
            'file_size' => $fileSize,
            'path' => $resizedPaths['original'],
            'type' => $fileType,
            'small_path' => $resizedPaths['small'] ?? null,
            'thumb_path' => $resizedPaths['thumb'] ?? null,
        ];

        $file = Files::create($insertData);

        if (strpos($file->type, 'image/') !== false) {
            $file['display_url'] = asset('storage/' . $file->small_path);
        } else {
            $file['display_url'] = asset('storage/' . $file->path);
        }
        $file['url'] = asset('storage/' . $file->path);

        return response()->json($file, 200);
    }

    /**
     * Resize image using PHP's GD library.
     */
    private function resizeImage($filePath, $path, $uniqueName, $width, $height, $size)
    {
    
        // Get image details
        list($originalWidth, $originalHeight, $imageType) = getimagesize($filePath);

       
        // Create image from file based on its type
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                $image = imagecreatefromjpeg($filePath);
                break;
            case IMAGETYPE_PNG:
                $image = imagecreatefrompng($filePath);
                break;
            case IMAGETYPE_GIF:
                $image = imagecreatefromgif($filePath);
                break;
            case IMAGETYPE_WEBP:
                $image = imagecreatefromwebp($filePath);
                break;
            default:
                throw new \Exception('Unsupported image type');
        }

        // Create a new empty image with the desired dimensions
        $resizedImage = imagecreatetruecolor($width, $height);

        // Resize the image
        imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $width, $height, $originalWidth, $originalHeight);

        // Optional: Sharpen the image (this is a basic method, not as advanced as the Spatie one)
        imagefilter($resizedImage, IMG_FILTER_CONTRAST, -10);

        // Save the resized image to the storage path
        $resizedFilePath = storage_path('app/public/' . $path . $size . '_' . $uniqueName);
       
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                imagejpeg($resizedImage, $resizedFilePath, 90);
                break;
            case IMAGETYPE_PNG:
                imagepng($resizedImage, $resizedFilePath);
                break;
            case IMAGETYPE_GIF:
                imagegif($resizedImage, $resizedFilePath);
                break;
            case IMAGETYPE_WEBP:
                imagewebp($resizedImage, $resizedFilePath);
                break;
        }

        // Free up memory
        imagedestroy($image);
        imagedestroy($resizedImage);
    }

     /**
     * Update file information.
     */

    public function update(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'title' => 'string|max:255',
            'caption' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Find the file by ID and update the information
        $file = Files::findOrFail($request->id);
        $file->title = $validated['title'];
        $file->caption = $validated['caption'];
        $file->description = $validated['description'];
        $file->save();

        // Return a JSON response indicating success
        return response()->json([
            'message' => 'File information updated successfully!',
        ]);
    }

    /**
     * Fetch files
     */
    public function fetchFiels(Request $request)
    {
        $perPage = 12; 
        $page = $request->input('page', 1);

        $filesQuery = Files::orderBy('created_at', 'desc');
        $files = $filesQuery->paginate($perPage, ['*'], 'page', $page);

        $filesData = $files->map(function ($file) {
            if (strpos($file->type, 'image/') !== false) {
                $file->display_url = asset('storage/' . $file->small_path);
            } else {
                $file->display_url = asset('storage/' . $file->path);
            }
            $file->url = asset('storage/' . $file->path);
            return $file;
        });

        return response()->json([
            'files' => $filesData,
            'pagination' => [
                'current_page' => $files->currentPage(),
                'last_page' => $files->lastPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
            ]
        ]);
    }

    /**
     * Delete a file.
     */
    public function destroy($id)
    {
        $file = Files::findOrFail($id);
        if (Storage::exists($file->path)) {
            Storage::delete($file->path);
        }
        if($file->small_path != null){
            if (Storage::exists($file->small_path)) {
                Storage::delete($file->small_path);
            }
        }
        if($file->thumb_path != null){
            if (Storage::exists($file->thumb_path)) {
                Storage::delete($file->thumb_path);
            }
        }
        $file->delete();
        return response()->json(['message' => 'File deleted successfully']);
    }
}
