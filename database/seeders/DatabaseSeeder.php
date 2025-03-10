<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\ConfigurationSeeder;
use Database\Seeders\PostTypesSeeder;
use Database\Seeders\TaxonomiesSeeder;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create();
        $this->call(RoleSeeder::class);
        $this->call(ConfigurationSeeder::class);
        $this->call(PostTypesSeeder::class);
        $this->call(TaxonomiesSeeder::class);
    }
}
