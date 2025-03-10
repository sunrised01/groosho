<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Configurations;
use App\Models\Files;
use Illuminate\Support\Facades\Storage;
use Faker\Factory as Faker;

class ConfigurationSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        $imageUrl = 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';
        $imageName = basename($imageUrl); 
        $extension = pathinfo($imageName, PATHINFO_EXTENSION);
        
        $currentDate = now();
        $year = $currentDate->format('Y');
        $month = $currentDate->format('m');
        $day = $currentDate->format('d');

        $path = "uploads/{$year}/{$month}/{$day}/";
        
        // Ensure the directory exists
        if (!Storage::disk('public')->exists($path)) {
            Storage::disk('public')->makeDirectory($path, 0755, true);
        }

        $imageContents = file_get_contents($imageUrl);
        $uniqueName = pathinfo($imageName, PATHINFO_FILENAME) . '.' . $extension;
        
        // Check for filename conflict and create unique name
        $counter = 1;
        while (Storage::disk('public')->exists($path . $uniqueName)) {
            $uniqueName = pathinfo($imageName, PATHINFO_FILENAME) . '_' . $counter . '.' . $extension;
            $counter++;
        }

        // Store the file on the 'public' disk
        Storage::disk('public')->put($path . $uniqueName, $imageContents);

        $filePath = $path . $uniqueName;
        $fileSize = strlen($imageContents);
        $fileType = 'image/png'; 
        $fileName = pathinfo($uniqueName, PATHINFO_FILENAME);

        // Store the file record in the database
        $file = Files::create([
            'title' => $fileName,
            'name' => $uniqueName,
            'author' => 1, 
            'file_size' => $fileSize,
            'file_path' => $filePath,
            'thumbnail_path' => null,
            'featured_path' => null,
            'mime_type' => $fileType,
        ]);

        // Update the configuration with the file ID
        Configurations::updateOrCreate(
            ['key' => 'placeholder'],
            ['value' => $file->id]
        );

        $this->command->info('Configuration settings seeded with image!');
    }
}
