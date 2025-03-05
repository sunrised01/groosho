<?php

if (!function_exists('get_config')) {
    /**
     * Retrieve configuration value from the database
     * 
     * @param string $key
     * @return mixed
     */
    function get_config($key)
    {
        return \App\Models\Configurations::where('key', $key)->value('value');
    }
}
