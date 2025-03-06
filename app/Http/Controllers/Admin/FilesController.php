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
     * Display admin files view.
     * 
     * This function retrieves the list of files from the database, sorts them by creation date in descending 
     * order, and paginates the results. It then adds preview URLs for each file depending on its mime type (for images, 
     * it uses the small-sized image). It returns an Inertia response with the file data and pagination details.
     * 
     * @return \Inertia\Response
     */
    public function index()
    {        
        $files = Files::orderBy('created_at', 'desc')->paginate(12);

        $filesData = $files->map(function ($file) {
            if (strpos($file->mime_type, 'image/') !== false) {
                $file->preview_url = asset('storage/' . $file->small_path);
            } else {
                $file->preview_url = asset('storage/' . $file->path);
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
     * 
     * This function processes file uploads. It first validates the file's size, then stores it in a structured 
     * directory format based on the current date. If the file is an image, it resizes the image into both a small 
     * and a thumbnail size. Finally, it creates a new record in the database with information such as file name, 
     * size, paths, and mime type.
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
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
            'mime_type' => $fileType,
            'small_path' => $resizedPaths['small'] ?? null,
            'thumb_path' => $resizedPaths['thumb'] ?? null,
        ];

        $file = Files::create($insertData);

        if (strpos($file->mime_type, 'image/') !== false) {
            $file['preview_url'] = asset('storage/' . $file->small_path);
        } else {
            $file['preview_url'] = asset('storage/' . $file->path);
        }
        $file['url'] = asset('storage/' . $file->path);

        return response()->json($file, 200);
    }

    /**
     * Resize image using PHP's GD library.
     * 
     * This function resizes an image to the specified dimensions and applies a slight contrast filter. It saves 
     * the resized image in the appropriate folder with a prefix indicating its size (thumb, small).
     * 
     * @param string $filePath
     * @param string $path
     * @param string $uniqueName
     * @param int $width
     * @param int $height
     * @param string $size
     */
    private function resizeImage($filePath, $path, $uniqueName, $width, $height, $size)
    {
        list($originalWidth, $originalHeight, $imageType) = getimagesize($filePath);

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

        $resizedImage = imagecreatetruecolor($width, $height);

        imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $width, $height, $originalWidth, $originalHeight);

        imagefilter($resizedImage, IMG_FILTER_CONTRAST, -10);

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

        imagedestroy($image);
        imagedestroy($resizedImage);
    }

    /**
     * Update file information.
     * 
     * This function validates the provided data (title, caption, and description) for the file and updates the 
     * record in the database. It returns a JSON response indicating success.
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'caption' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $file = Files::findOrFail($request->id);
        $file->title = $validated['title'];
        $file->caption = $validated['caption'];
        $file->description = $validated['description'];
        $file->save();

        return response()->json([
            'message' => 'File information updated successfully!',
        ]);
    }

    /**
     * Fetch Files.
     * 
     * This function retrieves files based on the query parameters such as file type and pagination. It supports filtering 
     * for specific file types (e.g., images or videos) and returns the paginated list of files along with pagination details.
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchFiles(Request $request)
    {
        $perPage = 20; 
        $page = $request->input('page', 1);
        $filetype = $request->input('filetype', '');

        $filesQuery = Files::orderBy('created_at', 'desc');
        
        if ($filetype === 'image') {
            $filesQuery->whereIn('mime_type', ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']);
        } elseif ($filetype === 'video') {
            $filesQuery->whereIn('mime_type', ['video/mp4', 'video/avi', 'video/mkv', 'video/webm', 'video/quicktime']);
        }

        $files = $filesQuery->paginate($perPage, ['*'], 'page', $page);

        $filesData = $files->map(function ($file) {
            if (strpos($file->mime_type, 'image/') !== false) {
                $file->preview_url = asset('storage/' . $file->small_path);
            } else {
                $file->preview_url = asset('storage/' . $file->path);
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
     * 
     * This function deletes the file from both the storage and the database. It ensures that both the main file 
     * and any related resized versions (thumbnail, small size) are removed from storage before deleting the record.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
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
