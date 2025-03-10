<?php

namespace Database\Seeders;

use App\Models\Taxonomies;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaxonomiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $taxonomies = [
            [
                'title' => 'Categories',
                'slug' => 'category',
                'author' => 1,
                'singular_name' => 'Category',
                'status' => 'publish',
                'visibility' => 'public',
                'password' => '',
                'description' => '',
                'is_predefined' => 1,
            ],
            [
                'title' => 'Tags',
                'slug' => 'tag',
                'author' => 1,
                'singular_name' => 'Tag',
                'status' => 'publish',
                'visibility' => 'public',
                'password' => '',
                'description' => '',
                'is_predefined' => 1,
            ]
        ];

        foreach ($taxonomies as $taxonomyData) {
            $taxonomy = Taxonomies::create($taxonomyData);
            $taxonomy->postTypes()->attach(1);
        }

    }
}
