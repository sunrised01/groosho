<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Taxonomies;

class PostType extends Model
{
    use HasFactory;

    /**
     *  Specify the fillable attributes to allow mass assignment.
    **/

    protected $fillable = ['title', 'slug', 'author', 'singular_name', 'supports', 'status', 'visibility', 'password', 'description'];

    // Define the relationship
    public function taxonomies()
    {
        return $this->belongsToMany(Taxonomies::class, 'post_type_taxonomy', 'post_type_id', 'taxonomy_id');
    }
}

