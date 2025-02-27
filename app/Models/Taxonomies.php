<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PostType;

class Taxonomies extends Model
{
    use HasFactory;

    /**
     *  Specify the fillable attributes to allow mass assignment.
    **/

    protected $fillable = ['title', 'taxonomy_name', 'author', 'singular_name', 'status', 'visibility', 'password', 'description'];

     // Define the relationship
     public function postTypes()
     {
         return $this->belongsToMany(PostType::class, 'post_type_taxonomy', 'taxonomy_id', 'post_type_id');
     }

}
