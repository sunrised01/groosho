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

        if (isset($file->small_path)) {
            $attchments['small_url'] = asset('storage/' . $file->small_path);
        }

        if (isset($file->thumb_path)) {
            $attchments['thumb_url'] = asset('storage/' . $file->thumb_path);
        }

        if (isset($file->path)) {
            $attchments['original_url'] = asset('storage/' . $file->path);
        }

        return $attchments;
    }

}
