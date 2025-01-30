<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Files extends Model
{
    use HasFactory;

    // Define the fillable attributes for mass assignment
    protected $fillable = ['name', 'path', 'type'];

    // Optional: Define the table name if it differs from the default (e.g., 'files')
    protected $table = 'files';
}
