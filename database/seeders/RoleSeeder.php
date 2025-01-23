<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the 'admin' role
        $adminRole = Role::create([
            'name' => 'admin',
        ]);

        $customerRole = Role::create([
            'name' => 'customer',
        ]);

        // Find a user (you can modify this to create a user or select one)
        $adminUser = User::first();  // For example, using the first user

        // Assign the 'admin' role to the user
        $adminUser->roles()->attach($adminRole);

         // Find all users except the first user and assign the 'customer' role
         $users = User::where('id', '!=', $adminUser->id)->get(); // Exclude the first user
         foreach ($users as $user) {
             $user->roles()->attach($customerRole);
         }

    }
}
