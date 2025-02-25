<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Taxonomies extends Model
{
    use HasFactory;

    /**
     *  Specify the fillable attributes to allow mass assignment.
    **/

    protected $fillable = ['title', 'taxonomy_name', 'author', 'singular_name', 'status', 'visibility', 'password', 'description'];

}
