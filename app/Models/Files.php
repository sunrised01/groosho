<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Files extends Model
{
    use HasFactory;

    // Define the fillable attributes for mass assignment
    protected $fillable = ['title', 'name', 'author', 'file_size', 'file_path', 'mime_type', 'thumbnail_path', 'featured_path', 'caption', 'description'];

    // Optional: Define the table name if it differs from the default (e.g., 'files')
    protected $table = 'files';

    public function term()
    {
        return $this->belongsTo(Terms::class, 'attachment_id');
    }
}
