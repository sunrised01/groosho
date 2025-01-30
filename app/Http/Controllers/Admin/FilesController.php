<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Files;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use File;

class FilesController extends Controller
{
    /**
     * Display admin files view
     */
    public function index()
    {
        $files = Files::all();
        return Inertia::render('Admin/Files', ['files' => $files]);
    }

    /**
     * Handle file upload.
     */
    public function store(Request $request)
    {
        // Validate incoming file
        $request->validate([
            'file' => 'required|file|mimes:jpg,png,jpeg,gif,webp,mp4,avi,pdf|max:10240',
        ]);

        // Get the file from the request
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        
        // Get current date for folder structure (year/month/day)
        $currentDate = now();
        $year = $currentDate->format('Y');
        $month = $currentDate->format('m');
        $day = $currentDate->format('d');

        // Create directory path in storage (storage/app/files/year/month/day)
        $path = "files/{$year}/{$month}/{$day}/";
     
       // Check if the directory exists, if not, create it
       if (!Storage::disk('public')->exists($path)) {
            Storage::disk('public')->makeDirectory($path, 0755, true); // 0755 gives proper permissions
        }
        
        // Check if the file exists in the storage folder and create a unique name if necessary
        $fileName = pathinfo($originalName, PATHINFO_FILENAME);
        $uniqueName = $fileName . '.' . $extension;
        $counter = 1;

        while (Storage::exists($path . $uniqueName)) {
            $uniqueName = $fileName . '_' . $counter . '.' . $extension;
            $counter++;
        }

        // Save the file in the desired directory with a unique name
        $file->storeAs($path, $uniqueName);
      
        // Handle image resizing if the file is an image
        $filePath = $path . $uniqueName;
        $fileType = $file->getClientMimeType();

        // if (in_array($fileType, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
        //     // Resize image for different sizes (original, 300x300, 100x100)
        //     $this->resizeImage(Storage::path($filePath), $path, $uniqueName, 300, 300, 'small');
        //     $this->resizeImage(Storage::path($filePath), $path, $uniqueName, 100, 100, 'thumb');
            
        //     // Store resized images paths in the database
        //     $resizedPaths = [
        //         'original' => $filePath,
        //         'small' => $path . 'small_' . $uniqueName,
        //         'thumb' => $path . 'thumb_' . $uniqueName,
        //     ];
        // } else {
        //     // For non-image files, save original path only
        //     $resizedPaths = [
        //         'original' => $filePath,
        //     ];
        // }

        $resizedPaths = [
            'original' => $filePath,
        ];

        // Save file information in the database
        $fileRecord = Files::create([
            'name' => $originalName,
            'path' => $resizedPaths['original'],
            'type' => $fileType,
            'small_path' => $resizedPaths['small'] ?? null,
            'thumb_path' => $resizedPaths['thumb'] ?? null,
        ]);

        // Return success response
        return response()->json(['message' => 'File uploaded successfully', 'file' => $fileRecord], 200);
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
        $resizedFilePath = storage_path('app/' . $path . $size . '_' . $uniqueName);
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
     * Delete a file.
     */
    public function destroy(Files $file)
    {
        // Delete file from storage
        Storage::delete($file->path);
        Storage::delete($file->small_path);
        Storage::delete($file->thumb_path);

        // Delete file record from database
        $file->delete();

        return response()->json(['message' => 'File deleted successfully']);
    }
}
