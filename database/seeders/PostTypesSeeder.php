<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PostType;

class PostTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $postTypeInputData = [
            [
                'title' => 'Posts',
                'slug' => 'post',
                'author' => 1,
                'singular_name' => 'Post',
                'supports' => 'title,editor,featured_image,author',
                'status' => 'publish',
                'visibility' => 'public',
                'password' => '',
                'description' => '',
            ],
            [
                'title' => 'Pages',
                'slug' => 'page',
                'author' => 1,
                'singular_name' => 'Page',
                'supports' => 'title,editor,featured_image,author',
                'status' => 'publish',
                'visibility' => 'public',
                'password' => '',
                'description' => '',
            ]
        ];

        foreach ($postTypeInputData as $postData) {
            PostType::create($postData);
        }
    }
}
