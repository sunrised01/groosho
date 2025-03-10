<?php
use \App\Models\Configurations;
use \App\Models\Files;

if (!function_exists('get_config')) {
    /**
     * Retrieve configuration value from the database
     * 
     * @param string $key
     * @return mixed
     */
    function get_config($key)
    {
        return Configurations::where('key', $key)->value('value');
    }
}

if (!function_exists('get_attchment')) {
    /**
     * Retrieve placeholder value from the database
     * 
     * @param string $key
     * @return mixed
     */
    function get_attachment($key)
    {
        $attchments = [];
        $result = Configurations::where('key', $key)->first();
        if (!$result) {
            return $attchments;
        }

        $file = Files::find($result->value);
        if (!$file) {
            return $attchments;
        }

        $attchments = [
            'original_url' => asset('storage/' . $file->file_path),
            'featured_url' => $file->featured_path ? asset('storage/' . $file->featured_path) : '',
            'thumbnail_url' => $file->thumbnail_path ? asset('storage/' . $file->thumbnail_path) : '',
        ];

        return $attchments;
    }

    if (!function_exists('get_permalink')) {

        function get_permalink($slug='', $type = 'post')
        {
            $baseUrl = env('APP_URL');

            switch ($type) {
                case 'page':
                    return route('page.show', ['slug' => $slug]);
                case 'post':
                default:
                    return route('post.show', ['slug' => $slug]);
            }
        }
    }
}
